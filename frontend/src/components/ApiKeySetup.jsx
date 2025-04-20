import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ApiKeySetup = ({ onApiKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('Please enter your OpenAI API key');
      return;
    }
    
    // Basic validation for OpenAI API key format (should start with "sk-")
    if (!apiKey.trim().startsWith('sk-')) {
      setError('Invalid API key format. OpenAI API keys should start with "sk-"');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Send API key to backend
      await axios.post('https://work-2-thsfslggwztiguwl.prod-runtime.all-hands.dev/api/setup-env', {
        apiKey: apiKey
      });
      
      // Store API key in localStorage
      localStorage.setItem('openai_api_key', apiKey);
      
      // Notify parent component
      onApiKeySubmit(true);
      
      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error('Error setting up API key:', error);
      
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to configure API key. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-container">
      <h1 className="setup-title">Welcome to Language Learning Conversations</h1>
      <p className="setup-description">
        To get started, please enter your OpenAI API key. This will be used to power the
        conversation agents in different scenarios.
      </p>
      
      <form className="api-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="api-key" className="form-label">OpenAI API Key</label>
          <input
            id="api-key"
            type="password"
            className="form-input"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            required
          />
        </div>
        
        {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
        
        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Setting up...' : 'Start Learning'}
        </button>
      </form>
    </div>
  );
};

export default ApiKeySetup;