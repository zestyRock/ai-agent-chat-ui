import React from 'react'
import './StructuredFields.css'

interface StructuredData {
  origin?: string
  destination?: string
  truckType?: string
  insurance?: string
  [key: string]: any
}

interface StructuredFieldsProps {
  data: StructuredData
}

function StructuredFields({ data }: StructuredFieldsProps) {
  const fieldLabels: { [key: string]: string } = {
    mode: 'Transportation Mode',
    origin: 'Origin',
    destination: 'Destination',
    insurance_requirement: 'Insurance Requirement',
    other_constraints: 'Other Constraints'
  }

  const renderField = (key: string, value: any) => {
    if (!value) return null
    
    return (
      <div key={key} className="structured-field">
        <label className="field-label">
          {fieldLabels[key] || key.charAt(0).toUpperCase() + key.slice(1)}
        </label>
        <div className="field-value">{String(value)}</div>
      </div>
    )
  }

  return (
    <div className="structured-fields">
      <h3 className="fields-title">Extracted Information</h3>
      <div className="fields-container">
        {Object.entries(data).map(([key, value]) => renderField(key, value))}
      </div>
    </div>
  )
}

export default StructuredFields