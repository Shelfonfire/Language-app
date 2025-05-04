/**
 * AI Tutor Agent
 * 
 * This module defines the AI Tutor Agent that interacts with the user via conversations
 * and uses a set of callable tools to manage app behavior.
 */

import axios from 'axios';
import * as tutorTools from './tutorTools';

// Default system prompt for the AI Tutor
export const DEFAULT_SYSTEM_PROMPT = `You are an AI language tutor helping users learn a new language. 
You can use various tools to enhance the learning experience.

Available tools:
- startConversation(scenarioId): Start a new conversation with the specified scenario
- endConversation(): End the current conversation and trigger assessment
- addHint(type, content): Add a hint for the user (types: vocabulary, grammar, pronunciation)
- addChallenge(level, content): Add a challenge for the user (levels: beginner, intermediate, advanced)
- addToVocab(word): Add a word to the user's vocabulary list
- adjustVocabPriority(word, delta): Adjust the priority of a word in the vocabulary list (delta: -3 to +3)
- generatePostConversationSummary(): Generate a summary of the conversation
- createCorrectionDialogueBox(items): Create a correction dialogue box with the specified items

When the user makes a mistake, consider using addHint() to provide guidance or createCorrectionDialogueBox() 
to show corrections. For new vocabulary, use addToVocab() to help the user remember important words.

Adapt your teaching style to the user's level and needs. Be encouraging and supportive.`;

class TutorAgent {
  constructor(language, customSystemPrompt = null) {
    this.language = language;
    
    // Check for saved system prompt in localStorage
    const savedPrompt = localStorage.getItem('tutor_system_prompt');
    
    // Use custom prompt if provided, otherwise use saved prompt or default
    this.systemPrompt = customSystemPrompt || savedPrompt || DEFAULT_SYSTEM_PROMPT;
    
    this.conversationHistory = [];
    this.toolCalls = [];
  }

  /**
   * Sets the language for the tutor
   * @param {string} language - The language to set (e.g., 'french', 'german')
   */
  setLanguage(language) {
    this.language = language;
  }

  /**
   * Updates the system prompt for the tutor
   * @param {string} prompt - The new system prompt
   */
  updateSystemPrompt(prompt) {
    this.systemPrompt = prompt || DEFAULT_SYSTEM_PROMPT;
  }

