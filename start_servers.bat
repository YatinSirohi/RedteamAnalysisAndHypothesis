
REM Start the first Flask server
start cmd /k "cd backend\Internal-Recon\my_flask_app && flask run"

REM Start the second Flask server
start cmd /k "cd backend && flask run"

REM Start the npm server
start cmd /k "cd frontend && npm start"

