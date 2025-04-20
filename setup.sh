#!/bin/bash

# Language Learning App Setup Script
# This script helps you quickly set up the application after restoring it

echo "Setting up Language Learning App..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd /workspace/language-learning-app/backend
npm install

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd /workspace/language-learning-app/frontend
npm install

# Return to root directory
cd /workspace/language-learning-app

# Make start script executable
chmod +x start.sh

echo "Setup complete! You can now run the application with ./start.sh"
echo "Frontend will be available at: https://work-1-thsfslggwztiguwl.prod-runtime.all-hands.dev"
echo "Backend will be available at: https://work-2-thsfslggwztiguwl.prod-runtime.all-hands.dev"
echo "Remember to enter your OpenAI API key when prompted"