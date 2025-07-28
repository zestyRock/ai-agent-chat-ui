import React from 'react'
import './SearchResults.css'

interface Carrier {
  id: string
  name: string
  dotNumber: string
  mcNumber: string
  safetyRating: string
  insuranceCoverage: string
  contactPhone: string
  contactEmail: string
}

interface SearchResultsProps {
  carriers: Carrier[]
  onSelectCarrier: (carrier: Carrier) => void
}

function SearchResults({ carriers, onSelectCarrier }: SearchResultsProps) {
  if (!carriers || carriers.length === 0) {
    return null
  }

  return (
    <div className="search-results">
      <h3 className="results-title">Search Results ({carriers.length} carriers found)</h3>
      <div className="carriers-list">
        {carriers.map((carrier) => (
          <div key={carrier.id} className="carrier-card">
            <div className="carrier-header">
              <h4 className="carrier-name">{carrier.name}</h4>
              <div className="carrier-rating">
                <span className={`safety-rating ${carrier.safetyRating.toLowerCase()}`}>
                  {carrier.safetyRating}
                </span>
              </div>
            </div>
            
            <div className="carrier-details">
              <div className="detail-row">
                <span className="detail-label">DOT Number:</span>
                <span className="detail-value">{carrier.dotNumber}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">MC Number:</span>
                <span className="detail-value">{carrier.mcNumber}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Insurance:</span>
                <span className="detail-value">{carrier.insuranceCoverage}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{carrier.contactPhone}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{carrier.contactEmail}</span>
              </div>
            </div>
            
            <div className="carrier-actions">
              <button 
                className="select-carrier-btn"
                onClick={() => onSelectCarrier(carrier)}
              >
                Select Carrier
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SearchResults