  /**
   * Processes a message from the user and generates a response
   * @param {string} userMessage - The message from the user
   * @param {string} scenarioId - The current scenario ID
   * @returns {Promise<Object>} - The response from the tutor
   */
  async processMessage(userMessage, scenarioId) {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Prepare messages for the API call
      const messages = [
        {
          role: 'system',
          content: this.systemPrompt
        },
        ...this.conversationHistory
      ];

      // Make API call to get tutor response
      const response = await axios.post('https://work-2-zxfdpajvkmbapyvk.prod-runtime.all-hands.dev/api/chat', {
        messages,
        language: this.language,
        scenario: scenarioId,
        enableTools: true // Signal to backend that tools are enabled
      });

      // Process the response
      const tutorResponse = response.data.message;
      
      // Add tutor response to conversation history
      this.conversationHistory.push(tutorResponse);

      // Process any tool calls in the response
      const toolResults = this.processToolCalls(tutorResponse);

      return {
        message: tutorResponse,
        toolResults
      };
    } catch (error) {
      console.error('Error in tutor agent:', error);
      return {
        error: true,
        message: {
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your message. Please try again.'
        },
        toolResults: []
      };
    }
  }

  /**
   * Processes tool calls from the tutor response
   * @param {Object} tutorResponse - The response from the tutor
   * @returns {Array} - Results of the tool calls
   */
  processToolCalls(tutorResponse) {
    const toolResults = [];
    
    // Check if the response contains tool calls
    if (tutorResponse.tool_calls && Array.isArray(tutorResponse.tool_calls)) {
      tutorResponse.tool_calls.forEach(toolCall => {
        // Handle different formats of tool calls (OpenAI API vs mock)
        const name = toolCall.name || toolCall.function?.name;
        const args = toolCall.arguments || toolCall.function?.arguments;
        
        if (!name) {
          console.error('Invalid tool call format:', toolCall);
          return;
        }
        
        // Check if the tool exists
        if (tutorTools[name]) {
          try {
            // Parse arguments if they're in JSON format
            const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;
            
            // Call the tool with the provided arguments
            let result;
            if (Array.isArray(parsedArgs)) {
              result = tutorTools[name](...parsedArgs);
            } else if (typeof parsedArgs === 'object') {
              // Extract values from the object in the order they're defined in the tool
              const paramNames = this.getToolParameterNames(tutorTools[name]);
              const paramValues = paramNames.map(param => parsedArgs[param]);
              result = tutorTools[name](...paramValues);
            } else {
              result = tutorTools[name](parsedArgs);
            }
            
            // Map tool names to action types for the UI
            const actionMap = {
              'startConversation': 'START_CONVERSATION',
              'endConversation': 'END_CONVERSATION',
              'addHint': 'ADD_HINT',
              'addChallenge': 'ADD_CHALLENGE',
              'addToVocab': 'ADD_TO_VOCAB',
              'adjustVocabPriority': 'ADJUST_VOCAB_PRIORITY',
              'generatePostConversationSummary': 'GENERATE_SUMMARY',
              'createCorrectionDialogueBox': 'CREATE_CORRECTION_DIALOGUE'
            };
            
            // Add the action type to the result
            if (result && typeof result === 'object') {
              result.action = actionMap[name] || name.toUpperCase();
              
              // Add default message if none exists
              if (!result.message) {
                const messages = {
                  'ADD_HINT': 'Here\'s a helpful hint',
                  'ADD_CHALLENGE': 'Try this challenge',
                  'ADD_TO_VOCAB': 'New vocabulary word added',
                  'ADJUST_VOCAB_PRIORITY': 'Vocabulary priority adjusted',
                  'CREATE_CORRECTION_DIALOGUE': 'Here are some corrections',
                  'GENERATE_SUMMARY': 'Conversation summary',
                  'START_CONVERSATION': 'Start a new conversation',
                  'END_CONVERSATION': 'End the current conversation'
                };
                
                result.message = messages[result.action] || 'Tutor action';
              }
              
              // Ensure success flag is set
              if (result.success === undefined) {
                result.success = true;
              }
            }
            
            // Add the result to the list
            toolResults.push({
              toolName: name,
              result
            });
            
            // Store the tool call for history
            this.toolCalls.push({
              timestamp: new Date().toISOString(),
              tool: name,
              args: parsedArgs,
              result
            });
          } catch (error) {
            console.error(`Error calling tool ${name}:`, error);
            toolResults.push({
              toolName: name,
              result: {
                success: false,
                error: `Error calling tool: ${error.message}`
              }
            });
          }
        } else {
          toolResults.push({
            toolName: name,
            result: {
              success: false,
              error: `Unknown tool: ${name}`
            }
          });
        }
      });
    }
    
    return toolResults;
  }

  /**
   * Gets the parameter names of a function
   * @param {Function} func - The function to get parameter names for
   * @returns {Array} - The parameter names
   */
  getToolParameterNames(func) {
    const funcStr = func.toString();
    const paramStr = funcStr.slice(funcStr.indexOf('(') + 1, funcStr.indexOf(')'));
    return paramStr.split(',').map(param => param.trim());
  }

  /**
   * Clears the conversation history
   */
  clearConversation() {
    this.conversationHistory = [];
    this.toolCalls = [];
  }

  /**
   * Gets the conversation history
   * @returns {Array} - The conversation history
   */
  getConversationHistory() {
    return this.conversationHistory;
  }

  /**
   * Gets the tool call history
   * @returns {Array} - The tool call history
   */
  getToolCallHistory() {
    return this.toolCalls;
  }
}

export default TutorAgent;