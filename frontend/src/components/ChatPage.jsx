import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ChatPage = ({ language }) => {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [assessmentRequested, setAssessmentRequested] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [conversationEnded, setConversationEnded] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch scenario name and initial message on component mount
  useEffect(() => {
    const fetchScenarioData = async () => {
      try {
        // Get scenario info
        const scenarioResponse = await axios.get('https://work-2-bdwxlspnzusxeauy.prod-runtime.all-hands.dev/api/scenarios');
        const scenario = scenarioResponse.data.find(s => s.id === scenarioId);
        
        if (scenario) {
          setScenarioName(scenario.name);
          
          // Get initial message from API
          try {
            const response = await axios.post('https://work-2-bdwxlspnzusxeauy.prod-runtime.all-hands.dev/api/chat', {
              messages: [],
              language: language,
              scenario: scenarioId
            });
            
            setMessages([response.data.message]);
          } catch (error) {
            console.error('Error getting initial message:', error);
            // Fallback to default message if API call fails
            setMessages([{
              role: 'assistant',
              content: `Welcome to the ${scenario.name}! I'll be speaking to you in ${language === 'french' ? 'French' : 'German'}.`
            }]);
          }
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching scenario:', error);
        navigate('/');
      }
    };

    fetchScenarioData();
  }, [scenarioId, navigate, language]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      
      const response = await axios.post('https://work-2-bdwxlspnzusxeauy.prod-runtime.all-hands.dev/api/chat', {
        messages: [...messages, userMessage],
        language,
        scenario: scenarioId
      });
      
      setMessages(prev => [...prev, response.data.message]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Check if it's an API key error (status 401 or 403)
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

  // Function to request assessment
  const requestAssessment = async () => {
    if (assessmentRequested || assessment) return;
    
    setAssessmentRequested(true);
    setLoading(true);
    
    try {
      // Send a message to trigger assessment
      const response = await axios.post('https://work-2-bdwxlspnzusxeauy.prod-runtime.all-hands.dev/api/chat', {
        messages: [
          ...messages,
          { role: 'user', content: 'Thank you for the conversation. Goodbye!' }
        ],
        language,
        scenario: scenarioId
      });
      
      // Add the goodbye message and response to the chat
      setMessages(prev => [
        ...prev,
        { role: 'user', content: 'Thank you for the conversation. Goodbye!' },
        response.data.message
      ]);
      
      // Extract assessment from the response
      const assessmentText = response.data.message.content;
      
      // Parse scores from the assessment text
      const fluencyMatch = assessmentText.match(/fluency:\s*(\d+)/i);
      const vocabularyMatch = assessmentText.match(/vocabulary:\s*(\d+)/i);
      const grammarMatch = assessmentText.match(/grammar:\s*(\d+)/i);
      const speedMatch = assessmentText.match(/speed:\s*(\d+)/i);
      
      const assessmentData = {
        fluency: fluencyMatch ? parseInt(fluencyMatch[1]) : 5,
        vocabulary: vocabularyMatch ? parseInt(vocabularyMatch[1]) : 5,
        grammar: grammarMatch ? parseInt(grammarMatch[1]) : 5,
        speed: speedMatch ? parseInt(speedMatch[1]) : 5,
        text: assessmentText,
        date: new Date().toISOString(),
        language,
        scenario: scenarioId,
        scenarioName
      };
      
      setAssessment(assessmentData);
      setConversationEnded(true);
      
      // Save assessment to history
      const history = JSON.parse(localStorage.getItem('conversation_history') || '[]');
      history.push(assessmentData);
      localStorage.setItem('conversation_history', JSON.stringify(history));
      
    } catch (error) {
      console.error('Error getting assessment:', error);
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: 'Sorry, there was an error generating your assessment. Please try again.' 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle back button/navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!conversationEnded && messages.length > 1) {
        requestAssessment();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [messages, conversationEnded]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button className="back-btn" onClick={() => {
          if (!conversationEnded && messages.length > 1) {
            requestAssessment();
            setTimeout(() => navigate('/'), 2000);
          } else {
            navigate('/');
          }
        }}>
          ← Back
        </button>
        <h2>{scenarioName} ({language === 'french' ? 'French' : 'German'})</h2>
        {!conversationEnded && messages.length > 1 ? (
          <button 
            className="end-btn"
            onClick={requestAssessment}
            disabled={loading || assessmentRequested}
          >
            End Conversation
          </button>
        ) : (
          <div></div> /* Empty div for flex spacing */
        )}
      </div>
      
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
      
      {assessment && (
        <div className="assessment-container">
          <h3>Conversation Assessment</h3>
          <div className="assessment-scores">
            <div className="score-item">
              <span>Fluency:</span>
              <div className="score-bar">
                <div className="score-fill" style={{ width: `${assessment.fluency * 10}%` }}></div>
                <span>{assessment.fluency}/10</span>
              </div>
            </div>
            <div className="score-item">
              <span>Vocabulary:</span>
              <div className="score-bar">
                <div className="score-fill" style={{ width: `${assessment.vocabulary * 10}%` }}></div>
                <span>{assessment.vocabulary}/10</span>
              </div>
            </div>
            <div className="score-item">
              <span>Grammar:</span>
              <div className="score-bar">
                <div className="score-fill" style={{ width: `${assessment.grammar * 10}%` }}></div>
                <span>{assessment.grammar}/10</span>
              </div>
            </div>
            <div className="score-item">
              <span>Response Speed:</span>
              <div className="score-bar">
                <div className="score-fill" style={{ width: `${assessment.speed * 10}%` }}></div>
                <span>{assessment.speed}/10</span>
              </div>
            </div>
          </div>
          <button className="primary-btn" onClick={() => navigate('/')}>
            Start New Conversation
          </button>
          <button className="secondary-btn" onClick={() => navigate('/history')}>
            View History
          </button>
        </div>
      )}
      
      {!conversationEnded && (
        <form className="chat-input-container" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Type your message in ${language === 'french' ? 'French' : 'German'}...`}
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
      )}
    </div>
  );
};

export default ChatPage;