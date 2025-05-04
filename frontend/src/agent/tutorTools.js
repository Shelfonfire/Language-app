/**
 * AI Tutor Agent Tools
 * 
 * This module defines the tools that the AI Tutor Agent can use to interact with the app.
 * The agent cannot directly mutate state - it must use these pre-defined functions.
 */

/**
 * Starts a new conversation with the specified scenario
 * @param {string} scenarioId - The ID of the scenario to start
 * @returns {Object} - Information about the started conversation
 */
export const startConversation = (scenarioId) => {
  if (!scenarioId) {
    return {
      success: false,
      error: "No scenario ID provided"
    };
  }

  return {
    success: true,
    action: "START_CONVERSATION",
    scenarioId,
    message: `Starting conversation for scenario: ${scenarioId}`
  };
};

/**
 * Ends the current conversation and triggers assessment
 * @returns {Object} - Information about the ended conversation
 */
export const endConversation = () => {
  return {
    success: true,
    action: "END_CONVERSATION",
    message: "Ending current conversation and generating assessment"
  };
};

/**
 * Adds a hint for the user
 * @param {string} type - The type of hint (vocabulary, grammar, pronunciation, etc.)
 * @param {string} content - The content of the hint
 * @returns {Object} - Information about the added hint
 */
export const addHint = (type, content) => {
  if (!type || !content) {
    return {
      success: false,
      error: "Hint type and content are required"
    };
  }

  return {
    success: true,
    action: "ADD_HINT",
    type,
    content,
    message: `Added ${type} hint: ${content}`
  };
};

/**
 * Adds a challenge for the user
 * @param {string} level - The difficulty level of the challenge (beginner, intermediate, advanced)
 * @param {string} content - The content of the challenge
 * @returns {Object} - Information about the added challenge
 */
export const addChallenge = (level, content) => {
  if (!level || !content) {
    return {
      success: false,
      error: "Challenge level and content are required"
    };
  }

  const validLevels = ['beginner', 'intermediate', 'advanced'];
  if (!validLevels.includes(level.toLowerCase())) {
    return {
      success: false,
      error: `Invalid level: ${level}. Must be one of: ${validLevels.join(', ')}`
    };
  }

  return {
    success: true,
    action: "ADD_CHALLENGE",
    level,
    content,
    message: `Added ${level} challenge: ${content}`
  };
};

/**
 * Adds a word to the user's vocabulary list
 * @param {string} word - The word to add
 * @returns {Object} - Information about the added word
 */
export const addToVocab = (word) => {
  if (!word) {
    return {
      success: false,
      error: "No word provided"
    };
  }

  return {
    success: true,
    action: "ADD_TO_VOCAB",
    word,
    message: `Added "${word}" to vocabulary list`
  };
};

/**
 * Adjusts the priority of a word in the vocabulary list
 * @param {string} word - The word to adjust
 * @param {number} delta - The change in priority (-3 to +3)
 * @returns {Object} - Information about the adjusted word
 */
export const adjustVocabPriority = (word, delta) => {
  if (!word) {
    return {
      success: false,
      error: "No word provided"
    };
  }

  if (typeof delta !== 'number' || delta < -3 || delta > 3) {
    return {
      success: false,
      error: "Delta must be a number between -3 and +3"
    };
  }

  return {
    success: true,
    action: "ADJUST_VOCAB_PRIORITY",
    word,
    delta,
    message: `Adjusted priority of "${word}" by ${delta}`
  };
};

/**
 * Generates a summary of the conversation
 * @returns {Object} - The generated summary
 */
export const generatePostConversationSummary = () => {
  return {
    success: true,
    action: "GENERATE_SUMMARY",
    message: "Generating post-conversation summary"
  };
};

/**
 * Creates a correction dialogue box
 * @param {Array} items - Array of items to correct
 * @returns {Object} - Information about the created correction dialogue
 */
export const createCorrectionDialogueBox = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return {
      success: false,
      error: "Items must be a non-empty array"
    };
  }

  return {
    success: true,
    action: "CREATE_CORRECTION_DIALOGUE",
    items,
    message: `Created correction dialogue with ${items.length} items`
  };
};