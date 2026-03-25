import { Search, X } from 'lucide-react'

export default function MatchingOverlay({ interests = [], onCancel }) {
  return (
    <div className="matching-overlay">
      <div className="matching-content">
        {/* Spinner */}
        <div className="matching-spinner">
          <div className="ring ring-1" />
          <div className="ring ring-2" />
          <div className="ring ring-3" />
          <div className="center-icon">
            <Search size={28} />
          </div>
        </div>

        {/* Text */}
        <div className="matching-text">
          <h2>Finding your vibe...</h2>
          <p>
            {interests.length > 0
              ? `Looking for someone into ${interests.slice(0, 3).join(', ')}`
              : 'Searching for a random stranger'
            }
          </p>
        </div>

        {/* Dots */}
        <div className="matching-dots">
          <span /><span /><span />
        </div>

        {/* Cancel */}
        <button className="btn-cancel-match" onClick={onCancel}>
          <X size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
          Cancel
        </button>
      </div>
    </div>
  )
}
