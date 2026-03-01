@echo off
cd /d "%~dp0"
set PATH=C:\mingw64\bin;%PATH%
if not exist build mkdir build

echo Compiling Nano ImageEdit...
C:\mingw64\bin\g++.exe -std=c++17 -O2 -DUNICODE -D_UNICODE -DWIN32_LEAN_AND_MEAN -DNOMINMAX -mwindows -municode "src\main.cpp" -o "build\NanoImageEdit.exe" -lcomctl32 -lwininet -lgdiplus -lshell32 -lole32 -luxtheme -lcomdlg32 -static-libgcc -static-libstdc++ -static -lpthread >build\compile_log.txt 2>&1
set EXITCODE=%errorlevel%
type build\compile_log.txt
if %EXITCODE% neq 0 (
    echo.
    echo BUILD FAILED [exit code %EXITCODE%]
    exit /b 1
)
if exist "build\NanoImageEdit.exe" (
    echo.
    echo BUILD OK
    for %%F in (build\NanoImageEdit.exe) do echo Output: %%~fF [%%~zF bytes]
) else (
    echo BUILD FAILED - no output file
    exit /b 1
)
