@echo off
rem Double-click this to update visual-git and open a repository.
rem pythonw runs the window without a console behind it; start lets this
rem script exit immediately so no command prompt lingers.
cd /d "%~dp0"

where pythonw >nul 2>nul
if %errorlevel%==0 (
    start "" pythonw launcher.py
) else (
    start "" py -w launcher.py
)
