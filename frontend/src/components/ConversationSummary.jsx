import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ConversationSummary.css';

/**
 * ConversationSummary component displays the AI tutor's feedback after a conversation
 * 
 * @param {Object} props - Component props
 * @param {Object} props.assessment - Assessment data including scores and feedback
 * @param {Function} props.onViewDetails - Function to call when View Details button is clicked
 */
const ConversationSummary = ({ assessment, onViewDetails }) => {
  const navigate = useNavigate();
  
  // Extract recommendations from assessment text
  const extractRecommendations = (text) => {
    // Look for recommendations after phrases like "tips for improvement" or "recommendations"
    const recommendationSection = text.match(/(?:tips for improvement|recommendations|suggestions)(?::|\.)(.*?)(?:\n\n|\n$|$)/is);
    
    if (recommendationSection && recommendationSection[1]) {
      // Split by bullet points, numbers, or new lines
      return recommendationSection[1]
        .split(/(?:\n|•|\d+\.)/)
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .slice(0, 3); // Limit to 3 recommendations
    }
    
    // Fallback: try to find sentences that look like recommendations
    const sentences = text.split(/[.!?]/).map(s => s.trim()).filter(s => s.length > 0);
    const recommendationKeywords = ['should', 'try', 'practice', 'focus', 'improve', 'work on', 'consider'];
    
    const possibleRecommendations = sentences.filter(sentence => 
      recommendationKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
    );
    
    return possibleRecommendations.slice(0, 3); // Limit to 3 recommendations
  };
  
  // Extract personalized feedback (everything not part of the scores or recommendations)
  const extractPersonalizedFeedback = (text) => {
    // Remove score section and recommendation section
    let cleanedText = text.replace(/(?:fluency|vocabulary|grammar|speed):\s*\d+\/10/gi, '');
    cleanedText = cleanedText.replace(/(?:tips for improvement|recommendations|suggestions)(?::|\.)(.*?)(?:\n\n|\n$|$)/is, '');
    
    // Get the first 1-2 sentences that aren't just greetings
    const sentences = cleanedText.split(/[.!?]/).map(s => s.trim()).filter(s => s.length > 0);
    const greetings = ['thank', 'goodbye', 'well done', 'great job'];
    
    const personalFeedback = sentences.filter(sentence => 
      !greetings.some(greeting => sentence.toLowerCase().includes(greeting))
    ).slice(0, 2).join('. ');
    
    return personalFeedback || "You did well in this conversation!";
  };
  
  // Get letter grade from numeric score
  const getLetterGrade = (score) => {
    if (score >= 9) return 'A';
    if (score >= 8) return 'B';
    if (score >= 7) return 'C';
    if (score >= 6) return 'D';
    if (score >= 5) return 'E';
    return 'F';
  };
  
  const recommendations = extractRecommendations(assessment.text);
  const personalizedFeedback = extractPersonalizedFeedback(assessment.text);
  
  return (
    <div className="conversation-summary">
      <h2>Conversation Assessment</h2>
      
      <div className="summary-scores">
        <div className="score-card">
          <div className="score-letter">{getLetterGrade(assessment.vocabulary)}</div>
          <div className="score-number">{assessment.vocabulary}/10</div>
          <div className="score-label">Vocabulary</div>
        </div>
        
        <div className="score-card">
          <div className="score-letter">{getLetterGrade(assessment.grammar)}</div>
          <div className="score-number">{assessment.grammar}/10</div>
          <div className="score-label">Grammar</div>
        </div>
        
        <div className="score-card">
          <div className="score-letter">{getLetterGrade(assessment.fluency)}</div>
          <div className="score-number">{assessment.fluency}/10</div>
          <div className="score-label">Fluency</div>
        </div>
      </div>
      
      <div className="recommendations-section">
        <h3>Recommendations</h3>
        <ul className="recommendations-list">
          {recommendations.map((recommendation, index) => (
            <li key={index}>{recommendation}</li>
          ))}
        </ul>
      </div>
      
      <div className="tutor-feedback">
        <div className="tutor-avatar">
          <span role="img" aria-label="AI Tutor">👨‍🏫</span>
        </div>
        <div className="speech-bubble">
          {personalizedFeedback}
        </div>
      </div>
      
      <div className="summary-actions">
        <button 
          className="view-details-btn" 
          onClick={onViewDetails || (() => console.log('View details clicked'))}
        >
          View Detailed Feedback
        </button>
        
        <div className="navigation-buttons">
          <button className="primary-btn" onClick={() => navigate('/')}>
            Start New Conversation
          </button>
          <button className="secondary-btn" onClick={() => navigate('/history')}>
            View History
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationSummary;