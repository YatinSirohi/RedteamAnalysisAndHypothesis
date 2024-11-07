@echo off

REM Start the first Flask server
start cmd /k "cd backend\Internal-Recon\my_flask_app && echo Don't close this terminal && flask run"

REM Start the second Flask server
start cmd /k "cd backend && echo Don't close this terminal && flask run"

REM Start the npm server
start cmd /k "cd frontend && echo Don't close this terminal && npm start"

