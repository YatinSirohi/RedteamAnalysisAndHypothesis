@echo off

REM Install Python packages
start cmd /k "cd backend && pip install python-nmap nvdlib pyxploitdb flask flask_cors nltk && echo Python packages have been installed"

REM Install Node packages
start cmd /k "npm i && echo Node packages have been installed"
