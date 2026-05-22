import React, { useState } from 'react';

const ChatPopup = ({ isOpen, onClose }) => {


  const [messages, setMessages] = useState([
    {
      sender: 'courier',
      text: 'Hello, I am on my way.'
    }
  ]);

  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage = {
      sender: 'user',
      text: input
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');

    // Simulate courier reply
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'courier',
          text: "Got it! I am currently handling your package and will update you shortly."
        }
      ]);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="chat-overlay">

      <div className="chat-popup">

        {/* Header */}
        <div className="chat-header">
          <h3>Courier Chat</h3>

          <button onClick={onClose}>
            ✖
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages">

          {messages.map((msg, index) => (

            <div
              key={index}
              className={`chat-message ${msg.sender}`}
            >
              {msg.text}
            </div>

          ))}

        </div>

        {/* Input */}
        <div className="chat-input-area">

          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button onClick={sendMessage}>
            Send
          </button>

        </div>

      </div>

    </div>
  );
};

export default ChatPopup;