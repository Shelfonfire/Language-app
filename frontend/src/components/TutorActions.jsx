import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Component to display tutor actions and tool calls
 */
const TutorActions = ({ toolResults, onActionClick }) => {
  const [expandedAction, setExpandedAction] = useState(null);
  const navigate = useNavigate();

  // If no tool results, don't render anything
  if (!toolResults || toolResults.length === 0) {
    return null;
  }

  // Handle action click based on action type
  const handleActionClick = (action, result) => {
    if (onActionClick) {
      onActionClick(action, result);
    }

    // Handle specific actions
    switch (action) {
      case 'START_CONVERSATION':
        navigate(`/chat/${result.scenarioId}`);
        break;
      default:
        // Other actions are handled by the parent component
        break;
    }
  };

  // Get icon for action type
  const getActionIcon = (action) => {
    switch (action) {
      case 'START_CONVERSATION':
        return '🗣️';
      case 'END_CONVERSATION':
        return '🏁';
      case 'ADD_HINT':
        return '💡';
      case 'ADD_CHALLENGE':
        return '🏆';
      case 'ADD_TO_VOCAB':
        return '📝';
      case 'ADJUST_VOCAB_PRIORITY':
        return '⭐';
      case 'GENERATE_SUMMARY':
        return '📊';
      case 'CREATE_CORRECTION_DIALOGUE':
        return '✏️';
      default:
        return '🔧';
    }
  };

  // Get color for action type
  const getActionColor = (action) => {
    switch (action) {
      case 'START_CONVERSATION':
        return '#4a6cf7';
      case 'END_CONVERSATION':
        return '#f76e4a';
      case 'ADD_HINT':
        return '#f7d14a';
      case 'ADD_CHALLENGE':
        return '#9a4af7';
      case 'ADD_TO_VOCAB':
        return '#4af7a5';
      case 'ADJUST_VOCAB_PRIORITY':
        return '#f74a8c';
      case 'GENERATE_SUMMARY':
        return '#4acef7';
      case 'CREATE_CORRECTION_DIALOGUE':
        return '#f7934a';
      default:
        return '#888888';
    }
  };

  return (
    <div className="tutor-actions">
      <h3 className="actions-title">Tutor Actions</h3>
      <div className="actions-list">
        {toolResults.map((toolResult, index) => {
          const { result } = toolResult;
          
          if (!result || !result.success) {
            return null;
          }

          return (
            <div 
              key={index}
              className="action-item"
              style={{ borderLeft: `4px solid ${getActionColor(result.action)}` }}
              onClick={() => setExpandedAction(expandedAction === index ? null : index)}
            >
              <div className="action-header">
                <span className="action-icon">{getActionIcon(result.action)}</span>
                <span className="action-message">{result.message}</span>
                <span className="action-expand">{expandedAction === index ? '▼' : '▶'}</span>
              </div>
              
              {expandedAction === index && (
                <div className="action-details">
                  {result.action === 'ADD_HINT' && (
                    <div className="hint-content">
                      <strong>{result.type} hint:</strong>
                      <p>{result.content}</p>
                    </div>
                  )}
                  
                  {result.action === 'ADD_CHALLENGE' && (
                    <div className="challenge-content">
                      <strong>{result.level} challenge:</strong>
                      <p>{result.content}</p>
                    </div>
                  )}
                  
                  {result.action === 'ADD_TO_VOCAB' && (
                    <div className="vocab-content">
                      <strong>New vocabulary:</strong>
                      <p>{result.word}</p>
                    </div>
                  )}
                  
                  {result.action === 'CREATE_CORRECTION_DIALOGUE' && (
                    <div className="correction-content">
                      <strong>Corrections:</strong>
                      <ul>
                        {result.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <button 
                    className="action-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(result.action, result);
                    }}
                  >
                    {result.action === 'START_CONVERSATION' ? 'Start Now' : 'Apply'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TutorActions;