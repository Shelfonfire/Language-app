# Language Learning Conversations

A web application that helps users learn languages through conversation practice with AI agents in different scenarios.

## Features

- Practice conversations in French or German
- Multiple scenarios (bakery, supermarket, restaurant, hotel, transportation, free play)
- Natural conversations with AI language partners
- Immediate language practice in realistic contexts
- Post-conversation assessment with scores for fluency, vocabulary, grammar, and response speed
- Progress tracking with history visualization
- Initial greetings in the target language
- "Free Play" mode for open-ended practice

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies for both frontend and backend:

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Configuration

You'll need to provide your OpenAI API key when you first launch the application.

### Running the Application

1. Use the start script to launch both servers:

```bash
./start.sh
```

Alternatively, you can start the servers separately:

```bash
# Start the backend server
cd backend
npm run dev

# In a separate terminal, start the frontend
cd frontend
npm run dev
```

2. Open your browser and navigate to:
   - Frontend: https://work-1-thsfslggwztiguwl.prod-runtime.all-hands.dev
   - Backend: https://work-2-thsfslggwztiguwl.prod-runtime.all-hands.dev

3. Enter your OpenAI API key when prompted

4. Select a language (French or German) and a scenario to begin practicing

## How It Works

1. Choose your target language (French or German)
2. Select a conversation scenario (bakery, supermarket, etc.)
3. Chat with an AI language partner who responds in your target language
4. Practice real-world conversations in a safe, supportive environment
5. End the conversation to receive a detailed assessment of your language skills
6. View your progress history to track improvement over time

## Additional Documentation

- [Audio Support Implementation](./AUDIO_SUPPORT.md): Detailed guide for adding text-to-speech and speech-to-text features

## Technologies Used

- Frontend: React, Vite, React Router
- Backend: Node.js, Express
- AI: OpenAI GPT API

## License

This project is licensed under the MIT License - see the LICENSE file for details.