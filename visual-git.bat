@echo off
rem Double-click this to update visual-git and open a repository.
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
    py launcher.py
) else (
    python launcher.py
)

echo.
pause
