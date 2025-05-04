import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SystemPromptEditor from './SystemPromptEditor';
import TutorConfigEditor from './TutorConfigEditor';

const HomePage = ({ language, onLanguageChange }) => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(true);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [showTutorConfig, setShowTutorConfig] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const response = await axios.get('https://work-2-zxfdpajvkmbapyvk.prod-runtime.all-hands.dev/api/scenarios');
        setScenarios(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching scenarios:', error);
        setLoading(false);
      }
    };

    fetchScenarios();
  }, []);

  const handleScenarioClick = (scenarioId) => {
    navigate(`/chat/${scenarioId}`);
  };

  const handleLanguageSelect = (lang) => {
    onLanguageChange(lang);
  };

  const handleStartConversation = (scenarioId) => {
    setShowWelcomeDialog(false);
    navigate(`/chat/${scenarioId}`);
  };

  const handleCloseDialog = () => {
    setShowWelcomeDialog(false);
  };
  
  const handleOpenPromptEditor = () => {
    setShowPromptEditor(true);
    setShowTutorConfig(false);
  };
  
  const handleClosePromptEditor = () => {
    setShowPromptEditor(false);
  };
  
  const handleSavePrompt = (prompt) => {
    // Save prompt to localStorage (already done in the editor component)
    // Close the editor
    setShowPromptEditor(false);
  };
  
  const handleOpenTutorConfig = () => {
    setShowTutorConfig(true);
    setShowPromptEditor(false);
  };
  
  const handleCloseTutorConfig = () => {
    setShowTutorConfig(false);
  };
  
  const handleSaveTutorConfig = (prompt) => {
    // Save config to localStorage (already done in the config component)
    // Close the config editor
    setShowTutorConfig(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <header className="header">
        <h1 className="app-title">Language Learning Conversations</h1>
        <div className="header-controls">
          <div className="language-selector">
            <button 
              className={`language-btn ${language === 'french' ? 'active' : ''}`}
              onClick={() => handleLanguageSelect('french')}
            >
              French
            </button>
            <button 
              className={`language-btn ${language === 'german' ? 'active' : ''}`}
              onClick={() => handleLanguageSelect('german')}
            >
              German
            </button>
          </div>
          <div className="header-buttons">
            <button 
              className="history-btn"
              onClick={() => navigate('/history')}
            >
              View Progress History
            </button>
            <button 
              className="settings-btn"
              onClick={handleOpenTutorConfig}
            >
              Customize AI Tutor
            </button>
            <button 
              className="settings-btn"
              onClick={handleOpenPromptEditor}
            >
              Advanced Editor
            </button>
          </div>
        </div>
      </header>

      <main>
        <h2>Choose a scenario to practice {language === 'french' ? 'French' : 'German'}</h2>
        <div className="scenarios-container">
          {scenarios.map((scenario) => (
            <div 
              key={scenario.id} 
              className="scenario-card"
              onClick={() => handleScenarioClick(scenario.id)}
            >
              <div className="scenario-icon">{scenario.image}</div>
              <h3 className="scenario-title">{scenario.name}</h3>
              <p className="scenario-description">{scenario.description}</p>
            </div>
          ))}
        </div>
      </main>

      {showWelcomeDialog && (
        <div className="dialog-overlay">
          <div className="welcome-dialog">
            <div className="dialog-header">
              <h2>Welcome back to your language learning journey!</h2>
              <button className="close-btn" onClick={handleCloseDialog}>Close</button>
            </div>
            <div className="dialog-content">
              <div className="tutor-message">
                <div className="tutor-avatar">🧑‍🏫</div>
                <div className="message-bubble">
                  <p>Bonjour! Guten Tag! Welcome back to your language learning journey!</p>
                  <p>I'm your AI language tutor. I see you've been practicing {language === 'french' ? 'French' : 'German'}. Would you like to continue with one of our conversation scenarios?</p>
                  <p>You can choose a scenario from the main page, or I can suggest the restaurant scenario to practice ordering food and drinks.</p>
                </div>
              </div>
              <div className="dialog-actions">
                <button className="action-btn" onClick={() => handleStartConversation('restaurant')}>
                  Start Restaurant Conversation
                </button>
                <button className="action-btn secondary" onClick={handleCloseDialog}>
                  Browse All Scenarios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showPromptEditor && (
        <div className="dialog-overlay">
          <div className="editor-dialog">
            <SystemPromptEditor 
              onSave={handleSavePrompt}
              onCancel={handleClosePromptEditor}
            />
          </div>
        </div>
      )}
      
      {showTutorConfig && (
        <div className="dialog-overlay">
          <div className="editor-dialog">
            <TutorConfigEditor 
              onSave={handleSaveTutorConfig}
              onCancel={handleCloseTutorConfig}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;