import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import HomePage from './components/HomePage'
import ChatPage from './components/ChatPage'
import ApiKeySetup from './components/ApiKeySetup'
import HistoryPage from './components/HistoryPage'
import TutorPage from './components/TutorPage'

function App() {
  const [apiKeySet, setApiKeySet] = useState(false);
  const [language, setLanguage] = useState('french');
  
  // Check if API key is set in localStorage
  useEffect(() => {
    const storedApiKey = localStorage.getItem('openai_api_key');
    if (storedApiKey) {
      setApiKeySet(true);
    }
  }, []);

  const handleApiKeySubmit = (success) => {
    setApiKeySet(success);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route 
            path="/" 
            element={
              apiKeySet ? (
                <HomePage 
                  language={language} 
                  onLanguageChange={handleLanguageChange} 
                />
              ) : (
                <Navigate to="/setup" />
              )
            } 
          />
          <Route 
            path="/chat/:scenarioId" 
            element={
              apiKeySet ? (
                <ChatPage language={language} />
              ) : (
                <Navigate to="/setup" />
              )
            } 
          />
          <Route 
            path="/history" 
            element={
              apiKeySet ? (
                <HistoryPage />
              ) : (
                <Navigate to="/setup" />
              )
            } 
          />
          <Route 
            path="/tutor" 
            element={
              apiKeySet ? (
                <TutorPage />
              ) : (
                <Navigate to="/setup" />
              )
            } 
          />
          <Route 
            path="/setup" 
            element={<ApiKeySetup onApiKeySubmit={handleApiKeySubmit} />} 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
