#!/bin/bash

# Start the first Flask server
cd backend/Internal-Recon/my_flask_app
flask run &

# Start the second Flask server
cd backend
flask run &

# Start the npm server
cd frontend
npm start &

# Wait for all background jobs to finish
wait
