# Adding Audio Support to the Language Learning App

This document outlines how to implement audio features to enhance the language learning experience.

## 1. Text-to-Speech (TTS) Implementation

### Option 1: Web Speech API (Browser-based)

The Web Speech API provides a simple way to implement text-to-speech without external dependencies:

```javascript
// Example implementation for ChatPage.jsx
const speakText = (text, language) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === 'french' ? 'fr-FR' : 'de-DE';
  utterance.rate = 0.9; // Slightly slower for language learners
  window.speechSynthesis.speak(utterance);
};

// Add a speak button to each message
<div className="message-actions">
  <button 
    className="speak-btn" 
    onClick={() => speakText(message.content, language)}
    aria-label="Listen"
  >
    🔊
  </button>
</div>
```

Pros:
- No external API costs
- Works offline
- Simple implementation

Cons:
- Limited voice quality
- Inconsistent across browsers
- Limited language support

### Option 2: OpenAI TTS API

For higher quality voices, you can use OpenAI's Text-to-Speech API:

```javascript
// Backend implementation (server.js)
app.post('/api/tts', async (req, res) => {
  try {
    const { text, language } = req.body;
    
    // Select voice based on language
    const voice = language === 'french' ? 'alloy' : 'onyx';
    
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: text,
    });
    
    const buffer = Buffer.from(await mp3.arrayBuffer());
    res.set('Content-Type', 'audio/mpeg');
    res.send(buffer);
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

// Frontend implementation
const playAudio = async (text) => {
  setLoading(true);
  try {
    const response = await axios.post('https://work-2-thsfslggwztiguwl.prod-runtime.all-hands.dev/api/tts', {
      text,
      language
    }, {
      responseType: 'blob'
    });
    
    const audioUrl = URL.createObjectURL(response.data);
    const audio = new Audio(audioUrl);
    audio.play();
  } catch (error) {
    console.error('Error playing audio:', error);
  } finally {
    setLoading(false);
  }
};
```

Pros:
- High-quality voices
- Consistent experience
- Multiple voice options

Cons:
- Additional API costs
- Requires internet connection
- Slightly more complex implementation

## 2. Speech-to-Text (STT) Implementation

### Option 1: Web Speech API (Browser-based)

```javascript
// Example implementation for ChatPage.jsx
const [isListening, setIsListening] = useState(false);
const recognition = useRef(null);

useEffect(() => {
  // Initialize speech recognition
  if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition.current = new SpeechRecognition();
    recognition.current.continuous = false;
    recognition.current.interimResults = false;
    recognition.current.lang = language === 'french' ? 'fr-FR' : 'de-DE';
    
    recognition.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    
    recognition.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
    
    recognition.current.onend = () => {
      setIsListening(false);
    };
  }
  
  return () => {
    if (recognition.current) {
      recognition.current.abort();
    }
  };
}, [language]);

const toggleListening = () => {
  if (isListening) {
    recognition.current.abort();
    setIsListening(false);
  } else {
    recognition.current.start();
    setIsListening(true);
  }
};

// Add a microphone button to the input form
<button 
  type="button"
  className={`mic-btn ${isListening ? 'active' : ''}`}
  onClick={toggleListening}
  disabled={!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)}
>
  🎤
</button>
```

### Option 2: OpenAI Whisper API

For more accurate speech recognition:

```javascript
// Backend implementation (server.js)
app.post('/api/stt', async (req, res) => {
  try {
    const audioFile = req.files.audio;
    
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFile.tempFilePath),
      model: "whisper-1",
      language: req.body.language === 'french' ? 'fr' : 'de',
    });
    
    res.json({ text: transcription.text });
  } catch (error) {
    console.error('STT error:', error);
    res.status(500).json({ error: 'Failed to transcribe speech' });
  }
});

// Frontend implementation
const recordAudio = () => {
  // Implementation for recording audio and sending to the server
  // This requires additional libraries like 'recorder-js' or 'opus-recorder'
};
```

## 3. Pronunciation Feedback

To provide pronunciation feedback, you can compare the user's spoken input with the expected text:

```javascript
// Backend implementation (server.js)
app.post('/api/pronunciation', async (req, res) => {
  try {
    const { audioBlob, expectedText, language } = req.body;
    
    // 1. Transcribe the audio using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioBlob,
      model: "whisper-1",
      language: language === 'french' ? 'fr' : 'de',
    });
    
    // 2. Compare transcription with expected text
    const prompt = `
      Compare the following two texts in ${language === 'french' ? 'French' : 'German'} and rate the pronunciation accuracy on a scale of 1-10:
      
      Expected text: "${expectedText}"
      Transcribed text: "${transcription.text}"
      
      Provide specific feedback on pronunciation errors and suggestions for improvement.
    `;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });
    
    res.json({ 
      transcription: transcription.text,
      feedback: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Pronunciation feedback error:', error);
    res.status(500).json({ error: 'Failed to analyze pronunciation' });
  }
});
```

## 4. Implementation Steps

1. **Basic TTS Integration**:
   - Add speak buttons to messages
   - Implement Web Speech API for quick prototype
   - Test with different languages

2. **Basic STT Integration**:
   - Add microphone button to input form
   - Implement Web Speech API recognition
   - Test with different accents and languages

3. **Advanced Features**:
   - Implement OpenAI APIs for better quality
   - Add pronunciation feedback
   - Create voice recording exercises

4. **UI Enhancements**:
   - Add audio visualization
   - Implement playback controls
   - Add speed adjustment for TTS

5. **Accessibility Considerations**:
   - Ensure proper ARIA labels
   - Add visual indicators for audio state
   - Support keyboard navigation

## 5. Required Dependencies

For basic implementation:
- No additional dependencies (Web Speech API)

For advanced implementation:
- `axios` (already installed)
- `recorder-js` or `opus-recorder` for audio recording
- `express-fileupload` for handling audio file uploads
- `wavesurfer.js` for audio visualization

## 6. Estimated Development Time

- Basic TTS/STT with Web Speech API: 1-2 days
- OpenAI API integration: 2-3 days
- Pronunciation feedback: 3-4 days
- UI refinements: 2-3 days

Total: 8-12 days for full implementation