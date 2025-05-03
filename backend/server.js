const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

// Load environment variables
dotenv.config();

const app = express();
const PORT = 12001;

// Import routes
const tutorAgentRoutes = require('./routes/tutorAgent');

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize OpenAI
let openai;

// Scenarios data
const scenarios = [
  { 
    id: 'bakery', 
    name: 'Bakery', 
    description: 'Practice ordering bread and pastries',
    image: '🥐'
  },
  { 
    id: 'supermarket', 
    name: 'Supermarket', 
    description: 'Shop for groceries and ask for help',
    image: '🛒'
  },
  { 
    id: 'restaurant', 
    name: 'Restaurant', 
    description: 'Order food and drinks at a restaurant',
    image: '🍽️'
  },
  { 
    id: 'hotel', 
    name: 'Hotel', 
    description: 'Check-in, ask about facilities, and request services',
    image: '🏨'
  },
  { 
    id: 'transportation', 
    name: 'Public Transportation', 
    description: 'Buy tickets and ask for directions',
    image: '🚆'
  },
  { 
    id: 'freeplay', 
    name: 'Free Play', 
    description: 'Open conversation on any topic you choose',
    image: '🗣️'
  }
];

// Routes
app.use('/api/tutor', tutorAgentRoutes);

app.get('/api/scenarios', (req, res) => {
  res.json(scenarios);
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, language, scenario } = req.body;
    
    if (!openai) {
      // Check if API key is provided
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: 'OpenAI API key is not configured' });
      }
      
      // Initialize OpenAI with the API key
      openai = new OpenAI({
        apiKey: apiKey
      });
    }
    
    // Create system message based on scenario and language
    const systemMessage = {
      role: 'system',
      content: getSystemPrompt(scenario, language)
    };
    
    // Combine system message with user messages
    const allMessages = [systemMessage, ...messages];
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: allMessages,
      max_tokens: 500
    });
    
    res.json({ message: completion.choices[0].message });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    
    // Check if it's an authentication error
    if (error.status === 401 || error.code === 'invalid_api_key') {
      return res.status(401).json({ 
        error: 'Invalid API key. Please update your OpenAI API key.',
        code: 'invalid_api_key'
      });
    }
    
    res.status(500).json({ error: 'Failed to process your request' });
  }
});

