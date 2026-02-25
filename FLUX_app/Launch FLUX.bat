@echo off
title FLUX.2 Klein
cd /d "%~dp0"

:: Use the bundled python312.exe (portable, all deps in Lib/)
if exist "%~dp0python312.exe" (
    "%~dp0python312.exe" launch_app.py
    if %errorlevel% neq 0 (
        echo.
        echo   Launch exited with error. Check the output above.
        echo.
        pause
    )
    exit /b %errorlevel%
)

echo.
echo   [ERROR] python312.exe not found in this folder.
echo.
pause
exit /b 1
