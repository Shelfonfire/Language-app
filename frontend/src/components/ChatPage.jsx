import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TutorAgent from '../agent/tutorAgent';
import TutorActions from './TutorActions';
import ConversationSummary from './ConversationSummary';

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
  const [tutorAgent] = useState(() => new TutorAgent(language));
  const [toolResults, setToolResults] = useState([]);
  const messagesEndRef = useRef(null);

  // Fetch scenario name and initial message on component mount
  useEffect(() => {
    // Update tutor agent language when language changes
    tutorAgent.setLanguage(language);
    
    const fetchScenarioData = async () => {
      try {
        // Get scenario info
        const scenarioResponse = await axios.get('https://work-2-zxfdpajvkmbapyvk.prod-runtime.all-hands.dev/api/scenarios');
        const scenario = scenarioResponse.data.find(s => s.id === scenarioId);
        
        if (scenario) {
          setScenarioName(scenario.name);
          
          // Clear previous conversation in the tutor agent
          tutorAgent.clearConversation();
          
          // Get initial message from API
          try {
            const response = await axios.post('https://work-2-zxfdpajvkmbapyvk.prod-runtime.all-hands.dev/api/chat', {
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
  }, [scenarioId, navigate, language, tutorAgent]);

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
    setToolResults([]); // Clear previous tool results
    
    try {
      const apiKey = localStorage.getItem('openai_api_key');
      
      if (!apiKey) {
        navigate('/setup');
        return;
      }
      
      // Process the message using the tutor agent
      const agentResponse = await tutorAgent.processMessage(input, scenarioId);
      
      if (agentResponse.error) {
        setMessages(prev => [...prev, agentResponse.message]);
      } else {
        setMessages(prev => [...prev, agentResponse.message]);
        
        // Set tool results if any
        if (agentResponse.toolResults && agentResponse.toolResults.length > 0) {
          setToolResults(agentResponse.toolResults);
        }
      }
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
      // Use the tutor agent to process the goodbye message
      const agentResponse = await tutorAgent.processMessage('Thank you for the conversation. Goodbye!', scenarioId);
      
      // Add the goodbye message and response to the chat
      setMessages(prev => [
        ...prev,
        { role: 'user', content: 'Thank you for the conversation. Goodbye!' },
        agentResponse.message
      ]);
      
      // Extract assessment from the response
      const assessmentText = agentResponse.message.content;
      
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
      
      // Set any tool results from the final response
      if (agentResponse.toolResults && agentResponse.toolResults.length > 0) {
        setToolResults(agentResponse.toolResults);
      }
      
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

  // Handle tool action clicks
  const handleToolAction = (action, result) => {
    console.log('Tool action clicked:', action, result);
    
    // Handle specific actions
    switch (action) {
      case 'END_CONVERSATION':
        requestAssessment();
        break;
      default:
        // Other actions are handled by the UI components
        break;
    }
  };

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
      
      {/* Tutor Actions Component */}
      {toolResults.length > 0 && !conversationEnded && (
        <TutorActions 
          toolResults={toolResults} 
          onActionClick={handleToolAction} 
        />
      )}
      
      {assessment && (
        <ConversationSummary 
          assessment={assessment} 
          onViewDetails={() => console.log('View details clicked - functionality to be implemented')}
        />
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