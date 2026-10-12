import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare } from 'lucide-react';
import { FAQ_DATA, findBestAnswer } from '../data/chatbotFaq';
import './ChatbotWidget.css';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `Hello! 👋 I am the **RetinaVision AI Project Assistant**.\n\nHow can I help you today? You can pick a quick topic below or type your question!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [hasUnread, setHasUnread] = useState(true);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [messages, isOpen]);

  const handleToggleOpen = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  const handleSendMessage = (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add User Message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: timeStr
    };

    // Find Matching Answer
    const botAnswer = findBestAnswer(query);

    const botMsg = {
      id: `bot-${Date.now() + 1}`,
      sender: 'bot',
      text: botAnswer,
      timestamp: timeStr
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    if (!textToSend) setInputValue('');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleChipClick = (faqItem) => {
    handleSendMessage(faqItem.question);
  };

  // Helper to format bold **text** and newlines
  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return (
        <React.Fragment key={idx}>
          {formattedParts}
          {idx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        className="chatbot-trigger-btn"
        onClick={handleToggleOpen}
        title={isOpen ? 'Close Assistant' : 'Open RetinaVision AI Assistant'}
        aria-label="Open RetinaVision AI Chatbot Assistant"
      >
        {isOpen ? <X size={22} /> : <Bot size={24} />}
        {hasUnread && !isOpen && <span className="chatbot-trigger-badge" />}
      </button>

      {/* Expandable Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar-icon">
                <Sparkles size={16} />
              </div>
              <div>
                <div className="chatbot-header-title">Project Assistant</div>
                <div className="chatbot-header-subtitle">RetinaVision AI Knowledge Base</div>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={handleToggleOpen} title="Close Chat">
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Messages Area */}
          <div className="chatbot-messages-area">
            {messages.map((msg) => (
              <div key={msg.id} className={`chatbot-message ${msg.sender}`}>
                <div className="chatbot-msg-bubble">
                  {renderFormattedText(msg.text)}
                </div>
                <span className="chatbot-msg-time">{msg.timestamp}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Clickable Suggestion Chips */}
          <div className="chatbot-chips-container">
            {FAQ_DATA.map((item) => (
              <button
                key={item.id}
                className="chatbot-chip-btn"
                onClick={() => handleChipClick(item)}
              >
                {item.chipLabel || item.question}
              </button>
            ))}
          </div>

          {/* Form Input Area */}
          <form className="chatbot-input-form" onSubmit={handleFormSubmit}>
            <input
              type="text"
              className="chatbot-input-field"
              placeholder="Ask a question about this project..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              type="submit"
              className="chatbot-send-btn"
              disabled={!inputValue.trim()}
              title="Send Message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
