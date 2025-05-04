import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [averageScores, setAverageScores] = useState({
    fluency: 0,
    vocabulary: 0,
    grammar: 0,
    speed: 0
  });
  const [filter, setFilter] = useState('all'); // 'all', 'french', 'german'

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = JSON.parse(localStorage.getItem('conversation_history') || '[]');
    
    // Sort by date (newest first)
    savedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setHistory(savedHistory);
    
    // Calculate average scores
    if (savedHistory.length > 0) {
      const totals = savedHistory.reduce((acc, item) => {
        return {
          fluency: acc.fluency + item.fluency,
          vocabulary: acc.vocabulary + item.vocabulary,
          grammar: acc.grammar + item.grammar,
          speed: acc.speed + item.speed,
          count: acc.count + 1
        };
      }, { fluency: 0, vocabulary: 0, grammar: 0, speed: 0, count: 0 });
      
      setAverageScores({
        fluency: Math.round((totals.fluency / totals.count) * 10) / 10,
        vocabulary: Math.round((totals.vocabulary / totals.count) * 10) / 10,
        grammar: Math.round((totals.grammar / totals.count) * 10) / 10,
        speed: Math.round((totals.speed / totals.count) * 10) / 10
      });
    }
  }, []);

  // Filter history based on selected language
  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(item => item.language === filter);

  // Calculate progress over time (last 5 conversations)
  const getProgressData = (metric) => {
    const last5 = [...filteredHistory].slice(0, 5).reverse();
    return last5.map(item => item[metric]);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h2>Conversation History</h2>
        <div className="language-filter">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'french' ? 'active' : ''}`}
            onClick={() => setFilter('french')}
          >
            French
          </button>
          <button 
            className={`filter-btn ${filter === 'german' ? 'active' : ''}`}
            onClick={() => setFilter('german')}
          >
            German
          </button>
        </div>
      </div>

      {filteredHistory.length > 0 ? (
        <>
          <div className="average-scores">
            <h3>Average Scores</h3>
            <div className="score-grid">
              <div className="score-item">
                <span>Fluency:</span>
                <div className="score-bar">
                  <div className="score-fill" style={{ width: `${averageScores.fluency * 10}%` }}></div>
                  <span>{averageScores.fluency}/10</span>
                </div>
              </div>
              <div className="score-item">
                <span>Vocabulary:</span>
                <div className="score-bar">
                  <div className="score-fill" style={{ width: `${averageScores.vocabulary * 10}%` }}></div>
                  <span>{averageScores.vocabulary}/10</span>
                </div>
              </div>
              <div className="score-item">
                <span>Grammar:</span>
                <div className="score-bar">
                  <div className="score-fill" style={{ width: `${averageScores.grammar * 10}%` }}></div>
                  <span>{averageScores.grammar}/10</span>
                </div>
              </div>
              <div className="score-item">
                <span>Response Speed:</span>
                <div className="score-bar">
                  <div className="score-fill" style={{ width: `${averageScores.speed * 10}%` }}></div>
                  <span>{averageScores.speed}/10</span>
                </div>
              </div>
            </div>
          </div>

          {filteredHistory.length >= 2 && (
            <div className="progress-section">
              <h3>Progress Over Time</h3>
              <div className="progress-charts">
                <div className="progress-chart">
                  <h4>Fluency</h4>
                  <div className="chart-bars">
                    {getProgressData('fluency').map((score, index) => (
                      <div key={index} className="chart-bar">
                        <div className="chart-bar-fill" style={{ height: `${score * 10}%` }}></div>
                        <span className="chart-bar-label">{index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="progress-chart">
                  <h4>Vocabulary</h4>
                  <div className="chart-bars">
                    {getProgressData('vocabulary').map((score, index) => (
                      <div key={index} className="chart-bar">
                        <div className="chart-bar-fill" style={{ height: `${score * 10}%` }}></div>
                        <span className="chart-bar-label">{index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="progress-chart">
                  <h4>Grammar</h4>
                  <div className="chart-bars">
                    {getProgressData('grammar').map((score, index) => (
                      <div key={index} className="chart-bar">
                        <div className="chart-bar-fill" style={{ height: `${score * 10}%` }}></div>
                        <span className="chart-bar-label">{index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="history-list">
            <h3>Past Conversations</h3>
            {filteredHistory.map((item, index) => (
              <div key={index} className="history-item">
                <div className="history-item-header">
                  <h4>{item.scenarioName} ({item.language === 'french' ? 'French' : 'German'})</h4>
                  <span className="history-date">{formatDate(item.date)}</span>
                </div>
                <div className="history-scores">
                  <div className="mini-score">
                    <span>Fluency: {item.fluency}/10</span>
                    <div className="mini-score-bar">
                      <div className="mini-score-fill" style={{ width: `${item.fluency * 10}%` }}></div>
                    </div>
                  </div>
                  <div className="mini-score">
                    <span>Vocabulary: {item.vocabulary}/10</span>
                    <div className="mini-score-bar">
                      <div className="mini-score-fill" style={{ width: `${item.vocabulary * 10}%` }}></div>
                    </div>
                  </div>
                  <div className="mini-score">
                    <span>Grammar: {item.grammar}/10</span>
                    <div className="mini-score-bar">
                      <div className="mini-score-fill" style={{ width: `${item.grammar * 10}%` }}></div>
                    </div>
                  </div>
                  <div className="mini-score">
                    <span>Speed: {item.speed}/10</span>
                    <div className="mini-score-bar">
                      <div className="mini-score-fill" style={{ width: `${item.speed * 10}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="history-actions">
              <button className="primary-btn" onClick={() => navigate('/')}>
                Return to Home
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-history">
          <p>No conversation history yet. Start practicing to see your progress!</p>
          <button className="primary-btn" onClick={() => navigate('/')}>
            Start a Conversation
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;