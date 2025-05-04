import { useState, useEffect } from 'react';
import { DEFAULT_SYSTEM_PROMPT } from '../agent/tutorAgent';

// Preset system prompts for different tutor modes
const PRESET_PROMPTS = {
  beginner: `You are an AI language tutor helping beginners learn a new language. 
You focus on building confidence and providing lots of encouragement.

Available tools:
- startConversation(scenarioId): Start a new conversation with the specified scenario
- endConversation(): End the current conversation and trigger assessment
- addHint(type, content): Add a hint for the user (types: vocabulary, grammar, pronunciation)
- addChallenge(level, content): Add a challenge for the user (levels: beginner, intermediate, advanced)
- addToVocab(word): Add a word to the user's vocabulary list
- adjustVocabPriority(word, delta): Adjust the priority of a word in the vocabulary list (delta: -3 to +3)
- generatePostConversationSummary(): Generate a summary of the conversation
- createCorrectionDialogueBox(items): Create a correction dialogue box with the specified items

Use addHint() frequently to help beginners understand new concepts. Focus on basic vocabulary and simple grammar. Be very patient and encouraging. Avoid overwhelming the user with too much information at once.`,

  challenger: `You are an AI language tutor helping users advance their language skills through challenges. 
You push users to improve by setting high expectations and providing detailed feedback.

Available tools:
- startConversation(scenarioId): Start a new conversation with the specified scenario
- endConversation(): End the current conversation and trigger assessment
- addHint(type, content): Add a hint for the user (types: vocabulary, grammar, pronunciation)
- addChallenge(level, content): Add a challenge for the user (levels: beginner, intermediate, advanced)
- addToVocab(word): Add a word to the user's vocabulary list
- adjustVocabPriority(word, delta): Adjust the priority of a word in the vocabulary list (delta: -3 to +3)
- generatePostConversationSummary(): Generate a summary of the conversation
- createCorrectionDialogueBox(items): Create a correction dialogue box with the specified items

Use addChallenge() frequently to push users to improve. Be strict about grammar and pronunciation. Provide detailed corrections using createCorrectionDialogueBox(). Focus on expanding vocabulary with more advanced terms. Challenge the user to express complex thoughts.`,

  casual: `You are an AI language tutor helping users practice a language in a casual, conversational way. 
You focus on natural conversation flow and practical usage rather than strict rules.

Available tools:
- startConversation(scenarioId): Start a new conversation with the specified scenario
- endConversation(): End the current conversation and trigger assessment
- addHint(type, content): Add a hint for the user (types: vocabulary, grammar, pronunciation)
- addChallenge(level, content): Add a challenge for the user (levels: beginner, intermediate, advanced)
- addToVocab(word): Add a word to the user's vocabulary list
- adjustVocabPriority(word, delta): Adjust the priority of a word in the vocabulary list (delta: -3 to +3)
- generatePostConversationSummary(): Generate a summary of the conversation
- createCorrectionDialogueBox(items): Create a correction dialogue box with the specified items

Focus on maintaining a natural conversation. Only correct major errors that impede communication. Use addHint() occasionally for useful phrases and idioms. Emphasize practical, everyday language use. Be friendly and conversational in your tone.`,
};

/**
 * Advanced component for configuring the AI tutor's behavior
 */
