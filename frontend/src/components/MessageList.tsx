import React from 'react'
import './MessageList.css'

interface Message {
  id: string
  text: string
  timestamp: Date
  type: 'user' | 'system'
  hasActions?: boolean
}

interface MessageListProps {
  messages: Message[]
  isProcessing: boolean
  onResendMessage?: (message: string) => void
  onActionClick?: (action: string) => void
}

function MessageList({ messages, isProcessing, onResendMessage, onActionClick }: MessageListProps) {
  return (
    <div className="message-list">
      {messages.map((message) => (
        <div key={message.id} className={`message ${message.type}`}>
          <div className="message-content">
            {message.text && (
              <div className="message-text">
                {message.text.split('\n').map((line, index) => (
                  <div key={index}>
                    {line.split(/(\*\*.*?\*\*)/).map((part, partIndex) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={partIndex}>{part.slice(2, -2)}</strong>
                      }
                      return part
                    })}
                  </div>
                ))}
              </div>
            )}
            
            {message.hasActions && onActionClick && (
              <div className="action-choices">
                <button 
                  className="action-choice-btn"
                  onClick={() => onActionClick('search-carriers')}
                >
                  Search Carriers
                </button>
                <button 
                  className="action-choice-btn"
                  onClick={() => onActionClick('request-insurance')}
                >
                  Request Insurance
                </button>
                <button 
                  className="action-choice-btn"
                  onClick={() => onActionClick('schedule-meeting')}
                >
                  Schedule Meeting
                </button>
              </div>
            )}
            
            <div className="message-footer">
              <div className="message-time">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              {message.type === 'user' && onResendMessage && (
                <button 
                  className="resend-button"
                  onClick={() => onResendMessage(message.text)}
                  title="Resend this message"
                >
                  ↻
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {isProcessing && (
        <div className="message system processing">
          <div className="message-content">
            <div className="message-text">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              Processing your request...
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MessageList