import { useState, useEffect } from 'react';
import { DEFAULT_SYSTEM_PROMPT } from '../agent/tutorAgent';

/**
 * Component for editing the system prompt for the AI tutor
 */
const SystemPromptEditor = ({ onSave, onCancel }) => {
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load saved system prompt from localStorage or use default
    const savedPrompt = localStorage.getItem('tutor_system_prompt');
    setSystemPrompt(savedPrompt || DEFAULT_SYSTEM_PROMPT);
  }, []);

  const handleSave = () => {
    setIsLoading(true);
    
    // Save to localStorage
    localStorage.setItem('tutor_system_prompt', systemPrompt);
    
    // Notify parent component
    if (onSave) {
      onSave(systemPrompt);
    }
    
    setIsLoading(false);
  };

  const handleReset = () => {
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
  };

  return (
    <div className="system-prompt-editor">
      <h2>Edit AI Tutor System Prompt</h2>
      <p className="editor-description">
        Customize how the AI tutor behaves by editing its system prompt. 
        This defines the tutor's personality, capabilities, and teaching style.
      </p>
      
      <div className="form-group">
        <label htmlFor="system-prompt" className="form-label">System Prompt</label>
        <textarea
          id="system-prompt"
          className="prompt-textarea"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={15}
          placeholder="Enter system prompt for the AI tutor..."
        />
      </div>
      
      <div className="prompt-actions">
        <button 
          className="secondary-btn"
          onClick={handleReset}
        >
          Reset to Default
        </button>
        <div className="right-actions">
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

export default SystemPromptEditor;