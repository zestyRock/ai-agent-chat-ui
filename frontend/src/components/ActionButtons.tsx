import React from 'react'
import './ActionButtons.css'

interface ActionButtonsProps {
  onAction: (action: string) => void
  disabled?: boolean
}

function ActionButtons({ onAction, disabled = false }: ActionButtonsProps) {
  const actions = [
    {
      id: 'search-carriers',
      label: 'Search Carriers',
      description: 'Find carriers matching the specified criteria',
      icon: '🔍'
    },
    {
      id: 'request-insurance',
      label: 'Request Insurance',
      description: 'Send insurance requirement to selected carriers',
      icon: '📋'
    },
    {
      id: 'schedule-meeting',
      label: 'Schedule Meeting',
      description: 'Schedule a meeting with carrier representatives',
      icon: '📅'
    }
  ]

  return (
    <div className="action-buttons">
      <h3 className="actions-title">Available Actions</h3>
      <div className="buttons-container">
        {actions.map((action) => (
          <button
            key={action.id}
            className={`action-button ${disabled ? 'disabled' : ''}`}
            onClick={() => !disabled && onAction(action.id)}
            disabled={disabled}
          >
            <div className="action-icon">{action.icon}</div>
            <div className="action-content">
              <div className="action-label">{action.label}</div>
              <div className="action-description">{action.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ActionButtons