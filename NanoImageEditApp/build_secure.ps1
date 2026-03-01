# ============================================================
# Nano ImageEdit — Secure Build Pipeline
#
# This script:
#   1. Compiles all sensitive Python files to .pyd using Nuitka
#   2. Builds the C++ native app (NanoImageEdit.exe)
#   3. Runs Inno Setup to create the installer
#
# Prerequisites:
#   - Python 3.12 with Nuitka installed: pip install nuitka
#   - Inno Setup 6 installed
#   - (gcc is auto-downloaded by Nuitka if missing)
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File build_secure.ps1
# ============================================================

param(
    [switch]$SkipNuitka,
    [switch]$SkipCpp,
    [switch]$SkipInstaller
)

$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$SourceBase = Join-Path $ScriptDir "..\flux2klein_package"
$BuildDir = Join-Path $ScriptDir "build"
$StagingDir = Join-Path $ScriptDir "staging"
$NuitkaBuildDir = Join-Path $ScriptDir "_nuitka_build"

Write-Host ""
Write-Host "  ================================================" -ForegroundColor Cyan
Write-Host "    Nano ImageEdit — Secure Build Pipeline" -ForegroundColor Cyan
Write-Host "  ================================================" -ForegroundColor Cyan
Write-Host ""

New-Item -ItemType Directory -Path $BuildDir -Force | Out-Null
New-Item -ItemType Directory -Path $StagingDir -Force | Out-Null
New-Item -ItemType Directory -Path $NuitkaBuildDir -Force | Out-Null

