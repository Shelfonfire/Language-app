import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TutorPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Fetch the default prompt on component mount
  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const response = await axios.get('https://work-2-bdwxlspnzusxeauy.prod-runtime.all-hands.dev/api/tutor/prompt');
        setCustomPrompt(response.data.prompt);
      } catch (error) {
        console.error('Error fetching tutor prompt:', error);
      }
    };

    fetchPrompt();
    
    // Add initial welcome message
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I\'m your language learning tutor. I can help you practice conversations in French or German, manage your vocabulary, and provide feedback on your progress. How would you like to start today?'
      }
    ]);
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check for active conversation
  useEffect(() => {
    const checkActiveConversation = async () => {
      try {
        const response = await axios.get('https://work-2-bdwxlspnzusxeauy.prod-runtime.all-hands.dev/api/tutor/state');
        if (response.data.activeConversation) {
          setActiveConversation(response.data.activeConversation);
        } else {
          setActiveConversation(null);
        }
      } catch (error) {
        console.error('Error checking active conversation:', error);
      }
    };

    checkActiveConversation();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = {
      role: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const apiKey = localStorage.getItem('openai_api_key');
      
      if (!apiKey) {
        navigate('/setup');
        return;
      }
      
      const response = await axios.post('https://work-2-bdwxlspnzusxeauy.prod-runtime.all-hands.dev/api/tutor/chat', {
        messages: [...messages, userMessage],
        customPrompt: customPrompt
      });
      
      setMessages(prev => [...prev, response.data.message]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Check if it's an API key error
      if (error.response && (error.response.status === 401 || error.response.status === 403 || 
          (error.response.data && error.response.data.error && error.response.data.error.includes('API key')))) {
        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: 'There seems to be an issue with the API key. Please click the button below to update your API key.' 
          }
        ]);
        
        // Add a button to reset API key
        localStorage.removeItem('openai_api_key');
        setTimeout(() => {
          navigate('/setup');
        }, 3000);
      } else {
        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: 'Sorry, there was an error processing your message. Please try again.' 
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrompt = async () => {
    try {
      await axios.post('https://work-2-bdwxlspnzusxeauy.prod-runtime.all-hands.dev/api/tutor/prompt', {
        prompt: customPrompt
      });
      
      setShowPromptEditor(false);
      
      // Add confirmation message
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Tutor prompt updated successfully! I\'ll use this new guidance for our future interactions.'
        }
      ]);
    } catch (error) {
      console.error('Error updating prompt:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, there was an error updating the tutor prompt. Please try again.'
        }
      ]);
    }
  };

  const handleViewConversation = () => {
    if (activeConversation) {
      navigate(`/chat/${activeConversation.scenarioID}`);
    }
  };

  return (
    <div className="tutor-container">
      <div className="tutor-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h2>AI Language Tutor</h2>
        <div className="tutor-controls">
          <button 
            className="prompt-btn"
            onClick={() => setShowPromptEditor(!showPromptEditor)}
          >
            {showPromptEditor ? 'Hide Prompt Editor' : 'Edit Tutor Prompt'}
          </button>
          
          {activeConversation && (
            <button 
              className="view-conversation-btn"
              onClick={handleViewConversation}
            >
              View Active Conversation
            </button>
          )}
        </div>
      </div>
      
      {showPromptEditor && (
        <div className="prompt-editor">
          <h3>Edit Tutor System Prompt</h3>
          <p className="prompt-info">
            Customize how the tutor behaves by editing its system prompt. This defines the tutor's personality, capabilities, and teaching style.
          </p>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={10}
            className="prompt-textarea"
          />
          <div className="prompt-actions">
            <button 
              className="cancel-btn"
              onClick={() => setShowPromptEditor(false)}
            >
              Cancel
            </button>
            <button 
              className="save-btn"
              onClick={handleUpdatePrompt}
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
      
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.role === 'user' ? 'user-message' : 'bot-message'}`}
          >
            {message.content}
          </div>
        ))}
        {loading && (
          <div className="message bot-message">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chat-input-container" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message to the tutor..."
          disabled={loading}
        />
        <button 
          type="submit" 
          className="send-btn"
          disabled={loading || !input.trim()}
        >
          →
        </button>
      </form>
    </div>
  );
};

export default TutorPage;