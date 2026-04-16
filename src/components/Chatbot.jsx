import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

/**
 * Chatbot Component
 * 
 * A floating AI assistant widget that connects to a Gemini-powered backend.
 * It manages its own state for visibility, message history, and loading status.
 */
export default function Chatbot() {
  // State to track whether the chatbot window is currently open or collapsed
  const [isOpen, setIsOpen] = useState(false);
  
  // State to hold the conversation history. We initialize it with a friendly greeting.
  // Each message is an object containing 'role' ('user' or 'assistant') and 'content' (the text).
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! I am your AI assistant. How can I help you with our menu today?' }
  ]);
  
  // State for the user's current text input
  const [input, setInput] = useState('');
  
  // State to manage loading spinners/indicators while waiting for the Gemini API response
  const [isLoading, setIsLoading] = useState(false);
  
  // Reference to the bottom of the message list so we can automatically scroll down
  const messagesEndRef = useRef(null);

  // Toggles the visibility of the main chat window
  const toggleChat = () => setIsOpen(!isOpen);

  // Helper function utilizing the useRef to smoothly scroll to the newest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Automatically scroll to the bottom whenever the messages list changes OR the window is opened
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  /**
   * handleSend
   * 
   * Triggered when the user submits a message. It prevents default form submission,
   * adds the user's message to the UI organically, and securely forwards the query 
   * to our Node.js backend (/api/chat) which handles the actual Gemini Prompting.
   */
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Capture input and instantly update the UI so the user sees their message
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Forward the question to our secured Express.js AI Route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await response.json();
      
      // If the backend call succeeds, append the AI's answer to our messages array
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        // If the backend returns an API or configuration error (e.g. missing API keys)
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
      }
    } catch (error) {
      // Catch network-level errors (e.g. backend server is entirely offline)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting to the server.' }]);
    } finally {
      setIsLoading(false); // Remove loading indicator regardless of success/fail
    }
  };

  return (
    <>
      {/* Floating Toggle Button: Renders as 'X' if open, or an icon '💬' if closed */}
      <button 
        onClick={toggleChat}
        className="chatbot-toggle-btn"
        aria-label="Toggle AI Chatbot"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Conditionally render the chatbot window only if 'isOpen' is true */}
      {isOpen && (
        <div className="chatbot-window">
          
          {/* Header section */}
          <div className="chatbot-header">
            <h3>AI Menu Assistant</h3>
          </div>
          
          {/* Messages feed section */}
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.role}`}>
                <div className="message-content">
                  {msg.content}
                </div>
              </div>
            ))}
            
            {/* Show a placeholder loading message if the backend is currently processing */}
            {isLoading && (
              <div className="message-wrapper assistant">
                <div className="message-content loading">...</div>
              </div>
            )}
            
            {/* Empty div acting as the scroll target mechanism */}
            <div ref={messagesEndRef} />
          </div>

          {/* Form section: allows hitting 'Enter' to submit smoothly */}
          <form onSubmit={handleSend} className="chatbot-input-form">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Ask about the menu..."
              disabled={isLoading} // Prevent typing while the AI is thinking
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              Send
            </button>
          </form>
          
        </div>
      )}
    </>
  );
}
