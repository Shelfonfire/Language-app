#!/bin/bash

# Start the backend server
cd /workspace/language-learning-app/backend
PORT=12001 npm run dev &
BACKEND_PID=$!

# Start the frontend server
cd /workspace/language-learning-app/frontend
PORT=12000 npm run dev &
FRONTEND_PID=$!

# Function to handle script termination
function cleanup {
  echo "Stopping servers..."
  kill $BACKEND_PID
  kill $FRONTEND_PID
  exit
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

echo "Servers started!"
echo "Frontend running at: https://work-1-thsfslggwztiguwl.prod-runtime.all-hands.dev"
echo "Backend running at: https://work-2-thsfslggwztiguwl.prod-runtime.all-hands.dev"
echo "Press Ctrl+C to stop both servers"

# Keep the script running
wait