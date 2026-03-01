# ============================================================
# Nano ImageEdit - First-Time Setup (no Python required)
#
# Robust setup with:
#   - Resume-capable downloads (picks up from where it left off)
#   - Retry on network failure (auto-retry with backoff)
#   - Integrity checks at every stage
#   - Partial state recovery (detects incomplete env/model)
#   - Keeps system-sleep / network-drop safe
# ============================================================

param([string]$InstallDir)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

if (-not $InstallDir) { $InstallDir = $PSScriptRoot }

$ENV_URL    = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("aHR0cHM6Ly9odWdnaW5nZmFjZS5jby9OYW5jeVd1MTIzNC9pbWFnZS1jcmVzY2VudC9yZXNvbHZlL21haW4vRkxVWF9lbnYuemlw"))
$ENV_ZIP    = Join-Path $InstallDir "NanoEdit_env.zip"
$SERVER     = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("aHR0cHM6Ly9sdW1pbmEtYWktZGVtby52ZXJjZWwuYXBw"))
$PRODUCT_ID = "nano-imageedit"
$KEY_FILE   = Join-Path $InstallDir ".key_validated"
$LOCK_FILE  = Join-Path $InstallDir ".machine_lock"
$SETUP_STATE_FILE = Join-Path $InstallDir ".setup_state"

# Marker files for completed stages
$ENV_MARKER = Join-Path $InstallDir ".env_extracted_ok"

# -- Hardware fingerprint (mirrors machine_lock.py) ----------
function Get-MachineId {
    $parts = @()
    try {
        $mb = (Get-CimInstance Win32_ComputerSystemProduct).UUID
        if ($mb) { $parts += "mb:$mb" }
    } catch {}
    try {
        $cpu = (Get-CimInstance Win32_Processor).ProcessorId
        if ($cpu) { $parts += "cpu:$($cpu.Trim())" }
    } catch {}
    try {
        $disk = (Get-CimInstance Win32_DiskDrive | Select-Object -First 1).SerialNumber
        if ($disk) { $parts += "disk:$($disk.Trim())" }
    } catch {}
    $parts += "host:$([System.Net.Dns]::GetHostName())"

    if ($parts.Count -eq 0) {
        $raw = "fallback:$([System.Net.Dns]::GetHostName()):$($env:USERNAME)"
    } else {
        $raw = $parts -join "|"
    }
    $sha = [System.Security.Cryptography.SHA256]::Create()
    $hash = $sha.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($raw))
    return ($hash | ForEach-Object { $_.ToString("x2") }) -join ""
}

function Get-MachineLabel {
    $name = [System.Net.Dns]::GetHostName()
    $arch = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture
    return "$name (Windows $arch)"
}

# -- JSON helpers (PS 5.1 safe) ------------------------------
function Parse-JsonSafe {
    param([string]$Text)
    try { return ($Text | ConvertFrom-Json) } catch { return $null }
}

function Get-JsonProp {
    param($Obj, [string]$Name)
    if ($null -eq $Obj) { return $null }
    try { return $Obj.$Name } catch { return $null }
}

# -- Server API call -----------------------------------------
function Invoke-LicenseApi {
    param([string]$Endpoint, [hashtable]$Body)
    $url = "$SERVER$Endpoint"
    $json = $Body | ConvertTo-Json -Compress -Depth 5
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    try {
        $req = [System.Net.HttpWebRequest]::Create($url)
        $req.Method = "POST"
        $req.ContentType = "application/json"
        $req.Timeout = 30000
        $stream = $req.GetRequestStream()
        $stream.Write($bytes, 0, $bytes.Length)
        $stream.Close()
        $resp = $req.GetResponse()
        $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
        $rawBody = $reader.ReadToEnd()
        $reader.Close(); $resp.Close()
        return @{ Code = [int]$resp.StatusCode; Body = (Parse-JsonSafe $rawBody); Raw = $rawBody }
    } catch [System.Net.WebException] {
        $ex = $_.Exception
        if ($ex.Response) {
            $reader = New-Object System.IO.StreamReader($ex.Response.GetResponseStream())
            $rawBody = $reader.ReadToEnd(); $reader.Close()
            return @{ Code = [int]$ex.Response.StatusCode; Body = (Parse-JsonSafe $rawBody); Raw = $rawBody }
        }
        return @{ Code = 0; Body = $null; Raw = $ex.Message }
    } catch {
        return @{ Code = 0; Body = $null; Raw = $_.Exception.Message }
    }
}

