import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HomePage = ({ language, onLanguageChange }) => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const response = await axios.get('https://work-2-bdwxlspnzusxeauy.prod-runtime.all-hands.dev/api/scenarios');
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
              className="tutor-btn"
              onClick={() => navigate('/tutor')}
            >
              AI Tutor
            </button>
            <button 
              className="history-btn"
              onClick={() => navigate('/history')}
            >
              View Progress History
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
    </div>
  );
};

export default HomePage;