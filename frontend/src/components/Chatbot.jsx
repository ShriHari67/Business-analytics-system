import React, { useState, useEffect, useRef } from 'react';
import { aiChatEngine } from '../services/aiChatEngine';

export default function Chatbot({
  records = [],
  salaries = [],
  credits = [],
  debits = [],
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: `👋 **Welcome to Business Analytics AI Assistant!**\n\nI am your intelligent business copilot connected directly to your active transactions, payroll, credit, and debit datasets.\n\nAsk me anything about your revenue, sales trends, net business balance, or employee salaries!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'What is the overall business performance?',
        'What is our net business balance?',
        'Which product has the highest sales?',
        'What is the employee salary summary?',
        'What is our credit receivables status?',
        'What is our debit expenses status?',
      ],
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isTyping]);

  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isTyping) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await aiChatEngine.processQuery(query, records, salaries, credits, debits);
      const assistantMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: response.suggestions || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: `⚠️ **Error generating response**: ${err.message || 'An unexpected issue occurred while analyzing data.'} Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: ['Overall Performance', 'Top Products'],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    aiChatEngine.clearHistory();
    setMessages([
      {
        id: Date.now(),
        sender: 'assistant',
        text: `🧹 **Chat conversation cleared.**\n\nHow can I help you analyze your business data today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          'What is the overall business performance?',
          'Which product has the highest sales?',
          'Which region is performing best?',
          'What are the key business insights?',
        ],
      },
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format simple markdown into JSX
  const renderFormattedText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bold text formatting
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} style={{ color: '#f8fafc' }}>{part.slice(2, -2)}</strong>;
        } else if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={pIdx} style={{ color: '#38bdf8' }}>{part.slice(1, -1)}</em>;
        }
        return part;
      });

      return (
        <div key={idx} style={{ minHeight: line.trim() === '' ? '8px' : 'auto', marginBottom: '2px' }}>
          {formattedLine}
        </div>
      );
    });
  };

  return (
    <>
      {/* ====================================================================
          FLOATING AI CHATBOT BUTTON (Bottom-Right Corner)
          ==================================================================== */}
      <div
        className="chatbot-fab"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? 'Close Assistant' : 'Open Business Analytics AI Assistant'}
      >
        <div className="chatbot-fab-pulse"></div>
        <div className="chatbot-fab-icon">
          {isOpen ? '✕' : '🤖'}
        </div>
        {!isOpen && (
          <span className="chatbot-fab-tooltip">
            AI Assistant
          </span>
        )}
      </div>

      {/* ====================================================================
          CHATBOT WINDOW PANEL
          ==================================================================== */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="chatbot-avatar">
                🤖
              </div>
              <div>
                <h4 className="chatbot-title">Business Analytics AI Assistant</h4>
                <div className="chatbot-status">
                  <span className="chatbot-online-dot"></span>
                  Connected to Live Data ({records.length} records)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={handleClearChat}
                className="chatbot-header-btn"
                title="Clear Chat History"
              >
                🗑️
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="chatbot-header-btn"
                title="Minimize Window"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-bubble-row ${msg.sender === 'user' ? 'user-row' : 'assistant-row'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="chat-avatar-mini">AI</div>
                )}
                <div className={`chat-bubble ${msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
                  <div className="chat-bubble-text">
                    {renderFormattedText(msg.text)}
                  </div>
                  <div className="chat-bubble-time">{msg.timestamp}</div>

                  {/* Suggestion Pills (if provided by assistant) */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="chat-suggestions-container">
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSendMessage(sug)}
                          className="chat-suggestion-pill"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="chat-bubble-row assistant-row">
                <div className="chat-avatar-mini">AI</div>
                <div className="chat-bubble chat-bubble-assistant typing-bubble">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="chatbot-footer">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about revenue, top product, region..."
              className="chatbot-input"
              disabled={isTyping}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping}
              className="chatbot-send-btn"
              title="Send Message"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
