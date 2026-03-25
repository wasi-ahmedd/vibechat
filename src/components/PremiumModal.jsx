import { Crown, Check, X } from 'lucide-react'

export default function PremiumModal({ onClose }) {
  const features = [
    'Gender matching filter — choose who you chat with',
    'Priority queue — get matched faster',
    'Ad-free experience — zero interruptions',
    'Premium badge — stand out from the crowd',
    'Extended chat history — save conversations'
  ]

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="premium-modal-header">
          <div className="premium-crown">
            <Crown size={28} />
          </div>
          <h2>Upgrade to Vibe Premium</h2>
          <p>Unlock exclusive features and level up your chat experience</p>
        </div>

        {/* Features */}
        <div className="premium-features">
          {features.map((f, i) => (
            <div className="premium-feature-item" key={i}>
              <Check size={18} />
              <span>{f}</span>
            </div>
          ))}
        </div>

        {/* Plans */}
        <div className="premium-plans">
          <div className="plan-card">
            <div className="plan-label">Weekly</div>
            <div className="plan-price">₹79</div>
            <div className="plan-period">/week</div>
          </div>
          <div className="plan-card popular">
            <div className="plan-badge">Most Popular</div>
            <div className="plan-label">Monthly</div>
            <div className="plan-price">₹249</div>
            <div className="plan-period">/month</div>
          </div>
          <div className="plan-card">
            <div className="plan-label">Yearly</div>
            <div className="plan-price">₹1,999</div>
            <div className="plan-period">/year</div>
          </div>
        </div>

        {/* Actions */}
        <div className="premium-modal-footer">
          <button className="btn-upgrade">
            <Crown size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
            Upgrade Now
          </button>
          <button className="btn-close-modal" onClick={onClose}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
