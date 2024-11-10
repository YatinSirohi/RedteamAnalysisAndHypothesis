#!/bin/bash

# Start the second Flask server in a new terminal
gnome-terminal -- bash -c "cd backend && sudo flask run; exec bash"

# Start the first Flask server in another new terminal
gnome-terminal -- bash -c "cd backend/internal-recon/my_flask_app && sudo flask run; exec bash"

# Start the npm server in a third new terminal
gnome-terminal -- bash -c "cd frontend && npm start; exec bash"
