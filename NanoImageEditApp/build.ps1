# Build script for FLUX.2 Klein native app
$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$SrcDir = Join-Path $ProjectRoot "src"
$ResDir = Join-Path $ProjectRoot "res"
$OutDir = Join-Path $ProjectRoot "build"

$GCC = "C:\mingw64\bin\g++.exe"
$WINDRES = "C:\mingw64\bin\windres.exe"

if (-not (Test-Path $GCC)) {
    Write-Host "ERROR: g++ not found at $GCC" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir -Force | Out-Null }

# Copy icon to res/ if not there
$iconSrc = Join-Path $ProjectRoot "..\flux2klein_package\flux_engine.ico"
$iconDst = Join-Path $ResDir "flux_engine.ico"
if ((Test-Path $iconSrc) -and -not (Test-Path $iconDst)) {
    Copy-Item $iconSrc $iconDst -Force
}

Write-Host "  Compiling resources..." -ForegroundColor Cyan
$resObj = Join-Path $OutDir "app.res.o"
& $WINDRES -i (Join-Path $ResDir "app.rc") -o $resObj -I $ResDir
if ($LASTEXITCODE -ne 0) { Write-Host "Resource compilation failed" -ForegroundColor Red; exit 1 }

Write-Host "  Compiling C++ source..." -ForegroundColor Cyan
$mainCpp = Join-Path $SrcDir "main.cpp"
$exeOut = Join-Path $OutDir "FluxKlein.exe"

$args = @(
    "-std=c++17", "-O2", "-DUNICODE", "-D_UNICODE", "-DWIN32_LEAN_AND_MEAN", "-DNOMINMAX",
    "-mwindows",
    $mainCpp, $resObj,
    "-o", $exeOut,
    "-lcomctl32", "-lwininet", "-lgdiplus", "-lshell32", "-lole32", "-luxtheme", "-lcomdlg32",
    "-static-libgcc", "-static-libstdc++", "-static",
    "-Wl``,--subsystem``,windows"
)
& $GCC @args

if ($LASTEXITCODE -ne 0) {
    Write-Host "  Compilation FAILED" -ForegroundColor Red
    exit 1
}

$size = [math]::Round((Get-Item $exeOut).Length / 1KB, 0)
Write-Host ""
Write-Host "  Build successful!" -ForegroundColor Green
Write-Host "  Output: $exeOut ($size KB)" -ForegroundColor White
Write-Host ""
