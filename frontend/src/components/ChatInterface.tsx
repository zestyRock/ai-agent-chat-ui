import React, { useState, useEffect } from 'react'
import MessageInput from './MessageInput'
import MessageList from './MessageList'
import StructuredFields from './StructuredFields'
import ActionButtons from './ActionButtons'
import './ChatInterface.css'

interface Message {
  id: string
  text: string
  timestamp: Date
  type: 'user' | 'system'
  hasActions?: boolean
}

interface StructuredData {
  origin?: string
  destination?: string
  truckType?: string
  insurance?: string
  [key: string]: any
}

function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [structuredData, setStructuredData] = useState<StructuredData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isTestMode, setIsTestMode] = useState(false)

  // Handle ⌘K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const textarea = document.querySelector('.message-input textarea') as HTMLTextAreaElement
        if (textarea) {
          textarea.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSendMessage = async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      timestamp: new Date(),
      type: 'user'
    }

    setMessages(prev => [...prev, userMessage])
    setIsProcessing(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, testMode: isTestMode }),
      })

      const data = await response.json()
      
      console.log('Backend response:', data)
      console.log('Structured data received:', data.structuredData)
      console.log('Structured data type:', typeof data.structuredData)
      
      // Add system response message
      const systemMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Message processed successfully',
        timestamp: new Date(),
        type: 'system'
      }
      
      setMessages(prev => [...prev, systemMessage])

      // If we got structured data, show formatted results and actions
      if (data.structuredData && (data.structuredData.origin || data.structuredData.destination || data.structuredData.mode)) {
        console.log('Processing structured data:', data.structuredData)
        setStructuredData(data.structuredData)
        
        // Create formatted display of parsed data
        const formattedData = `**Transportation Request Parsed:**

**Mode:** ${data.structuredData.mode || 'Not specified'}
**Route:** ${data.structuredData.origin || 'Unknown'} → ${data.structuredData.destination || 'Unknown'}
**Insurance:** ${data.structuredData.insurance_requirement || 'Not specified'}
**Requirements:** ${data.structuredData.other_constraints || 'None specified'}`

        // Add formatted results after a short delay
        setTimeout(() => {
          const formattedMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: formattedData,
            timestamp: new Date(),
            type: 'system'
          }
          setMessages(prev => [...prev, formattedMessage])
          
          // Add action choices after another delay
          setTimeout(() => {
            const actionMessage: Message = {
              id: (Date.now() + 3).toString(),
              text: 'What would you like to do next?',
              timestamp: new Date(),
              type: 'system',
              hasActions: true
            }
            setMessages(prev => [...prev, actionMessage])
          }, 800)
        }, 1000)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, there was an error processing your message.',
        timestamp: new Date(),
        type: 'system'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAction = async (action: string) => {
    console.log('Action triggered:', action)
    
    setIsProcessing(true)
    
    try {
      let actionMessage = ''
      
      switch (action) {
        case 'search-carriers':
          actionMessage = `Searching for carriers matching: ${structuredData?.mode} from ${structuredData?.origin} to ${structuredData?.destination} with ${structuredData?.insurance_requirement} insurance`
          break
        case 'request-insurance':
          actionMessage = `Requesting ${structuredData?.insurance_requirement} insurance verification from selected carriers`
          break
        case 'schedule-meeting':
          actionMessage = 'Scheduling meeting with carrier representatives for this route'
          break
        default:
          actionMessage = `Executing action: ${action}`
      }
      
      // Add action message to chat
      const actionMsg: Message = {
        id: Date.now().toString(),
        text: `🔄 ${actionMessage}`,
        timestamp: new Date(),
        type: 'system'
      }
      
      setMessages(prev => [...prev, actionMsg])
      
      // Simulate action processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Add completion message
      const completionMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: `✅ Action completed: ${action.replace('-', ' ')}`,
        timestamp: new Date(),
        type: 'system'
      }
      
      setMessages(prev => [...prev, completionMsg])
      
    } catch (error) {
      console.error('Error executing action:', error)
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: `❌ Error executing action: ${action}`,
        timestamp: new Date(),
        type: 'system'
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h1>Carrier Intelligence</h1>
        <div className="environment-toggle">
          <div className="toggle-buttons">
            <button 
              className={`env-button ${!isTestMode ? 'active' : ''}`}
              onClick={() => setIsTestMode(false)}
            >
              Production
            </button>
            <button 
              className={`env-button ${isTestMode ? 'active' : ''}`}
              onClick={() => setIsTestMode(true)}
            >
              Test
            </button>
          </div>
        </div>
      </div>
      
      <div className="chat-content">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="welcome-section">
              <div className="welcome-input">
                <MessageInput onSendMessage={handleSendMessage} disabled={isProcessing} />
              </div>
              
              <div className="quick-actions">
                <button 
                  className="quick-action-btn"
                  onClick={() => handleSendMessage("Find dry van carriers from Chicago to Houston")}
                >
                  Find qualified carriers
                </button>
                <button 
                  className="quick-action-btn"
                  onClick={() => handleSendMessage("Check insurance requirements for cross-country transport")}
                >
                  Verify insurance coverage
                </button>
                <button 
                  className="quick-action-btn"
                  onClick={() => handleSendMessage("Schedule meetings with top rated carriers")}
                >
                  Schedule meetings
                </button>
              </div>

            </div>
          ) : (
            <MessageList 
              messages={messages} 
              isProcessing={isProcessing} 
              onResendMessage={handleSendMessage}
              onActionClick={handleAction}
            />
          )}
        </div>
      </div>
      
      {messages.length > 0 && (
        <div className="chat-input">
          <MessageInput onSendMessage={handleSendMessage} disabled={isProcessing} />
        </div>
      )}
    </div>
  )
}

export default ChatInterface