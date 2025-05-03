/**
 * Routes for AI Tutor Agent
 */
const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const tools = require('../tools');

// Initialize OpenAI (will be set when API key is configured)
let openai;

// Default system prompt for the tutor agent
const DEFAULT_TUTOR_PROMPT = `You are an AI language tutor named Lingo, designed to help users learn languages through conversation practice.

Your primary role is to guide the user through their language learning journey, providing encouragement, structure, and personalized assistance.

You have access to several tools that allow you to:
1. Start and end conversations in different scenarios
2. Add hints during conversations
3. Create challenges for the user
4. Manage the user's vocabulary list
5. Generate learning summaries
6. Create correction dialogue boxes

Always be supportive and encouraging. Language learning can be challenging, and your role is to make it enjoyable and effective.

When the user wants to practice a language, use the startConversation tool with an appropriate scenario.
When they're done, use endConversation to provide them with feedback.

Adapt your teaching style to the user's preferences and learning goals. Some users may want structured lessons, while others may prefer a more conversational approach.

Remember that you cannot directly interact with the language practice conversations - you must use the provided tools to manage the learning experience.`;

// Route to handle tool calls from the AI Tutor
router.post('/chat', async (req, res) => {
  try {
    const { messages, customPrompt } = req.body;
    
    // Check if OpenAI is initialized
    if (!openai) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: 'OpenAI API key is not configured' });
      }
      
      openai = new OpenAI({
        apiKey: apiKey
      });
    }
    
    // Create system message with default or custom prompt
    const systemMessage = {
      role: 'system',
      content: customPrompt || DEFAULT_TUTOR_PROMPT
    };
    
    // Combine system message with user messages
    const allMessages = [systemMessage, ...messages];
    
    // Define available tools
    const availableTools = [
      {
        type: "function",
        function: {
          name: "startConversation",
          description: "Starts a new conversation in the specified scenario",
          parameters: {
            type: "object",
            properties: {
              scenarioID: {
                type: "string",
                description: "Identifier for the conversation scenario (e.g., 'bakery', 'restaurant')"
              },
              language: {
                type: "string",
                enum: ["french", "german"],
                description: "Target language for the conversation"
              },
              difficulty: {
                type: "string",
                enum: ["beginner", "intermediate", "advanced"],
                description: "Difficulty level for the conversation"
              },
              focusAreas: {
                type: "array",
                items: {
                  type: "string"
                },
                description: "Specific language skills to emphasize"
              }
            },
            required: ["scenarioID"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "endConversation",
          description: "Ends the current conversation and optionally generates feedback",
          parameters: {
            type: "object",
            properties: {
              saveToHistory: {
                type: "boolean",
                description: "Whether to save conversation to history"
              },
              generateFeedback: {
                type: "boolean",
                description: "Whether to generate feedback"
              }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "addHint",
          description: "Adds a contextual hint that will be shown to the user during the conversation",
          parameters: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["vocabulary", "grammar", "pronunciation", "cultural"],
                description: "Category of hint"
              },
              content: {
                type: "string",
                description: "The hint text to display"
              },
              timing: {
                type: "string",
                enum: ["immediate", "nextUserTurn", "endOfConversation"],
                description: "When to show the hint"
              },
              highlightRelatedText: {
                type: "boolean",
                description: "Whether to highlight related text in the conversation"
              }
            },
            required: ["type", "content"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "addChallenge",
          description: "Adds a language challenge for the user to complete during the conversation",
          parameters: {
            type: "object",
            properties: {
              level: {
                type: "string",
                enum: ["easy", "medium", "hard"],
                description: "Difficulty level of the challenge"
              },
              content: {
                type: "string",
                description: "The challenge prompt or question"
              },
              expectedResponse: {
                type: "string",
                description: "Expected answer or pattern for automatic checking"
              },
              timeLimit: {
                type: "number",
                description: "Time limit in seconds (0 means no limit)"
              },
              showAfterMessages: {
                type: "number",
                description: "Number of messages to wait before showing challenge"
              }
            },
            required: ["level", "content"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "addToVocab",
          description: "Adds a word or phrase to the user's vocabulary list",
          parameters: {
            type: "object",
            properties: {
              word: {
                type: "string",
                description: "The word or phrase to add"
              },
              translation: {
                type: "string",
                description: "Translation in user's native language"
              },
              context: {
                type: "string",
                description: "Example sentence or context from conversation"
              },
              notes: {
                type: "string",
                description: "Additional notes about usage"
              },
              priority: {
                type: "number",
                description: "Initial priority level (1-5)"
              }
            },
            required: ["word"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "adjustVocabPriority",
          description: "Adjusts the priority level of a word in the user's vocabulary list",
          parameters: {
            type: "object",
            properties: {
              word: {
                type: "string",
                description: "The word to adjust"
              },
              delta: {
                type: "number",
                description: "Amount to change priority (-4 to +4)"
              }
            },
            required: ["word", "delta"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "generatePostConversationSummary",
          description: "Generates a comprehensive summary of the just-completed conversation with learning insights",
          parameters: {
            type: "object",
            properties: {
              includeVocabulary: {
                type: "boolean",
                description: "Include vocabulary analysis"
              },
              includeGrammar: {
                type: "boolean",
                description: "Include grammar analysis"
              },
              includeFluency: {
                type: "boolean",
                description: "Include fluency assessment"
              },
              includeNextSteps: {
                type: "boolean",
                description: "Include recommended next steps"
              },
              detailLevel: {
                type: "string",
                enum: ["brief", "standard", "detailed"],
                description: "Level of detail in the summary"
              }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "createCorrectionDialogueBox",
          description: "Creates a dialogue box showing corrections for language mistakes",
          parameters: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    original: {
                      type: "string",
                      description: "Original text with mistake"
                    },
                    correction: {
                      type: "string",
                      description: "Corrected text"
                    },
                    explanation: {
                      type: "string",
                      description: "Explanation of the correction"
                    }
                  },
                  required: ["original", "correction"]
                },
                description: "Array of correction items"
              },
              showImmediately: {
                type: "boolean",
                description: "Whether to show the box immediately"
              }
            },
            required: ["items"]
          }
        }
      }
    ];
    
    // Call OpenAI API with tool definitions
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: allMessages,
      tools: availableTools,
      tool_choice: "auto",
    });
    
    let responseMessage = completion.choices[0].message;
    
    // Handle tool calls if any
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      const toolCalls = responseMessage.tool_calls;
      const toolResults = [];
      
      // Process each tool call
      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        // Check if the function exists in our tools
        if (typeof tools[functionName] === 'function') {
          try {
            // Call the function with the provided arguments
            const result = tools[functionName](functionArgs);
            toolResults.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: functionName,
              content: JSON.stringify(result)
            });
          } catch (error) {
            console.error(`Error executing tool ${functionName}:`, error);
            toolResults.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: functionName,
              content: JSON.stringify({ 
                success: false, 
                error: `Error executing tool: ${error.message}` 
              })
            });
          }
        } else {
          toolResults.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: functionName,
            content: JSON.stringify({ 
              success: false, 
              error: `Tool '${functionName}' not found` 
            })
          });
        }
      }
      
      // Add the tool results to the messages
      const updatedMessages = [...allMessages, responseMessage, ...toolResults];
      
      // Get a new response from the model with the tool results
      const secondCompletion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: updatedMessages,
        tools: availableTools,
        tool_choice: "auto",
      });
      
      responseMessage = secondCompletion.choices[0].message;
    }
    
    res.json({ message: responseMessage });
  } catch (error) {
    console.error('Error in tutor agent:', error);
    
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

// Route to get the current tutor prompt
router.get('/prompt', (req, res) => {
  res.json({ prompt: process.env.TUTOR_PROMPT || DEFAULT_TUTOR_PROMPT });
});

// Route to update the tutor prompt
router.post('/prompt', (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  
  // Store the prompt in environment variable
  process.env.TUTOR_PROMPT = prompt;
  
  res.json({ success: true, message: 'Tutor prompt updated successfully' });
});

// Route to get the current state (for debugging)
router.get('/state', (req, res) => {
  res.json(tools._getState());
});

module.exports = router;