# ============================================================
# STEP 1: Compile Python modules with Nuitka
# ============================================================
if (-not $SkipNuitka) {
    Write-Host "  [1/3] Compiling Python modules with Nuitka..." -ForegroundColor Yellow
    Write-Host ""

    $pythonModules = @(
        "engine_crypto.py",
        "machine_lock.py",
        "key_vault.py",
        "runner.py",
        "model_setup.py",
        "flux_app.py",
        "launch_app.py",
        "test.py"
    )

    foreach ($mod in $pythonModules) {
        $srcFile = Join-Path $SourceBase $mod
        if (-not (Test-Path $srcFile)) {
            Write-Host "    SKIP: $mod (not found)" -ForegroundColor DarkGray
            continue
        }

        $modName = [System.IO.Path]::GetFileNameWithoutExtension($mod)
        Write-Host "    Compiling $mod -> $modName.pyd ..." -ForegroundColor White

        # Copy to isolated build dir to avoid Nuitka std-lib detection issues
        $buildCopy = Join-Path $NuitkaBuildDir $mod
        Copy-Item $srcFile $buildCopy -Force

        & python -m nuitka --module --assume-yes-for-downloads `
            --output-dir="$NuitkaBuildDir" "$buildCopy"

        if ($LASTEXITCODE -ne 0) {
            Write-Host "    ERROR: Nuitka compilation failed for $mod" -ForegroundColor Red
            exit 1
        }

        $pydFile = Get-ChildItem -Path $NuitkaBuildDir -Filter "$modName*.pyd" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($pydFile) {
            Copy-Item $pydFile.FullName (Join-Path $StagingDir $pydFile.Name) -Force
            Write-Host "    OK: $($pydFile.Name)" -ForegroundColor Green
        } else {
            Write-Host "    ERROR: .pyd not produced for $modName" -ForegroundColor Red
            exit 1
        }
    }

    # Copy launcher stubs
    $stubs = @("run_runner.py", "run_app.py")
    foreach ($stub in $stubs) {
        $src = Join-Path $SourceBase $stub
        if (Test-Path $src) {
            Copy-Item $src (Join-Path $StagingDir $stub) -Force
        }
    }

    # Copy non-sensitive files
    $plainFiles = @(
        "sitecustomize.py",
        "test.py",
        "local_models.yaml",
        "requirements.txt",
        "README.md",
        "first_time_setup.ps1",
        "Launch NanoEdit.bat",
        "Launch NanoEdit.vbs"
    )

    foreach ($f in $plainFiles) {
        $src = Join-Path $SourceBase $f
        if (Test-Path $src) {
            Copy-Item $src (Join-Path $StagingDir $f) -Force
        }
    }

    # Copy web UI
    $webSrc = Join-Path $SourceBase "webbbbbbb"
    $webDst = Join-Path $StagingDir "webbbbbbb"
    if (Test-Path $webSrc) {
        New-Item -ItemType Directory -Path $webDst -Force | Out-Null
        Copy-Item (Join-Path $webSrc "*") $webDst -Force -ErrorAction SilentlyContinue
    }

    Write-Host ""
    Write-Host "    Python compilation complete!" -ForegroundColor Green
    Write-Host ""
}

# ============================================================
# STEP 2: Build C++ native app
# ============================================================
if (-not $SkipCpp) {
    Write-Host "  [2/3] Building C++ native app..." -ForegroundColor Yellow

    # Try Nuitka-cached gcc first, then system PATH
    $gpp = Get-ChildItem "$env:LOCALAPPDATA\Nuitka\Nuitka\Cache\downloads\gcc" `
        -Recurse -Filter "g++.exe" -ErrorAction SilentlyContinue |
        Select-Object -First 1 |
        ForEach-Object { $_.FullName }

    if (-not $gpp) { $gpp = "g++.exe" }

    $windres = Join-Path (Split-Path $gpp) "windres.exe"
    if (-not (Test-Path $windres)) { $windres = "windres.exe" }

    $cppSrc = Join-Path $ScriptDir "src\main.cpp"
    $exeOut = Join-Path $BuildDir "NanoImageEdit.exe"

    # Compile resource file (from res/ directory for relative paths)
    $resObj = Join-Path $BuildDir "app_res.o"
    Push-Location (Join-Path $ScriptDir "res")
    & $windres "app.rc" -o $resObj
    $rcExit = $LASTEXITCODE
    Pop-Location

    if ($rcExit -ne 0) {
        Write-Host "    WARN: windres failed, building without manifest" -ForegroundColor Yellow
        & $gpp -std=c++17 -O2 -DNDEBUG -mwindows -municode -static `
            $cppSrc -o $exeOut `
            -lcomctl32 -lwininet -lgdiplus -lshell32 -lole32 -luxtheme -lcomdlg32 `
            -Wl,--gc-sections -s
    } else {
        & $gpp -std=c++17 -O2 -DNDEBUG -mwindows -municode -static `
            $cppSrc $resObj -o $exeOut `
            -lcomctl32 -lwininet -lgdiplus -lshell32 -lole32 -luxtheme -lcomdlg32 `
            -Wl,--gc-sections -s
    }

    if ($LASTEXITCODE -ne 0) {
        Write-Host "    ERROR: C++ compilation failed" -ForegroundColor Red
        exit 1
    }

    Write-Host "    OK: NanoImageEdit.exe" -ForegroundColor Green
    Write-Host ""
}

# ============================================================
# STEP 3: Build installer with Inno Setup
# ============================================================
if (-not $SkipInstaller) {
    Write-Host "  [3/3] Building installer..." -ForegroundColor Yellow

    $issFile = Join-Path $ScriptDir "installer_secure.iss"
    if (-not (Test-Path $issFile)) {
        Write-Host "    ERROR: installer_secure.iss not found" -ForegroundColor Red
        exit 1
    }

    $iscc = "C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
    if (-not (Test-Path $iscc)) { $iscc = "ISCC.exe" }

    & $iscc $issFile

    if ($LASTEXITCODE -ne 0) {
        Write-Host "    ERROR: Inno Setup failed" -ForegroundColor Red
        exit 1
    }

    Write-Host "    OK: Installer built!" -ForegroundColor Green
    Write-Host ""
}

Write-Host "  ================================================" -ForegroundColor Cyan
Write-Host "    Build complete!" -ForegroundColor Green
Write-Host "  ================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Output: dist\NanoImageEdit_Setup.exe" -ForegroundColor White
Write-Host ""
