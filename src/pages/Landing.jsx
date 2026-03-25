import { useNavigate } from 'react-router-dom'
import {
  MessageCircle, Sparkles, Shield, Users as UsersIcon,
  ArrowRight, Zap, Globe, Crown, Instagram
} from 'lucide-react'

// Simple X (Twitter) icon
function XIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

function TikTokIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.12a8.16 8.16 0 003.76.92V6.69z"/>
    </svg>
  )
}

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing">
      {/* Animated Background */}
      <div className="landing-bg">
        <div className="bg-wave-container">
          <svg className="bg-wave" viewBox="0 0 1440 600" preserveAspectRatio="none">
            <path className="wave-path wave-1" d="M0,300 C360,100 720,500 1080,250 C1260,150 1380,350 1440,300 L1440,600 L0,600 Z" />
            <path className="wave-path wave-2" d="M0,350 C240,200 480,450 720,300 C960,150 1200,400 1440,350 L1440,600 L0,600 Z" />
          </svg>
        </div>
        <div className="bg-particles">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }} />
          ))}
        </div>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <div className="logo-icon"><Zap size={16} /></div>
          <span>Vibe</span>
        </div>
        <div className="landing-nav-links">
          <a href="#">Home</a>
          <a href="#">Blog</a>
          <a href="#">About</a>
          <a href="#">Support</a>
        </div>
        <button className="landing-login-btn" onClick={() => navigate('/chat')}>Login</button>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-left">
          <h1>
            Talk to strangers,<br />
            <span className="gradient-text">Make friends!</span>
          </h1>
          <p className="hero-subtitle">
            Experience a random chat alternative to find friends, connect with people,
            and chat with strangers from all over the world!
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/chat')}>
              <MessageCircle size={18} /> Text Chat
            </button>
            <button className="btn-secondary btn-video-disabled">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              Video Chat
              <span className="coming-soon-tag">Soon</span>
            </button>
          </div>
        </div>
        <div className="hero-right">
          {/* Floating UI cards for visual flair */}
          <div className="floating-card card-notification">
            <Bell size={16} /> New Notification
          </div>
          <div className="floating-card card-user">
            <div className="float-avatar gradient-bg">V</div>
            <div>
              <strong>VibeUser</strong>
              <span className="float-badge">4</span>
            </div>
          </div>
          <div className="floating-card card-chat-bubble">
            <div className="float-avatar cyan-bg">J</div>
            <div>
              <strong>Jon Snow</strong>
              <small>I don't know anything!</small>
            </div>
          </div>
          <div className="floating-card card-filter">
            <div className="filter-title">Country Filter <span className="toggle-pill active" /></div>
            <div className="filter-flags">
              <span>🇺🇸 USA</span>
              <span>🇩🇪 Germany</span>
              <span>🇪🇸 Spain</span>
              <span>🇮🇳 India</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="section-header">
          <h2>Why <span className="gradient-text">Vibe</span>?</h2>
          <p>Everything you need for meaningful anonymous conversations.</p>
        </div>
        <div className="features-grid">
          {[
            { icon: <MessageCircle size={22} />, color: 'purple', title: 'Instant Text Chat', desc: 'Get matched with strangers in seconds. No signup required.' },
            { icon: <Sparkles size={22} />, color: 'cyan', title: 'Smart Matching', desc: 'Interest-based algorithm for better, more relevant conversations.' },
            { icon: <Shield size={22} />, color: 'green', title: 'Safe & Anonymous', desc: 'No personal info required. Report bad actors instantly.' },
            { icon: <Crown size={22} />, color: 'gold', title: 'Premium Filters', desc: 'Gender filters, priority matching, and ad-free experience.' },
            { icon: <UsersIcon size={22} />, color: 'pink', title: 'Friends System', desc: 'Add people you vibe with and chat with them anytime.' },
            { icon: <Globe size={22} />, color: 'cyan', title: 'Global Community', desc: 'Connect with thousands from every corner of the planet, 24/7.' },
          ].map((f, i) => (
            <div className="feature-card" key={i}>
              <div className={`feature-icon ${f.color}`}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready to <span className="gradient-text">Vibe</span>?</h2>
        <p>Join thousands of users chatting right now.</p>
        <button className="btn-primary btn-lg" onClick={() => navigate('/chat')}>
          Start Chatting <ArrowRight size={18} />
        </button>
      </section>

      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} Vibe. All rights reserved.</p>
      </footer>
    </div>
  )
}

function Bell({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}
