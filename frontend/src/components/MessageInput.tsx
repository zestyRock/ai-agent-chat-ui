import React, { useState } from 'react'
import './MessageInput.css'

interface MessageInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
}

function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Describe your transportation requirements... (⌘K)"
        disabled={disabled}
        rows={3}
      />
      <button type="submit" disabled={disabled || !message.trim()}>
        {disabled ? 'Processing...' : 'Send'}
      </button>
    </form>
  )
}

export default MessageInput