// Helper function to generate system prompts
function getSystemPrompt(scenario, language) {
  const languageMap = {
    french: 'French',
    german: 'German'
  };
  
  // Initial greetings in each language
  const greetings = {
    french: {
      bakery: "Bonjour ! Bienvenue à notre boulangerie. Comment puis-je vous aider aujourd'hui ?",
      supermarket: "Bonjour ! Bienvenue au supermarché. Je peux vous aider à trouver quelque chose ?",
      restaurant: "Bonjour et bienvenue dans notre restaurant ! Avez-vous une réservation ?",
      hotel: "Bonjour et bienvenue à notre hôtel ! Comment puis-je vous aider aujourd'hui ?",
      transportation: "Bonjour ! Bienvenue à la gare. Quelle est votre destination aujourd'hui ?",
      freeplay: "Bonjour ! Je suis ravi de discuter avec vous en français. De quoi voulez-vous parler aujourd'hui ?"
    },
    german: {
      bakery: "Guten Tag! Willkommen in unserer Bäckerei. Wie kann ich Ihnen heute helfen?",
      supermarket: "Hallo! Willkommen im Supermarkt. Kann ich Ihnen helfen, etwas zu finden?",
      restaurant: "Guten Tag und herzlich willkommen in unserem Restaurant! Haben Sie eine Reservierung?",
      hotel: "Guten Tag und willkommen in unserem Hotel! Wie kann ich Ihnen heute helfen?",
      transportation: "Guten Tag! Willkommen am Bahnhof. Was ist Ihr Reiseziel heute?",
      freeplay: "Hallo! Ich freue mich, mit Ihnen auf Deutsch zu sprechen. Worüber möchten Sie heute sprechen?"
    }
  };
  
  const scenarioPrompts = {
    bakery: `You are a friendly bakery employee who speaks ${languageMap[language]}. 
      The user is practicing their ${languageMap[language]} language skills. 
      Respond in ${languageMap[language]} and keep your responses simple and appropriate for a language learner.
      If the user makes mistakes, occasionally provide gentle corrections.
      You are in a bakery with various breads, pastries, and cakes.
      Your first message should be: "${greetings[language].bakery}"
      End the conversation naturally when the interaction is complete.
      After the conversation ends (when both parties have said goodbye), provide a language assessment in English with scores out of 10 for: fluency, vocabulary, grammar, and response speed. Also include 2-3 specific tips for improvement.`,
    
    supermarket: `You are a helpful supermarket employee who speaks ${languageMap[language]}. 
      The user is practicing their ${languageMap[language]} language skills. 
      Respond in ${languageMap[language]} and keep your responses simple and appropriate for a language learner.
      If the user makes mistakes, occasionally provide gentle corrections.
      You are in a supermarket with various departments: produce, dairy, meat, bakery, etc.
      Your first message should be: "${greetings[language].supermarket}"
      Help the customer find items or answer questions about products.
      End the conversation naturally when the interaction is complete.
      After the conversation ends (when both parties have said goodbye), provide a language assessment in English with scores out of 10 for: fluency, vocabulary, grammar, and response speed. Also include 2-3 specific tips for improvement.`,
    
    restaurant: `You are a polite restaurant server who speaks ${languageMap[language]}. 
      The user is practicing their ${languageMap[language]} language skills. 
      Respond in ${languageMap[language]} and keep your responses simple and appropriate for a language learner.
      If the user makes mistakes, occasionally provide gentle corrections.
      You work at a restaurant with a variety of local dishes and drinks.
      Your first message should be: "${greetings[language].restaurant}"
      Take the customer's order and answer questions about the menu.
      End the conversation naturally when the interaction is complete.
      After the conversation ends (when both parties have said goodbye), provide a language assessment in English with scores out of 10 for: fluency, vocabulary, grammar, and response speed. Also include 2-3 specific tips for improvement.`,
    
    hotel: `You are a professional hotel receptionist who speaks ${languageMap[language]}. 
      The user is practicing their ${languageMap[language]} language skills. 
      Respond in ${languageMap[language]} and keep your responses simple and appropriate for a language learner.
      If the user makes mistakes, occasionally provide gentle corrections.
      You work at the front desk of a hotel and can help with check-in, check-out, and information about facilities.
      Your first message should be: "${greetings[language].hotel}"
      Assist the guest with their needs and answer their questions.
      End the conversation naturally when the interaction is complete.
      After the conversation ends (when both parties have said goodbye), provide a language assessment in English with scores out of 10 for: fluency, vocabulary, grammar, and response speed. Also include 2-3 specific tips for improvement.`,
    
    transportation: `You are a helpful transportation employee who speaks ${languageMap[language]}. 
      The user is practicing their ${languageMap[language]} language skills. 
      Respond in ${languageMap[language]} and keep your responses simple and appropriate for a language learner.
      If the user makes mistakes, occasionally provide gentle corrections.
      You work at a train/bus station and can help with tickets, schedules, and directions.
      Your first message should be: "${greetings[language].transportation}"
      Assist the traveler with their needs and answer their questions.
      End the conversation naturally when the interaction is complete.
      After the conversation ends (when both parties have said goodbye), provide a language assessment in English with scores out of 10 for: fluency, vocabulary, grammar, and response speed. Also include 2-3 specific tips for improvement.`,
      
    freeplay: `You are a friendly native ${languageMap[language]} speaker having a casual conversation. 
      The user is practicing their ${languageMap[language]} language skills. 
      Respond in ${languageMap[language]} and keep your responses simple and appropriate for a language learner.
      If the user makes mistakes, occasionally provide gentle corrections.
      You can discuss any topic the user wants to talk about.
      Your first message should be: "${greetings[language].freeplay}"
      Be engaging and ask follow-up questions to keep the conversation flowing.
      End the conversation naturally when the interaction is complete.
      After the conversation ends (when both parties have said goodbye), provide a language assessment in English with scores out of 10 for: fluency, vocabulary, grammar, and response speed. Also include 2-3 specific tips for improvement.`
  };
  
  return scenarioPrompts[scenario] || `You are a friendly ${languageMap[language]} speaker helping someone practice their language skills. Your first message should be in ${languageMap[language]}. After the conversation ends, provide a language assessment in English with scores out of 10 for: fluency, vocabulary, grammar, and response speed. Also include 2-3 specific tips for improvement.`;
}

// Create a .env file endpoint
app.post('/api/setup-env', async (req, res) => {
  const { apiKey } = req.body;
  
  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }
  
  // Set the API key in the environment
  process.env.OPENAI_API_KEY = apiKey;
  
  // Initialize OpenAI with the new API key
  openai = new OpenAI({
    apiKey: apiKey
  });
  
  // Test the API key with a simple request
  try {
    await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5
    });
    
    res.json({ success: true, message: 'API key configured successfully' });
  } catch (error) {
    console.error('Error testing API key:', error);
    
    if (error.status === 401 || error.code === 'invalid_api_key') {
      return res.status(401).json({ 
        error: 'Invalid API key. Please check your OpenAI API key and try again.',
        code: 'invalid_api_key'
      });
    }
    
    res.status(500).json({ error: 'Failed to verify API key. Please try again.' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});