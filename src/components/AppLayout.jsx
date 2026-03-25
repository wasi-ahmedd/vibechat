import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  MessageCircle, Users, Settings, Volume2, VolumeX,
  Crown, Zap, MoreHorizontal, Search, Bell, User, Plus
} from 'lucide-react'

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('chat')
  const [username] = useState(() => {
    const adjs = ['cosmic', 'silent', 'neon', 'pixel', 'lunar', 'frost', 'echo', 'velvet', 'wild', 'crystal']
    const nouns = ['wanderer', 'wave', 'fox', 'dancer', 'shadow', 'storm', 'sky', 'spark']
    return `${adjs[Math.floor(Math.random() * adjs.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`
  })
  const [isMuted, setIsMuted] = useState(false)

  return (
    <div className="app-layout">
      {/* Anonymous Banner */}
      <div className="anon-banner">
        <span>You're using an anonymous account. All changes will be lost after logging out.</span>
        <button className="claim-btn">Claim Account</button>
      </div>

      {/* Top Bar */}
      <div className="app-topbar">
        <Link to="/" className="topbar-brand">
          <div className="logo-icon"><Zap size={16} /></div>
          <span>Vibe</span>
        </Link>
        <div className="topbar-title">
          {location.pathname === '/chat' ? 'New Chat' : 'Chat'}
        </div>
        <div className="topbar-right">
          <button className="topbar-icon-btn"><Users size={18} /></button>
          <button className="topbar-icon-btn"><Bell size={18} /></button>
          <button className="topbar-icon-btn"><User size={18} /></button>
        </div>
      </div>

      <div className="app-body">
        {/* Sidebar */}
        <aside className="sidebar">
          {/* Tabs */}
          <div className="sidebar-tabs">
            <button
              className={`sidebar-tab ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              <MessageCircle size={16} /> Chat
            </button>
            <button
              className={`sidebar-tab ${activeTab === 'friends' ? 'active' : ''}`}
              onClick={() => setActiveTab('friends')}
            >
              <Users size={16} /> Friends
            </button>
          </div>

          {/* Tab Content */}
          <div className="sidebar-content">
            {activeTab === 'chat' ? (
              <>
                {/* New Chat Link */}
                <button
                  className={`sidebar-item ${location.pathname === '/chat' ? 'active' : ''}`}
                  onClick={() => navigate('/chat')}
                >
                  <MessageCircle size={16} /> New Chat
                </button>

                <div className="sidebar-divider" />
                <div className="sidebar-section-title">DIRECT MESSAGES</div>

                {/* Empty state */}
                <div className="sidebar-empty">
                  <div className="sidebar-empty-icon">💬</div>
                  <p>Looks like you're the popular one here. No messages yet!</p>
                </div>
              </>
            ) : (
              <>
                {/* Friends Search */}
                <div className="friends-search">
                  <Search size={14} />
                  <input type="text" placeholder="Search Friends" />
                </div>
                <div className="sidebar-section-title">FRIENDS LIST</div>

                {/* Empty state */}
                <div className="sidebar-empty">
                  <div className="sidebar-empty-icon">👥</div>
                  <p>No friends, no drama. Enjoy the peace! ...or add some friends.</p>
                </div>
              </>
            )}
          </div>

          {/* Premium Card */}
          <div className="sidebar-premium">
            <Crown size={28} className="premium-icon-float" />
            <p>Unlock chat filters, Send and receive images and videos and more!</p>
            <button className="sidebar-premium-btn">Get Premium</button>
          </div>

          {/* User Footer */}
          <div className="sidebar-user-footer">
            <div className="user-avatar-sm">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="user-info-sm">
              <span className="user-name-sm">{username}</span>
              <span className="user-status-sm">Free</span>
            </div>
            <div className="user-actions-sm">
              <button onClick={() => setIsMuted(!isMuted)} title={isMuted ? 'Unmute' : 'Mute'}>
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <button title="Settings"><Settings size={14} /></button>
              <button title="More"><MoreHorizontal size={14} /></button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