# -- Resume-capable download with retry (Runspace thread) -----
function Download-WithResume {
    param(
        [string]$Url,
        [string]$OutFile,
        [System.Windows.Forms.Form]$Form,
        [System.Windows.Forms.ProgressBar]$ProgressBar,
        [System.Windows.Forms.Label]$StatusLabel,
        [System.Windows.Forms.Label]$ProgressLabel,
        [int]$MaxRetries = 10
    )

    $attempt = 0
    $backoffSec = 3

    while ($attempt -lt $MaxRetries) {
        $attempt++

        $StatusLabel.Text = if ($attempt -gt 1) { "Retrying download (attempt $attempt/$MaxRetries)..." } else { "Connecting..." }
        $StatusLabel.ForeColor = [System.Drawing.Color]::FromArgb(224, 175, 104)
        $ProgressBar.Value = 0
        $Form.Refresh()

        $existingSize = [long]0
        if (Test-Path $OutFile) {
            $existingSize = (Get-Item $OutFile).Length
            if ($existingSize -gt 0) {
                $StatusLabel.Text = "Resuming from $([math]::Round($existingSize / 1MB, 0)) MB..."
                $Form.Refresh()
            }
        }

        # Shared state for cross-thread communication
        $shared = [hashtable]::Synchronized(@{
            Url = $Url; OutFile = $OutFile; ExistingSize = $existingSize
            Done = $false; Error = $null; Pct = 0; Detail = "Connecting..."
        })

        $runspace = [runspacefactory]::CreateRunspace()
        $runspace.Open()
        $runspace.SessionStateProxy.SetVariable("shared", $shared)

        $ps = [powershell]::Create()
        $ps.Runspace = $runspace
        [void]$ps.AddScript({
            [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
            $dlUrl = $shared.Url
            $dlFile = $shared.OutFile
            $dlExisting = $shared.ExistingSize

            $respObj = $null; $respStream = $null; $fileStream = $null
            try {
                $req = [System.Net.HttpWebRequest]::Create($dlUrl)
                $req.Method = "GET"
                $req.Timeout = 30000
                $req.ReadWriteTimeout = 30000
                $req.AllowAutoRedirect = $true
                $req.UserAgent = "NanoImageEdit-Setup/1.0"

                if ($dlExisting -gt 0) {
                    $req.AddRange([long]$dlExisting)
                    $shared.Detail = "Resuming from $([math]::Round($dlExisting / 1MB, 0)) MB..."
                }

                $respObj = $req.GetResponse()
                $statusCode = [int]$respObj.StatusCode
                $contentLen = $respObj.ContentLength
                $isResume = ($statusCode -eq 206)

                $totalSize = [long]0
                if ($isResume) {
                    $totalSize = $dlExisting + $contentLen
                } else {
                    $dlExisting = [long]0
                    $totalSize = $contentLen
                }

                $respStream = $respObj.GetResponseStream()
                $fMode = if ($isResume) { [System.IO.FileMode]::Append } else { [System.IO.FileMode]::Create }
                $fileStream = New-Object System.IO.FileStream($dlFile, $fMode, [System.IO.FileAccess]::Write)

                $buffer = New-Object byte[] 131072
                $downloaded = $dlExisting
                $sw = [System.Diagnostics.Stopwatch]::StartNew()
                $lastReportMs = [long]0

                while ($true) {
                    $bytesRead = $respStream.Read($buffer, 0, $buffer.Length)
                    if ($bytesRead -le 0) { break }
                    $fileStream.Write($buffer, 0, $bytesRead)
                    $downloaded += $bytesRead

                    $nowMs = $sw.ElapsedMilliseconds
                    if ($nowMs - $lastReportMs -gt 400) {
                        $lastReportMs = $nowMs
                        $pct = if ($totalSize -gt 0) { [int][math]::Floor($downloaded * 100 / $totalSize) } else { 0 }
                        if ($pct -gt 100) { $pct = 100 }
                        $dlMB = [math]::Round($downloaded / 1MB, 0)
                        $totMB = if ($totalSize -gt 0) { [math]::Round($totalSize / 1MB, 0) } else { "?" }
                        $spd = if ($sw.Elapsed.TotalSeconds -gt 2) { [math]::Round(($downloaded - $dlExisting) / $sw.Elapsed.TotalSeconds / 1MB, 1) } else { 0 }
                        $ela = $sw.Elapsed.ToString("hh\:mm\:ss")
                        $shared.Pct = $pct
                        $shared.Detail = "$dlMB MB / $totMB MB  |  $spd MB/s  |  $ela"
                    }
                }

                $fileStream.Close(); $fileStream = $null
                $respStream.Close(); $respStream = $null
                $respObj.Close(); $respObj = $null
                $sw.Stop()

                if ($totalSize -gt 0 -and $downloaded -lt $totalSize) {
                    throw "Incomplete: got $downloaded of $totalSize bytes"
                }
                $shared.Pct = 100
                $shared.Detail = "Download complete!"
                $shared.Done = $true
            } catch {
                try { if ($fileStream) { $fileStream.Close() } } catch {}
                try { if ($respStream) { $respStream.Close() } } catch {}
                try { if ($respObj) { $respObj.Close() } } catch {}
                $shared.Error = $_.Exception.Message
                $shared.Done = $true
            }
        })

        $ps.BeginInvoke() | Out-Null

        # UI polling loop — reads shared state, updates controls
        $lastPct = -1
        while (-not $shared.Done) {
            [System.Windows.Forms.Application]::DoEvents()
            Start-Sleep -Milliseconds 150

            $curPct = $shared.Pct
            if ($curPct -ne $lastPct) {
                $ProgressBar.Value = [math]::Max(0, [math]::Min(100, $curPct))
                $StatusLabel.Text = "Downloading... $curPct%"
                $lastPct = $curPct
            }
            $curDetail = $shared.Detail
            if ($curDetail) { $ProgressLabel.Text = $curDetail }
        }

        $ps.Stop()
        $ps.Dispose()
        $runspace.Close()

        if (-not $shared.Error) {
            if (Test-Path $OutFile) { return $true }
            $shared.Error = "Download completed but file not found."
        }

        if ($attempt -ge $MaxRetries) {
            throw "Download failed after $MaxRetries attempts: $($shared.Error)"
        }

        $waitSec = [math]::Min($backoffSec, 30)
        $StatusLabel.Text = "Download interrupted. Retrying in $waitSec s... (attempt $attempt/$MaxRetries)"
        $StatusLabel.ForeColor = [System.Drawing.Color]::FromArgb(224, 175, 104)
        $ProgressLabel.Text = "Error: $($shared.Error)"
        $Form.Refresh()

        for ($w = 0; $w -lt ($waitSec * 10); $w++) {
            Start-Sleep -Milliseconds 100
            [System.Windows.Forms.Application]::DoEvents()
        }
        $backoffSec = [math]::Min($backoffSec * 2, 30)
    }
    return $false
}

# -- Integrity checks ----------------------------------------
function Test-EnvComplete {
    $pythonExe = Join-Path $InstallDir "python312.exe"
    $marker = Join-Path $InstallDir ".env_extracted_ok"
    if (-not (Test-Path $pythonExe)) { return $false }
    if (-not (Test-Path $marker)) { return $false }
    $libDir = Join-Path $InstallDir "Lib"
    if (-not (Test-Path $libDir)) { return $false }
    return $true
}

function Test-ModelComplete {
    $modelsDir = Join-Path $InstallDir "models"
    $vDat = Join-Path $modelsDir "v.dat"
    return (Test-Path $vDat)
}

function Test-LicenseComplete {
    return (Test-Path $LOCK_FILE)
}

# -- Save/load setup state for resume -----------------------
function Save-SetupState {
    param([string]$Stage, [string]$LicenseKey)
    $state = @{
        stage = $Stage
        has_key = [bool]$LicenseKey
        timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    } | ConvertTo-Json
    [System.IO.File]::WriteAllText($SETUP_STATE_FILE, $state, (New-Object System.Text.UTF8Encoding $false))
}

function Load-SetupState {
    if (-not (Test-Path $SETUP_STATE_FILE)) { return $null }
    try {
        $raw = Get-Content $SETUP_STATE_FILE -Raw
        return Parse-JsonSafe $raw
    } catch { return $null }
}

function Clear-SetupState {
    Remove-Item $SETUP_STATE_FILE -Force -ErrorAction SilentlyContinue
}

function Secure-DeleteFile {
    param([string]$Path)
    if (-not (Test-Path $Path)) { return }
    try {
        $len = (Get-Item $Path).Length
        $zeros = New-Object byte[] $len
        [System.IO.File]::WriteAllBytes($Path, $zeros)
    } catch {}
    Remove-Item $Path -Force -ErrorAction SilentlyContinue
}

# -- WinForms GUI --------------------------------------------
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

function Show-SetupForm {
    $form = New-Object System.Windows.Forms.Form
    $form.Text = "Nano ImageEdit - Setup"
    $form.Size = New-Object System.Drawing.Size(520, 420)
    $form.StartPosition = "CenterScreen"
    $form.FormBorderStyle = "FixedDialog"
    $form.MaximizeBox = $false
    $form.BackColor = [System.Drawing.Color]::FromArgb(26, 27, 38)
    $form.ForeColor = [System.Drawing.Color]::FromArgb(192, 202, 245)
    $form.Font = New-Object System.Drawing.Font("Segoe UI", 10)

    $iconPath = Join-Path $InstallDir "flux_engine.ico"
    if (Test-Path $iconPath) {
        try { $form.Icon = New-Object System.Drawing.Icon($iconPath) } catch {}
    }

    $titleLabel = New-Object System.Windows.Forms.Label
    $titleLabel.Text = "Nano ImageEdit - First-Time Setup"
    $titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
    $titleLabel.ForeColor = [System.Drawing.Color]::FromArgb(122, 162, 247)
    $titleLabel.AutoSize = $true
    $titleLabel.Location = New-Object System.Drawing.Point(30, 20)
    $form.Controls.Add($titleLabel)

    $subLabel = New-Object System.Windows.Forms.Label
    $subLabel.Text = "Enter your license key to begin installation."
    $subLabel.AutoSize = $true
    $subLabel.Location = New-Object System.Drawing.Point(30, 55)
    $form.Controls.Add($subLabel)

    $keyLabel = New-Object System.Windows.Forms.Label
    $keyLabel.Text = "License Key:"
    $keyLabel.AutoSize = $true
    $keyLabel.Location = New-Object System.Drawing.Point(30, 95)
    $form.Controls.Add($keyLabel)

    $keyBox = New-Object System.Windows.Forms.TextBox
    $keyBox.Font = New-Object System.Drawing.Font("Consolas", 13)
    $keyBox.Location = New-Object System.Drawing.Point(30, 120)
    $keyBox.Size = New-Object System.Drawing.Size(440, 30)
    $keyBox.BackColor = [System.Drawing.Color]::FromArgb(36, 40, 59)
    $keyBox.ForeColor = [System.Drawing.Color]::FromArgb(192, 202, 245)
    $keyBox.BorderStyle = "FixedSingle"
    $keyBox.TextAlign = "Center"
    $form.Controls.Add($keyBox)

    $statusLabel = New-Object System.Windows.Forms.Label
    $statusLabel.Text = ""
    $statusLabel.Location = New-Object System.Drawing.Point(30, 160)
    $statusLabel.Size = New-Object System.Drawing.Size(440, 40)
    $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(192, 202, 245)
    $form.Controls.Add($statusLabel)

    $progressBar = New-Object System.Windows.Forms.ProgressBar
    $progressBar.Location = New-Object System.Drawing.Point(30, 210)
    $progressBar.Size = New-Object System.Drawing.Size(440, 25)
    $progressBar.Style = "Continuous"
    $progressBar.Visible = $false
    $form.Controls.Add($progressBar)

    $progressLabel = New-Object System.Windows.Forms.Label
    $progressLabel.Text = ""
    $progressLabel.Location = New-Object System.Drawing.Point(30, 240)
    $progressLabel.Size = New-Object System.Drawing.Size(440, 25)
    $progressLabel.ForeColor = [System.Drawing.Color]::FromArgb(150, 160, 200)
    $progressLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $progressLabel.Visible = $false
    $form.Controls.Add($progressLabel)

    $activateBtn = New-Object System.Windows.Forms.Button
    $activateBtn.Text = "Activate && Install"
    $activateBtn.Size = New-Object System.Drawing.Size(160, 38)
    $activateBtn.Location = New-Object System.Drawing.Point(130, 280)
    $activateBtn.BackColor = [System.Drawing.Color]::FromArgb(122, 162, 247)
    $activateBtn.ForeColor = [System.Drawing.Color]::FromArgb(26, 27, 38)
    $activateBtn.FlatStyle = "Flat"
    $activateBtn.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $form.Controls.Add($activateBtn)

    $quitBtn = New-Object System.Windows.Forms.Button
    $quitBtn.Text = "Quit"
    $quitBtn.Size = New-Object System.Drawing.Size(90, 38)
    $quitBtn.Location = New-Object System.Drawing.Point(310, 280)
    $quitBtn.BackColor = [System.Drawing.Color]::FromArgb(50, 55, 75)
    $quitBtn.ForeColor = [System.Drawing.Color]::FromArgb(192, 202, 245)
    $quitBtn.FlatStyle = "Flat"
    $form.Controls.Add($quitBtn)

    $bottomLabel = New-Object System.Windows.Forms.Label
    $bottomLabel.Text = ""
    $bottomLabel.Location = New-Object System.Drawing.Point(30, 335)
    $bottomLabel.Size = New-Object System.Drawing.Size(440, 40)
    $bottomLabel.ForeColor = [System.Drawing.Color]::FromArgb(150, 160, 200)
    $bottomLabel.Font = New-Object System.Drawing.Font("Segoe UI", 8.5)
    $form.Controls.Add($bottomLabel)

    $result = @{ Success = $false }

    $quitBtn.Add_Click({ $form.Close() })
    $keyBox.Add_KeyDown({ if ($_.KeyCode -eq "Return") { $activateBtn.PerformClick() } })

    # -- Detect resume state on form load --
    $savedState = Load-SetupState
    if ($savedState) {
        $savedKey = Get-JsonProp $savedState "license_key"
        if ($savedKey) { $keyBox.Text = $savedKey }
    }

    # If license is already done, skip to env/model and auto-start
    $skipLicense = (Test-LicenseComplete) -or (Test-Path $KEY_FILE)
    if ($skipLicense) {
        $subLabel.Text = "Resuming installation..."
        $keyBox.Visible = $false
        $keyLabel.Visible = $false
    }

    # -- Main pipeline function (can be called for initial or resume) --
    $runPipeline = {
        param([string]$LicenseKey)

        $activateBtn.Enabled = $false
        $quitBtn.Enabled = $false
        $keyBox.Enabled = $false

        $enableAndReturn = {
            $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(247, 118, 142)
            $activateBtn.Enabled = $true
            $quitBtn.Enabled = $true
            $keyBox.Enabled = $true
            $activateBtn.Text = "Retry"
        }

        # ============================================================
        # STAGE 1: License activation (skip if already done)
        # ============================================================
        if (-not (Test-LicenseComplete) -and -not (Test-Path $KEY_FILE)) {
            if (-not $LicenseKey) {
                $statusLabel.Text = "Please enter a license key."
                $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(247, 118, 142)
                & $enableAndReturn
                return
            }

            $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(224, 175, 104)
            $statusLabel.Text = "Validating license key..."
            $form.Refresh()

            $machineId = Get-MachineId
            $machineLabel = Get-MachineLabel

            $resp = Invoke-LicenseApi -Endpoint "/api/license/activate" -Body @{
                license_key    = $LicenseKey
                machine_id     = $machineId
                machine_label  = $machineLabel
                product_id     = $PRODUCT_ID
                force_takeover = $false
            }

            $rBody = $resp.Body
            $rStatus = Get-JsonProp $rBody "status"
            $rError = Get-JsonProp $rBody "error"
            $rMessage = Get-JsonProp $rBody "message"

            if ($resp.Code -eq 200 -and $rStatus -eq "activated") {
                $statusLabel.Text = "License validated!"
                $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(158, 206, 106)
                $form.Refresh()

                $keyJson = @{
                    license_key          = $LicenseKey.ToUpper()
                    machine_id           = $machineId
                    license_id           = Get-JsonProp $rBody "license_id"
                    product_id           = Get-JsonProp $rBody "product_id"
                    encrypted_master_key = Get-JsonProp $rBody "encrypted_master_key"
                    validated_at         = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
                } | ConvertTo-Json
                [System.IO.File]::WriteAllText($KEY_FILE, $keyJson, (New-Object System.Text.UTF8Encoding $false))
                Save-SetupState -Stage "license_done" -LicenseKey $LicenseKey

            } elseif ($resp.Code -eq 409) {
                $msg = if ($rMessage) { $rMessage } else { "Activation limit reached." }
                $answer = [System.Windows.Forms.MessageBox]::Show(
                    "$msg`n`nDo you want to deactivate all other machines and bind this one?",
                    "Activation Limit",
                    [System.Windows.Forms.MessageBoxButtons]::YesNo,
                    [System.Windows.Forms.MessageBoxIcon]::Question
                )
                if ($answer -eq "Yes") {
                    $statusLabel.Text = "Force takeover in progress..."
                    $form.Refresh()
                    $resp2 = Invoke-LicenseApi -Endpoint "/api/license/activate" -Body @{
                        license_key    = $LicenseKey
                        machine_id     = $machineId
                        machine_label  = $machineLabel
                        product_id     = $PRODUCT_ID
                        force_takeover = $true
                    }
                    $r2Body = $resp2.Body
                    $r2Status = Get-JsonProp $r2Body "status"
                    if ($resp2.Code -eq 200 -and $r2Status -eq "activated") {
                        $statusLabel.Text = "License validated (previous machines deactivated)!"
                        $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(158, 206, 106)
                        $form.Refresh()
                        $keyJson2 = @{
                            license_key          = $LicenseKey.ToUpper()
                            machine_id           = $machineId
                            license_id           = Get-JsonProp $r2Body "license_id"
                            product_id           = Get-JsonProp $r2Body "product_id"
                            encrypted_master_key = Get-JsonProp $r2Body "encrypted_master_key"
                            validated_at         = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
                        } | ConvertTo-Json
                        [System.IO.File]::WriteAllText($KEY_FILE, $keyJson2, (New-Object System.Text.UTF8Encoding $false))
                        Save-SetupState -Stage "license_done" -LicenseKey $LicenseKey
                    } else {
                        $r2Msg = Get-JsonProp $r2Body "message"
                        $r2Err = Get-JsonProp $r2Body "error"
                        $statusLabel.Text = if ($r2Msg) { $r2Msg } elseif ($r2Err) { $r2Err } else { "Force takeover failed." }
                        & $enableAndReturn; return
                    }
                } else {
                    $statusLabel.Text = "Activation cancelled."
                    & $enableAndReturn; return
                }
            } elseif ($resp.Code -eq 404) {
                $statusLabel.Text = "Invalid license key."
                & $enableAndReturn; return
            } elseif ($resp.Code -eq 0) {
                $statusLabel.Text = "Cannot reach activation server. Check your internet."
                & $enableAndReturn; return
            } else {
                $statusLabel.Text = if ($rError) { $rError } elseif ($rMessage) { $rMessage } else { "Server returned $($resp.Code)" }
                & $enableAndReturn; return
            }
        } else {
            $statusLabel.Text = "License already validated."
            $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(158, 206, 106)
            $form.Refresh()
        }

        # ============================================================
        # STAGE 2: Download env zip (skip if env already complete)
        # ============================================================
        if (-not (Test-EnvComplete)) {
            Start-Sleep -Milliseconds 300
            $statusLabel.Text = "Downloading environment package..."
            $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(224, 175, 104)
            $progressBar.Visible = $true
            $progressBar.Value = 0
            $progressLabel.Visible = $true
            $progressLabel.Text = "Connecting..."
            $bottomLabel.Text = "This is a one-time download (~2.5 GB). The download will resume if interrupted."
            $form.Refresh()

            # Check if we already have a valid zip
            $needDownload = $true
            if (Test-Path $ENV_ZIP) {
                $zipSize = (Get-Item $ENV_ZIP).Length
                if ($zipSize -gt 100MB) {
                    try {
                        Add-Type -AssemblyName System.IO.Compression.FileSystem
                        $testArchive = [System.IO.Compression.ZipFile]::OpenRead($ENV_ZIP)
                        $entryCount = $testArchive.Entries.Count
                        $testArchive.Dispose()
                        if ($entryCount -gt 0) {
                            $needDownload = $false
                            $statusLabel.Text = "Environment zip already downloaded ($([math]::Round($zipSize / 1MB, 0)) MB)"
                            $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(158, 206, 106)
                            $form.Refresh()
                        }
                    } catch {
                        # Zip is corrupt or incomplete - will resume download
                    }
                }
            }

            if ($needDownload) {
                try {
                    Download-WithResume -Url $ENV_URL -OutFile $ENV_ZIP `
                        -Form $form -ProgressBar $progressBar `
                        -StatusLabel $statusLabel -ProgressLabel $progressLabel `
                        -MaxRetries 10

                    if (-not (Test-Path $ENV_ZIP)) { throw "Download completed but file not found." }
                    $sizeMB = [math]::Round((Get-Item $ENV_ZIP).Length / 1MB, 0)
                    $statusLabel.Text = "Download complete ($sizeMB MB)"
                    $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(158, 206, 106)
                    $form.Refresh()
                } catch {
                    $statusLabel.Text = "Download failed: $($_.Exception.Message)"
                    $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(247, 118, 142)
                    $progressLabel.Text = ""
                    $bottomLabel.Text = "Click Retry to resume the download from where it stopped."
                    & $enableAndReturn; return
                }
            }

            # -- STAGE 3: Extract env --
            Start-Sleep -Milliseconds 300
            $statusLabel.Text = "Extracting environment (this takes a few minutes)..."
            $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(224, 175, 104)
            $progressBar.Value = 0
            $progressLabel.Text = "Opening archive..."
            $bottomLabel.Text = "Extracting files. Please wait..."
            $form.Refresh()

            try {
                Add-Type -AssemblyName System.IO.Compression.FileSystem
                $archive = [System.IO.Compression.ZipFile]::OpenRead($ENV_ZIP)
                $total = $archive.Entries.Count
                $count = 0
                $lastPct = -1

                foreach ($entry in $archive.Entries) {
                    $count++
                    $pct = [math]::Floor($count * 100 / $total)
                    if ($pct -ne $lastPct) {
                        $lastPct = $pct
                        $progressBar.Value = $pct
                        $progressLabel.Text = "$count / $total files  ($pct%)"
                        $statusLabel.Text = "Extracting... $pct%"
                        [System.Windows.Forms.Application]::DoEvents()
                    }
                    $targetPath = Join-Path $InstallDir $entry.FullName
                    $targetDir = Split-Path $targetPath -Parent
                    if (-not (Test-Path $targetDir)) {
                        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
                    }
                    if ($entry.Name -ne "") {
                        [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $targetPath, $true)
                    }
                }
                $archive.Dispose()

                # Write marker to confirm extraction completed fully
                [System.IO.File]::WriteAllText($ENV_MARKER, "ok", (New-Object System.Text.UTF8Encoding $false))

                $statusLabel.Text = "Extraction complete!"
                $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(158, 206, 106)
                $progressBar.Value = 100
                $form.Refresh()
            } catch {
                $statusLabel.Text = "Extraction failed: $($_.Exception.Message)"
                $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(247, 118, 142)
                $bottomLabel.Text = "Click Retry to try again."
                # Remove marker so we know extraction is incomplete
                Remove-Item $ENV_MARKER -Force -ErrorAction SilentlyContinue
                & $enableAndReturn; return
            }

            # Cleanup zip after successful extraction
            Remove-Item $ENV_ZIP -Force -ErrorAction SilentlyContinue
        } else {
            $statusLabel.Text = "Python environment already installed."
            $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(158, 206, 106)
            $progressBar.Visible = $true
            $progressBar.Value = 100
            $progressLabel.Visible = $true
            $progressLabel.Text = "Skipped (already complete)"
            $form.Refresh()
        }

        $pythonExe = Join-Path $InstallDir "python312.exe"
        if (-not (Test-Path $pythonExe)) {
            $statusLabel.Text = "Error: python312.exe not found after extraction."
            $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(247, 118, 142)
            $bottomLabel.Text = "The environment archive may have an unexpected structure."
            # Remove marker so next retry re-extracts
            Remove-Item $ENV_MARKER -Force -ErrorAction SilentlyContinue
            & $enableAndReturn; return
        }

        # ============================================================
        # STAGE 4: Complete license activation (create .machine_lock)
        # ============================================================
        if (-not (Test-LicenseComplete)) {
            $statusLabel.Text = "Completing license activation..."
            $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(224, 175, 104)
            $progressBar.Value = 0
            $progressLabel.Text = ""
            $form.Refresh()

            $activateScript = @"
import sys, os, json, time
sys.path.insert(0, sys.argv[1])
os.chdir(sys.argv[1])
kf = os.path.join(sys.argv[1], '.key_validated')
if not os.path.isfile(kf):
    print('NO_KEY_FILE')
    sys.exit(1)
with open(kf, 'r', encoding='utf-8-sig') as f:
    data = json.load(f)
lk = data.get('license_key','')
emk = data.get('encrypted_master_key','')
mid = data.get('machine_id','')
if not (lk and emk and mid):
    print('MISSING_FIELDS')
    sys.exit(1)
import machine_lock
mk = machine_lock._decrypt_master_key(emk, mid)
machine_lock._save_lock({
    'license_key': lk, 'machine_id': mid,
    'license_id': data.get('license_id'),
    'product_id': data.get('product_id'),
    'master_key': mk,
    'activated_at': data.get('validated_at', time.time()),
    'last_verified': time.time(),
})
os.remove(kf)
print('OK')
"@
            $activateScriptFile = Join-Path $InstallDir "_activate_tmp.py"
            [System.IO.File]::WriteAllText($activateScriptFile, $activateScript, (New-Object System.Text.UTF8Encoding $false))

            try {
                $activateResult = & $pythonExe $activateScriptFile $InstallDir 2>&1
                $activateOutput = ($activateResult | Out-String).Trim()
                Secure-DeleteFile $activateScriptFile
                if ($activateOutput -ne "OK") {
                    throw "Activation completion returned: $activateOutput"
                }
                Secure-DeleteFile $KEY_FILE
                $statusLabel.Text = "License activation complete!"
                $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(158, 206, 106)
                $form.Refresh()
            } catch {
                Secure-DeleteFile $activateScriptFile
                $statusLabel.Text = "License activation failed: $($_.Exception.Message)"
                $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(247, 118, 142)
                $bottomLabel.Text = "Click Retry to try again."
                & $enableAndReturn; return
            }
        } else {
            $statusLabel.Text = "License activation already complete."
            $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(158, 206, 106)
            $form.Refresh()
        }

        # ============================================================
        # STAGE 5: Download and encrypt model (skip if already done)
        # ============================================================
        if (-not (Test-ModelComplete)) {
            Start-Sleep -Milliseconds 300
            $statusLabel.Text = "Downloading AI model (~8 GB, this may take a while)..."
            $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(224, 175, 104)
            $progressBar.Value = 0
            $progressBar.Visible = $true
            $progressLabel.Text = "Starting model download..."
            $progressLabel.Visible = $true
            $bottomLabel.Text = "One-time model download and setup. Please keep this window open."
            $form.Refresh()

            $modelSetupScript = Join-Path $InstallDir "model_setup.py"
            $statusFile = Join-Path $InstallDir ".download_status"

            if (-not (Test-Path $modelSetupScript)) {
                $statusLabel.Text = "Error: model_setup.py not found."
                $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(247, 118, 142)
                & $enableAndReturn; return
            }

            # Clean up any incomplete model directory before retrying
            $modelsDir = Join-Path $InstallDir "models"
            $vDat = Join-Path $modelsDir "v.dat"
            if ((Test-Path $modelsDir) -and -not (Test-Path $vDat)) {
                $statusLabel.Text = "Cleaning incomplete model files..."
                $form.Refresh()
                Remove-Item $modelsDir -Recurse -Force -ErrorAction SilentlyContinue
                Start-Sleep -Milliseconds 500
            }

            $modelProc = Start-Process -FilePath $pythonExe `
                -ArgumentList "-u `"$modelSetupScript`"" `
                -WorkingDirectory $InstallDir -WindowStyle Hidden -PassThru `
                -RedirectStandardOutput (Join-Path $InstallDir "model_download.log") `
                -RedirectStandardError (Join-Path $InstallDir "model_download_err.log")

            $lastMessage = ""
            while (-not $modelProc.HasExited) {
                [System.Windows.Forms.Application]::DoEvents()
                Start-Sleep -Milliseconds 500

                if (Test-Path $statusFile) {
                    try {
                        $statusJson = Get-Content $statusFile -Raw -ErrorAction SilentlyContinue
                        if ($statusJson) {
                            $st = Parse-JsonSafe $statusJson
                            if ($st) {
                                $pct = [math]::Floor((Get-JsonProp $st "progress") * 100)
                                if ($pct -lt 0) { $pct = 0 }
                                if ($pct -gt 100) { $pct = 100 }
                                $progressBar.Value = $pct
                                $stMsg = Get-JsonProp $st "message"
                                if ($stMsg -and $stMsg -ne $lastMessage) {
                                    $statusLabel.Text = $stMsg
                                    $lastMessage = $stMsg
                                }
                                $detail = Get-JsonProp $st "detail"
                                if ($detail) {
                                    $progressLabel.Text = "$pct%  |  $detail"
                                } else {
                                    $progressLabel.Text = "$pct%"
                                }
                            }
                        }
                    } catch {}
                }
            }

            Remove-Item $statusFile -Force -ErrorAction SilentlyContinue

            if ($modelProc.ExitCode -ne 0) {
                $errLog = ""
                $errLogFile = Join-Path $InstallDir "model_download_err.log"
                if (Test-Path $errLogFile) {
                    $errLog = (Get-Content $errLogFile -Raw -ErrorAction SilentlyContinue)
                    if ($errLog.Length -gt 300) { $errLog = $errLog.Substring($errLog.Length - 300) }
                }
                $statusLabel.Text = "Model download failed."
                $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(247, 118, 142)
                $progressLabel.Text = ""
                $bottomLabel.Text = "Click Retry to resume. The download will pick up where it left off."
                & $enableAndReturn; return
            }

            # Verify model is actually complete
            if (-not (Test-ModelComplete)) {
                $statusLabel.Text = "Model download finished but model is incomplete."
                $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(247, 118, 142)
                $bottomLabel.Text = "Click Retry to re-download the model."
                & $enableAndReturn; return
            }
        } else {
            $statusLabel.Text = "AI model already downloaded."
            $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(158, 206, 106)
            $form.Refresh()
        }

        # ============================================================
        # ALL DONE
        # ============================================================
        Clear-SetupState
        $statusLabel.Text = "Setup complete! Launching Nano ImageEdit..."
        $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(158, 206, 106)
        $progressBar.Value = 100
        $progressBar.Visible = $false
        $progressLabel.Visible = $false
        $bottomLabel.Text = ""
        $form.Refresh()
        Start-Sleep -Seconds 2

        $result.Success = $true
        $form.Close()
    }

    $activateBtn.Add_Click({
        $key = $keyBox.Text.Trim()
        & $runPipeline $key
    })

    # Auto-start pipeline if resuming (license already done)
    $form.Add_Shown({
        $keyBox.Focus()
        if ($skipLicense) {
            $savedKey = ""
            if ($savedState) { $savedKey = Get-JsonProp $savedState "license_key" }
            $form.BeginInvoke([Action]{ & $runPipeline $savedKey })
        }
    })

    [void]$form.ShowDialog()
    return $result.Success
}

# -- Main ----------------------------------------------------
$ok = Show-SetupForm
if ($ok) { exit 0 } else { exit 1 }