const TutorConfigEditor = ({ onSave, onCancel }) => {
  // State for the configuration
  const [mode, setMode] = useState('beginner');
  const [hintFrequency, setHintFrequency] = useState(5);
  const [strictness, setStrictness] = useState(5);
  const [feedbackDepth, setFeedbackDepth] = useState(5);
  const [showRawEditor, setShowRawEditor] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Load saved configuration or set defaults
  useEffect(() => {
    const savedPrompt = localStorage.getItem('tutor_system_prompt');
    const savedConfig = localStorage.getItem('tutor_config');
    
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setMode(config.mode || 'beginner');
      setHintFrequency(config.hintFrequency || 5);
      setStrictness(config.strictness || 5);
      setFeedbackDepth(config.feedbackDepth || 5);
    }
    
    // If there's a saved prompt, use it for the raw editor
    if (savedPrompt) {
      setSystemPrompt(savedPrompt);
    } else {
      // Otherwise use the default prompt from the selected mode
      setSystemPrompt(PRESET_PROMPTS[mode] || DEFAULT_SYSTEM_PROMPT);
    }
  }, []);

  // Generate the system prompt based on the configuration
  const generateSystemPrompt = () => {
    if (showRawEditor) {
      return systemPrompt;
    }
    
    // Start with the base prompt for the selected mode
    let prompt = PRESET_PROMPTS[mode] || DEFAULT_SYSTEM_PROMPT;
    
    // Modify the prompt based on slider values
    
    // Hint frequency modifier
    if (hintFrequency < 3) {
      prompt += `\n\nProvide hints very rarely, only when the user is completely stuck.`;
    } else if (hintFrequency > 7) {
      prompt += `\n\nProvide hints very frequently, even for minor issues. Be proactive with suggestions.`;
    } else {
      prompt += `\n\nProvide hints at a moderate frequency, when you notice the user struggling.`;
    }
    
    // Strictness modifier
    if (strictness < 3) {
      prompt += `\n\nBe very lenient with errors. Only correct major mistakes that significantly impact communication.`;
    } else if (strictness > 7) {
      prompt += `\n\nBe very strict with errors. Correct even minor mistakes in grammar, vocabulary, and pronunciation.`;
    } else {
      prompt += `\n\nMaintain a balanced approach to error correction, focusing on errors that affect understanding.`;
    }
    
    // Feedback depth modifier
    if (feedbackDepth < 3) {
      prompt += `\n\nKeep feedback brief and simple. Focus on the main point without detailed explanations.`;
    } else if (feedbackDepth > 7) {
      prompt += `\n\nProvide in-depth feedback with detailed explanations of rules, examples, and alternatives.`;
    } else {
      prompt += `\n\nProvide moderately detailed feedback that explains the error and gives a clear correction.`;
    }
    
    return prompt;
  };

  // Toggle preview mode
  const handleTogglePreview = () => {
    setPreviewMode(!previewMode);
  };

  // Handle save
  const handleSave = () => {
    setIsLoading(true);
    
    // Generate the final prompt
    const finalPrompt = generateSystemPrompt();
    
    // Save configuration
    const config = {
      mode,
      hintFrequency,
      strictness,
      feedbackDepth,
      showRawEditor
    };
    
    localStorage.setItem('tutor_config', JSON.stringify(config));
    localStorage.setItem('tutor_system_prompt', finalPrompt);
    
    // Notify parent component
    if (onSave) {
      onSave(finalPrompt);
    }
    
    setIsLoading(false);
  };

  // Handle reset to defaults
  const handleReset = () => {
    setMode('beginner');
    setHintFrequency(5);
    setStrictness(5);
    setFeedbackDepth(5);
    setShowRawEditor(false);
    setSystemPrompt(PRESET_PROMPTS.beginner);
  };

  // Handle mode change
  const handleModeChange = (e) => {
    const newMode = e.target.value;
    setMode(newMode);
    if (!showRawEditor) {
      setSystemPrompt(PRESET_PROMPTS[newMode] || DEFAULT_SYSTEM_PROMPT);
    }
  };

  // Toggle between preset configuration and raw editor
  const handleToggleRawEditor = () => {
    if (!showRawEditor) {
      // Switching to raw editor - use the generated prompt as starting point
      setSystemPrompt(generateSystemPrompt());
    }
    setShowRawEditor(!showRawEditor);
    setPreviewMode(false);
  };

  return (
    <div className="tutor-config-editor">
      <h2>Configure AI Tutor Behavior</h2>
      <p className="editor-description">
        Customize how the AI tutor interacts with you during language learning sessions.
      </p>
      
      {!showRawEditor ? (
        <div className="preset-config">
          <div className="form-group">
            <label htmlFor="tutor-mode" className="form-label">Tutor Mode</label>
            <select
              id="tutor-mode"
              className="form-select"
              value={mode}
              onChange={handleModeChange}
            >
              <option value="beginner">Beginner-Friendly</option>
              <option value="challenger">Challenger</option>
              <option value="casual">Casual Conversation</option>
            </select>
            <p className="mode-description">
              {mode === 'beginner' && 'Focuses on building confidence with lots of encouragement and hints.'}
              {mode === 'challenger' && 'Pushes you to improve with challenging exercises and detailed feedback.'}
              {mode === 'casual' && 'Emphasizes natural conversation flow rather than strict rules.'}
            </p>
          </div>
          
          <div className="slider-group">
            <label className="form-label">
              Hint Frequency
              <span className="slider-value">{hintFrequency}/10</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={hintFrequency}
              onChange={(e) => setHintFrequency(parseInt(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>Rare</span>
              <span>Frequent</span>
            </div>
          </div>
          
          <div className="slider-group">
            <label className="form-label">
              Strictness
              <span className="slider-value">{strictness}/10</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={strictness}
              onChange={(e) => setStrictness(parseInt(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>Lenient</span>
              <span>Strict</span>
            </div>
          </div>
          
          <div className="slider-group">
            <label className="form-label">
              Feedback Depth
              <span className="slider-value">{feedbackDepth}/10</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={feedbackDepth}
              onChange={(e) => setFeedbackDepth(parseInt(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>Brief</span>
              <span>Detailed</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="raw-editor">
          <div className="form-group">
            <label htmlFor="system-prompt" className="form-label">System Prompt (Advanced)</label>
            <textarea
              id="system-prompt"
              className="prompt-textarea"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={15}
              placeholder="Enter system prompt for the AI tutor..."
            />
          </div>
        </div>
      )}
      
      {previewMode && !showRawEditor && (
        <div className="preview-section">
          <h3>Preview Generated Prompt</h3>
          <pre className="prompt-preview">{generateSystemPrompt()}</pre>
        </div>
      )}
      
      <div className="editor-actions">
        <div className="left-actions">
          <button 
            className="toggle-btn"
            onClick={handleToggleRawEditor}
          >
            {showRawEditor ? "Use Simple Editor" : "Use Advanced Editor"}
          </button>
          {!showRawEditor && (
            <button 
              className="preview-btn"
              onClick={handleTogglePreview}
            >
              {previewMode ? "Hide Preview" : "Show Preview"}
            </button>
          )}
        </div>
        <div className="right-actions">
          <button 
            className="secondary-btn"
            onClick={handleReset}
          >
            Reset to Default
          </button>
          <button 
            className="cancel-btn"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="primary-btn"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorConfigEditor;