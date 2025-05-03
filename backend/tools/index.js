/**
 * Tool API for AI Tutor Agent
 * 
 * This module defines a set of tools that can be called by the AI Tutor Agent
 * to interact with the language learning app.
 */

// In-memory storage for active conversations, vocabulary, etc.
const state = {
  activeConversation: null,
  vocabulary: new Map(),
  conversationHistory: [],
  hints: [],
  challenges: []
};

/**
 * Starts a new conversation in the specified scenario
 */
function startConversation(params) {
  // Validate required parameters
  if (!params.scenarioID) {
    return {
      success: false,
      error: "scenarioID is required"
    };
  }

  // Check if a conversation is already in progress
  if (state.activeConversation) {
    return {
      success: false,
      error: "A conversation is already in progress. End the current conversation before starting a new one."
    };
  }

  // Create a new conversation
  const conversationID = `conv_${Date.now()}`;
  state.activeConversation = {
    id: conversationID,
    scenarioID: params.scenarioID,
    language: params.language || "french", // Default to French if not specified
    difficulty: params.difficulty || "beginner",
    focusAreas: params.focusAreas || [],
    startTime: Date.now(),
    messages: [],
    hints: [],
    challenges: []
  };

  return {
    success: true,
    conversationID
  };
}

/**
 * Ends the current conversation and optionally generates feedback
 */
function endConversation(params = {}) {
  // Default parameters
  const saveToHistory = params.saveToHistory !== false;
  const generateFeedback = params.generateFeedback !== false;

  // Check if there's an active conversation
  if (!state.activeConversation) {
    return {
      success: false,
      error: "No active conversation to end"
    };
  }

  const conversation = state.activeConversation;
  const duration = Date.now() - conversation.startTime;
  const messageCount = conversation.messages.length;

  // Generate feedback scores (simplified for now)
  let summary = {
    duration,
    messageCount
  };

  if (generateFeedback) {
    // In a real implementation, these would be calculated based on the conversation
    summary.fluencyScore = Math.floor(Math.random() * 5) + 5; // 5-10
    summary.vocabularyScore = Math.floor(Math.random() * 5) + 5; // 5-10
    summary.grammarScore = Math.floor(Math.random() * 5) + 5; // 5-10
    summary.responseSpeedScore = Math.floor(Math.random() * 5) + 5; // 5-10
  }

  // Save to history if requested
  if (saveToHistory) {
    state.conversationHistory.push({
      ...conversation,
      summary
    });
  }

  // Clear the active conversation
  state.activeConversation = null;

  return {
    success: true,
    summary
  };
}

/**
 * Adds a contextual hint that will be shown to the user during the conversation
 */
function addHint(params) {
  // Validate required parameters
  if (!params.type) {
    return {
      success: false,
      error: "hint type is required"
    };
  }

  if (!params.content || params.content.trim() === "") {
    return {
      success: false,
      error: "hint content is required"
    };
  }

  // Check if there's an active conversation
  if (!state.activeConversation) {
    return {
      success: false,
      error: "No active conversation to add hint to"
    };
  }

  // Create the hint
  const hintID = `hint_${Date.now()}`;
  const hint = {
    id: hintID,
    type: params.type,
    content: params.content,
    timing: params.timing || "immediate",
    highlightRelatedText: params.highlightRelatedText || false,
    created: Date.now(),
    shown: false
  };

  // Add to the active conversation
  state.activeConversation.hints.push(hint);

  // Also add to global hints for reference
  state.hints.push({
    ...hint,
    conversationID: state.activeConversation.id
  });

  return {
    success: true,
    hintID
  };
}

/**
 * Adds a language challenge for the user to complete during the conversation
 */
function addChallenge(params) {
  // Validate required parameters
  if (!params.level) {
    return {
      success: false,
      error: "challenge level is required"
    };
  }

  if (!params.content || params.content.trim() === "") {
    return {
      success: false,
      error: "challenge content is required"
    };
  }

  // Check if there's an active conversation
  if (!state.activeConversation) {
    return {
      success: false,
      error: "No active conversation to add challenge to"
    };
  }

  // Create the challenge
  const challengeID = `challenge_${Date.now()}`;
  const challenge = {
    id: challengeID,
    level: params.level,
    content: params.content,
    expectedResponse: params.expectedResponse || null,
    timeLimit: params.timeLimit || 0,
    showAfterMessages: params.showAfterMessages || 0,
    created: Date.now(),
    shown: false,
    completed: false,
    userResponse: null
  };

  // Add to the active conversation
  state.activeConversation.challenges.push(challenge);

  // Also add to global challenges for reference
  state.challenges.push({
    ...challenge,
    conversationID: state.activeConversation.id
  });

  return {
    success: true,
    challengeID
  };
}

/**
 * Adds a word or phrase to the user's vocabulary list
 */
function addToVocab(params) {
  // Validate required parameters
  if (!params.word || params.word.trim() === "") {
    return {
      success: false,
      error: "word is required"
    };
  }

  const word = params.word.trim().toLowerCase();

  // Check if word already exists
  if (state.vocabulary.has(word)) {
    return {
      success: true,
      wordID: word,
      alreadyExists: true
    };
  }

  // Add the word to vocabulary
  const vocabEntry = {
    word,
    translation: params.translation || "",
    context: params.context || "",
    notes: params.notes || "",
    priority: params.priority || 3,
    added: Date.now(),
    lastReviewed: null,
    reviewCount: 0
  };

  state.vocabulary.set(word, vocabEntry);

  return {
    success: true,
    wordID: word,
    alreadyExists: false
  };
}

/**
 * Adjusts the priority level of a word in the user's vocabulary list
 */
function adjustVocabPriority(params) {
  // Validate required parameters
  if (!params.word || params.word.trim() === "") {
    return {
      success: false,
      error: "word is required"
    };
  }

  if (typeof params.delta !== 'number') {
    return {
      success: false,
      error: "delta must be a number"
    };
  }

  const word = params.word.trim().toLowerCase();

  // Check if word exists
  if (!state.vocabulary.has(word)) {
    return {
      success: false,
      error: `Word "${word}" not found in vocabulary`
    };
  }

  // Get the current entry
  const vocabEntry = state.vocabulary.get(word);
  
  // Calculate new priority (clamped between 1-5)
  const newPriority = Math.max(1, Math.min(5, vocabEntry.priority + params.delta));
  
  // Update the entry
  vocabEntry.priority = newPriority;
  state.vocabulary.set(word, vocabEntry);

  return {
    success: true,
    newPriority
  };
}

/**
 * Generates a comprehensive summary of the just-completed conversation with learning insights
 */
function generatePostConversationSummary(params = {}) {
  // Default parameters
  const includeVocabulary = params.includeVocabulary !== false;
  const includeGrammar = params.includeGrammar !== false;
  const includeFluency = params.includeFluency !== false;
  const includeNextSteps = params.includeNextSteps !== false;
  const detailLevel = params.detailLevel || "standard";

  // Check if there's a recently completed conversation
  if (state.conversationHistory.length === 0) {
    return {
      success: false,
      error: "No completed conversations found"
    };
  }

  // Get the most recent conversation
  const conversation = state.conversationHistory[state.conversationHistory.length - 1];

  // Build the summary object
  const summary = {
    overview: `You completed a ${conversation.difficulty} level conversation in the "${conversation.scenarioID}" scenario using ${conversation.language}. The conversation lasted ${Math.floor((conversation.summary.duration / 1000) / 60)} minutes and included ${conversation.summary.messageCount} messages.`
  };

  // Add vocabulary section if requested
  if (includeVocabulary) {
    // In a real implementation, this would analyze the conversation for vocabulary usage
    summary.vocabulary = {
      newWords: ["bonjour", "merci", "au revoir"],
      struggledWith: ["s'il vous plaît", "excusez-moi"],
      recommendations: ["Practice greetings more frequently", "Review basic courtesy phrases"]
    };
  }

  // Add grammar section if requested
  if (includeGrammar) {
    // In a real implementation, this would analyze the conversation for grammar issues
    summary.grammar = {
      strengths: ["Basic present tense", "Simple questions"],
      areas_for_improvement: ["Article gender agreement", "Verb conjugation"],
      examples: [
        { error: "Je suis allé au la boulangerie", correction: "Je suis allé à la boulangerie" },
        { error: "Vous avez le pain?", correction: "Avez-vous du pain?" }
      ]
    };
  }

  // Add fluency section if requested
  if (includeFluency) {
    summary.fluency = {
      score: conversation.summary.fluencyScore || 7,
      feedback: "Your responses were generally clear but sometimes hesitant. Try to practice more fluid sentence construction."
    };
  }

  // Add next steps if requested
  if (includeNextSteps) {
    summary.nextSteps = [
      "Practice the restaurant scenario next to build on your food vocabulary",
      "Review the grammar points highlighted in this summary",
      "Try increasing the difficulty level for your next conversation"
    ];
  }

  return {
    success: true,
    summary
  };
}

/**
 * Creates a dialogue box showing corrections for language mistakes
 */
function createCorrectionDialogueBox(params) {
  // Validate required parameters
  if (!params.items || !Array.isArray(params.items) || params.items.length === 0) {
    return {
      success: false,
      error: "items array is required and must not be empty"
    };
  }

  // Validate each item has required fields
  for (const item of params.items) {
    if (!item.original || !item.correction) {
      return {
        success: false,
        error: "Each correction item must have 'original' and 'correction' fields"
      };
    }
  }

  // Check if there's an active conversation when showing immediately
  const showImmediately = params.showImmediately !== false;
  if (showImmediately && !state.activeConversation) {
    return {
      success: false,
      error: "No active conversation to show corrections in"
    };
  }

  // Create the correction box
  const boxID = `correction_${Date.now()}`;
  const correctionBox = {
    id: boxID,
    items: params.items,
    created: Date.now(),
    shown: false
  };

  // If there's an active conversation, associate with it
  if (state.activeConversation) {
    state.activeConversation.correctionBoxes = state.activeConversation.correctionBoxes || [];
    state.activeConversation.correctionBoxes.push(correctionBox);
  }

  return {
    success: true,
    boxID
  };
}

// Export all tools
module.exports = {
  startConversation,
  endConversation,
  addHint,
  addChallenge,
  addToVocab,
  adjustVocabPriority,
  generatePostConversationSummary,
  createCorrectionDialogueBox,
  
  // For testing/debugging
  _getState: () => ({ ...state })
};