import { Link, useLocation } from 'react-router-dom'
import { Settings, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const location = useLocation()
  const [onlineCount, setOnlineCount] = useState(0)

  useEffect(() => {
    // Simulate online count with realistic fluctuations
    const base = 1200 + Math.floor(Math.random() * 800)
    setOnlineCount(base)
    const interval = setInterval(() => {
      setOnlineCount(prev => {
        const delta = Math.floor(Math.random() * 40) - 20
        return Math.max(800, prev + delta)
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="logo-icon">
          <Zap size={18} />
        </div>
        <span>Vibe</span>
      </Link>

      <div className="navbar-right">
        <div className="online-indicator">
          <div className="online-dot" />
          {onlineCount.toLocaleString()} online
        </div>
        {location.pathname !== '/' && (
          <button className="nav-btn" title="Settings">
            <Settings size={18} />
          </button>
        )}
      </div>
    </nav>
  )
}
