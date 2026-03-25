import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MessageCircle, Video, Crown, Lock,
  Sparkles, Instagram, Zap
} from 'lucide-react'
import PremiumModal from '../components/PremiumModal'
import MatchingOverlay from '../components/MatchingOverlay'

// All possible interest suggestions
const ALL_INTERESTS = [
  'Music', 'Gaming', 'Sports', 'Movies', 'Anime',
  'Travel', 'Cooking', 'Tech', 'Art', 'Reading',
  'Fitness', 'Photography', 'Science', 'Memes', 'Fashion',
  'Politics', 'Crypto', 'K-pop', 'Marvel', 'Nature',
  'Meditation', 'History', 'Gardening', 'Pets', 'Cars',
  'Dance', 'Yoga', 'Psychology', 'Space', 'Chess'
]

// X icon
function XIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

function TikTokIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.12a8.16 8.16 0 003.76.92V6.69z"/>
    </svg>
  )
}

export default function ChatLobby() {
  const navigate = useNavigate()
  const [selectedInterests, setSelectedInterests] = useState([])
  const [rotatingInterests, setRotatingInterests] = useState([])
  const [rotateAnim, setRotateAnim] = useState(false)
  const [myGender, setMyGender] = useState(null)
  const [filterGender, setFilterGender] = useState('both')
  const [isPremium] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [showInterestManager, setShowInterestManager] = useState(false)

  // Rotating 3 random interest suggestions every 5 seconds
  useEffect(() => {
    function pickThree() {
      const available = ALL_INTERESTS.filter(i => !selectedInterests.includes(i))
      const shuffled = available.sort(() => 0.5 - Math.random())
      return shuffled.slice(0, 3)
    }

    setRotatingInterests(pickThree())

    const interval = setInterval(() => {
      setRotateAnim(true)
      setTimeout(() => {
        setRotatingInterests(pickThree())
        setRotateAnim(false)
      }, 300)
    }, 5000)

    return () => clearInterval(interval)
  }, [selectedInterests])

  const addInterest = (interest) => {
    if (!selectedInterests.includes(interest) && selectedInterests.length < 5) {
      setSelectedInterests(prev => [...prev, interest])
    }
  }

  const removeInterest = (interest) => {
    setSelectedInterests(prev => prev.filter(i => i !== interest))
  }

  const handleStartChat = () => {
    if (!myGender) return
    setIsSearching(true)
  }

  const handleMatchFound = (matchId) => {
    setIsSearching(false)
    navigate(`/chat/${matchId}`, {
      state: {
        interests: selectedInterests,
        myGender,
        filterGender: isPremium ? filterGender : 'both'
      }
    })
  }

  return (
    <div className="chat-lobby-new">
      {/* Logo & Social Links */}
      <div className="lobby-logo-section">
        <div className="lobby-logo">
          <div className="logo-icon logo-icon-lg"><Zap size={28} /></div>
        </div>
        <h2 className="lobby-brand-text">Vibe</h2>
        <div className="social-links">
          <a href="#" className="social-link" title="Instagram"><Instagram size={18} /></a>
          <a href="#" className="social-link" title="X (Twitter)"><XIcon size={16} /></a>
          <a href="#" className="social-link" title="TikTok"><TikTokIcon size={16} /></a>
        </div>
      </div>

      {/* Interests Card */}
      <div className="lobby-card">
        <div className="lobby-card-header">
          <h3>Your Interests <span className="interest-status">(ON)</span></h3>
          <button className="manage-btn" onClick={() => setShowInterestManager(!showInterestManager)}>
            Manage
          </button>
        </div>
        <div className="interests-container">
          {/* Selected interests */}
          {selectedInterests.map(i => (
            <button key={i} className="interest-tag selected" onClick={() => removeInterest(i)}>
              {i} <span className="tag-remove">×</span>
            </button>
          ))}
          {/* Rotating suggested interests */}
          <div className={`rotating-interests ${rotateAnim ? 'fade-out' : 'fade-in'}`}>
            {rotatingInterests.map(i => (
              <button key={i} className="interest-tag suggestion" onClick={() => addInterest(i)}>
                {i}
              </button>
            ))}
          </div>
          {selectedInterests.length === 0 && (
            <p className="interest-hint">You have no interests. Click to add some.</p>
          )}
        </div>

        {/* Interest manager dropdown */}
        {showInterestManager && (
          <div className="interest-manager">
            <div className="interest-manager-grid">
              {ALL_INTERESTS.map(i => (
                <button
                  key={i}
                  className={`interest-chip ${selectedInterests.includes(i) ? 'active' : ''}`}
                  onClick={() => selectedInterests.includes(i) ? removeInterest(i) : addInterest(i)}
                  disabled={!selectedInterests.includes(i) && selectedInterests.length >= 5}
                >
                  {i}
                </button>
              ))}
            </div>
            <p className="interest-counter">{selectedInterests.length}/5 selected</p>
          </div>
        )}
      </div>

      {/* Gender Filter */}
      <div className="lobby-card">
        <h3 className="lobby-card-title">Gender Filter:</h3>
        <div className="gender-filter-grid">
          <button
            className={`gender-option ${filterGender === 'male' ? 'selected' : ''}`}
            onClick={() => isPremium ? setFilterGender('male') : setShowPremiumModal(true)}
          >
            {!isPremium && <Crown size={14} className="premium-badge-icon" />}
            <span className="gender-emoji">♂️</span>
            <span className="gender-name">Male</span>
          </button>
          <button
            className={`gender-option ${filterGender === 'both' ? 'selected' : ''}`}
            onClick={() => setFilterGender('both')}
          >
            <span className="gender-emoji">👥</span>
            <span className="gender-name">Both</span>
          </button>
          <button
            className={`gender-option ${filterGender === 'female' ? 'selected' : ''}`}
            onClick={() => isPremium ? setFilterGender('female') : setShowPremiumModal(true)}
          >
            {!isPremium && <Crown size={14} className="premium-badge-icon" />}
            <span className="gender-emoji">♀️</span>
            <span className="gender-name">Female</span>
          </button>
        </div>
      </div>

      {/* Your Gender (for matching) */}
      <div className="lobby-card">
        <h3 className="lobby-card-title">I am:</h3>
        <div className="gender-filter-grid three-col">
          {[
            { value: 'male', label: 'Male', icon: '♂️' },
            { value: 'female', label: 'Female', icon: '♀️' },
            { value: 'other', label: 'Other', icon: '⚧️' }
          ].map(g => (
            <button
              key={g.value}
              className={`gender-option ${myGender === g.value ? 'selected' : ''}`}
              onClick={() => setMyGender(g.value)}
            >
              <span className="gender-emoji">{g.icon}</span>
              <span className="gender-name">{g.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="lobby-actions">
        <button className="btn-video-lobby" disabled>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
        </button>
        <button
          className="btn-start-lobby"
          onClick={handleStartChat}
          disabled={!myGender}
        >
          <MessageCircle size={18} /> Start Text Chat
        </button>
      </div>
      <p className="lobby-rules">Be respectful and follow our <a href="#">chat rules</a></p>

      {/* Modals */}
      {showPremiumModal && <PremiumModal onClose={() => setShowPremiumModal(false)} />}
      {isSearching && (
        <MatchingOverlay
          interests={selectedInterests}
          onCancel={() => setIsSearching(false)}
          onMatchFound={handleMatchFound}
        />
      )}
    </div>
  )
}
