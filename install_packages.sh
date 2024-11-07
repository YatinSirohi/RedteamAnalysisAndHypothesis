#!/bin/bash

# Install Python packages from requirements.txt
pip install -r requirements.txt

# Navigate to the directory with the npm project and install packages
cd frontend
npm install

echo "All packages installed successfully."
