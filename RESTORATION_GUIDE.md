# Language Learning App - Restoration Guide

This guide will help you restore your Language Learning App project when you return to OpenHands.

## Option 1: Restore from GitHub (Recommended)

If you've pushed your project to GitHub, this is the easiest way to restore it:

1. Clone your repository:
   ```bash
   git clone https://github.com/yourusername/language-learning-app.git
   ```

2. Navigate to the project directory:
   ```bash
   cd language-learning-app
   ```

3. Run the setup script:
   ```bash
   ./setup.sh
   ```

4. Start the application:
   ```bash
   ./start.sh
   ```

## Option 2: Restore from Backup Archives

You have three backup archives available:

### A. Full Backup (with node_modules)
This is the largest but most complete backup:

1. Download `/tmp/language-learning-app-full.tar.gz` from your current session
2. In your next OpenHands session, upload this file
3. Extract it:
   ```bash
   tar -xzvf language-learning-app-full.tar.gz -C /workspace/
   ```
4. Start the application:
   ```bash
   cd /workspace/language-learning-app
   ./start.sh
   ```

### B. Code-Only Backup (without node_modules)
This is smaller but requires reinstalling dependencies:

1. Download `/tmp/language-learning-app-code.tar.gz` from your current session
2. In your next OpenHands session, upload this file
3. Extract it:
   ```bash
   tar -xzvf language-learning-app-code.tar.gz -C /workspace/
   mv /workspace/language-learning-app-code/language-learning-app /workspace/
   rmdir /workspace/language-learning-app-code
   ```
4. Run the setup script:
   ```bash
   cd /workspace/language-learning-app
   ./setup.sh
   ```
5. Start the application:
   ```bash
   ./start.sh
   ```

### C. Minimal Backup (source code only)
This is the smallest backup but requires the most setup:

1. Download `/tmp/language-learning-app.tar.gz` from your current session
2. In your next OpenHands session, upload this file
3. Create the project directory and extract:
   ```bash
   mkdir -p /workspace/language-learning-app
   tar -xzvf language-learning-app.tar.gz -C /workspace/language-learning-app
   ```
4. Run the setup script:
   ```bash
   cd /workspace/language-learning-app
   ./setup.sh
   ```
5. Start the application:
   ```bash
   ./start.sh
   ```

## Project Structure Overview

Refer to `PROJECT_SUMMARY.md` for a comprehensive overview of the project structure, features, and development status.

## Key Files

- `/start.sh` - Script to start both frontend and backend servers
- `/setup.sh` - Script to install dependencies after restoration
- `/PROJECT_SUMMARY.md` - Detailed project overview
- `/frontend/src/App.jsx` - Main application component with routing
- `/backend/server.js` - Express server with OpenAI integration

## Next Steps After Restoration

1. Verify the application is running correctly
2. Enter your OpenAI API key when prompted
3. Test the conversation functionality
4. Continue implementing the audio support features (see AUDIO_SUPPORT.md)

## Troubleshooting

If you encounter any issues:

1. Check that both frontend and backend servers are running
2. Verify your OpenAI API key is valid
3. Check the browser console for any frontend errors
4. Check the terminal output for any backend errors