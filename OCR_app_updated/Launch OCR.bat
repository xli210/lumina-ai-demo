@echo off
title OCR Engine
cd /d "%~dp0"

:: Use the bundled python312.exe (packaged by BUILD.bat)
if exist "%~dp0python312.exe" (
    start "" "%~dp0python312.exe" launch_app.py
    exit
)

echo.
echo   [ERROR] python312.exe not found.
echo.
echo   This folder has not been built yet.
echo   Run BUILD.bat first to download Python + packages.
echo.
pause
exit /b 1
