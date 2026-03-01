@echo off
title Nano ImageEdit
cd /d "%~dp0"

:: ── Check if the environment is already set up ──────────────
if exist "%~dp0python312.exe" goto :launch

:: ── First-time setup: license validation + env download ─────
echo.
echo   Starting Nano ImageEdit first-time setup...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0first_time_setup.ps1" -InstallDir "%~dp0"

if %errorlevel% neq 0 (
    echo.
    echo   Setup was cancelled or failed.
    echo.
    pause
    exit /b 1
)

:: Verify python312.exe exists after setup
if not exist "%~dp0python312.exe" (
    echo.
    echo   [ERROR] Setup completed but python312.exe not found.
    echo.
    pause
    exit /b 1
)

:: ── Normal launch ───────────────────────────────────────────
:launch
"%~dp0python312.exe" launch_app.py
if %errorlevel% neq 0 (
    echo.
    echo   Launch exited with error. Check the output above.
    echo.
    pause
)
exit /b %errorlevel%
