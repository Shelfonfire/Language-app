# Language Learning App - Project Summary

## Overview
A web application that helps users learn languages through conversations with AI language partners in various scenarios. The app supports French and German, with multiple conversation scenarios and performance assessment.

## Project Structure
- **Frontend**: React/Vite application with components for homepage, chat interface, and history tracking
- **Backend**: Express server with OpenAI API integration
- **Deployment**: Frontend on port 12000, Backend on port 12001

## Key Features
- Language selection (French/German)
- Multiple conversation scenarios (bakery, supermarket, restaurant, hotel, transportation, free play)
- Post-conversation assessment with scoring for fluency, vocabulary, grammar, and response speed
- Conversation history tracking and progress visualization
- Initial greetings in the target language

## Current State
- All core functionality is implemented and working
- Assessment system provides scores across four metrics
- History page shows progress over time
- API key validation and error handling in place

## Development Environment
- Frontend server: https://work-1-thsfslggwztiguwl.prod-runtime.all-hands.dev (port 12000)
- Backend server: https://work-2-thsfslggwztiguwl.prod-runtime.all-hands.dev (port 12001)
- Start both servers with: `./start.sh`

## Next Steps
- Implement audio support features (see AUDIO_SUPPORT.md)
- Add more languages beyond French and German
- Create custom scenario builder
- Implement vocabulary tracking

## Important Files
- `/start.sh` - Script to start both frontend and backend servers
- `/frontend/src/App.jsx` - Main application component with routing
- `/frontend/src/components/ChatPage.jsx` - Core conversation interface
- `/frontend/src/components/HistoryPage.jsx` - Progress tracking visualization
- `/backend/server.js` - Express server with OpenAI integration

## Dependencies
- Frontend: React, React Router, Axios
- Backend: Express, CORS, dotenv, OpenAI

## How to Resume Development
1. Start the servers with `./start.sh`
2. Access the frontend at https://work-1-thsfslggwztiguwl.prod-runtime.all-hands.dev
3. Enter your OpenAI API key when prompted
4. Main code files to focus on:
   - For UI changes: `/frontend/src/components/`
   - For backend logic: `/backend/server.js`
   - For styling: `/frontend/src/App.css`

## Git Status
The project has been initialized as a Git repository with an initial commit. To push to your own GitHub repository:
1. Create a new repository on GitHub
2. Add the remote: `git remote add origin https://github.com/yourusername/language-learning-app.git`
3. Push the code: `git push -u origin master`