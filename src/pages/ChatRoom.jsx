import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Send, RefreshCw, Flag, LogOut, UserPlus } from 'lucide-react'
import { io } from 'socket.io-client'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatRoom() {
  const navigate = useNavigate()
  const { matchId } = useParams()
  const location = useLocation()
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const socketRef = useRef(null)

  const matchInfo = location.state || {}
  const [partnerName, setPartnerName] = useState(matchInfo.partnerName || 'Stranger')
  const [sharedInterests, setSharedInterests] = useState(matchInfo.sharedInterests || [])
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const typingTimeoutRef = useRef(null)

  // Connect to socket and join the match room
  useEffect(() => {
    const socket = io(SERVER_URL, { transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[Vibe] Connected to server')
      socket.emit('join_room', { matchId })
    })

    // Receive messages from partner
    socket.on('new_message', (message) => {
      setMessages(prev => [...prev, {
        id: message.id || `recv-${Date.now()}`,
        type: 'received',
        text: message.text,
        time: new Date(message.timestamp || Date.now())
      }])
    })

    // Partner typing
    socket.on('partner_typing', ({ isTyping: typing }) => {
      setIsTyping(typing)
    })

    // Partner disconnected
    socket.on('partner_disconnected', () => {
      setIsConnected(false)
      setMessages(prev => [...prev, {
        id: `sys-disc-${Date.now()}`,
        type: 'system',
        variant: 'disconnected',
        text: 'Stranger has disconnected',
        time: new Date()
      }])
    })

    // Add initial system messages
    setMessages([
      {
        id: `sys-connect-${Date.now()}`,
        type: 'system',
        variant: 'connected',
        text: `You're now chatting with a stranger`,
        time: new Date()
      },
      ...(sharedInterests.length > 0 ? [{
        id: `sys-interests-${Date.now()}`,
        type: 'system',
        text: `You both like: ${sharedInterests.join(', ')}`,
        time: new Date()
      }] : [])
    ])

    return () => {
      socket.disconnect()
    }
  }, [matchId])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = () => {
    const text = inputValue.trim()
    if (!text || !isConnected) return

    const msg = {
      id: `me-${Date.now()}`,
      type: 'sent',
      text,
      time: new Date()
    }

    setMessages(prev => [...prev, msg])
    setInputValue('')
    inputRef.current?.focus()

    // Send via socket
    socketRef.current?.emit('send_message', { matchId, text })
  }

  const handleTyping = () => {
    socketRef.current?.emit('typing_start', { matchId })
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('typing_stop', { matchId })
    }, 1500)
  }

  const handleNewChat = () => {
    socketRef.current?.emit('disconnect_match', { matchId })
    navigate('/chat')
  }

  const handleDisconnect = () => {
    socketRef.current?.emit('disconnect_match', { matchId })
    setIsConnected(false)
    setMessages(prev => [...prev, {
      id: `sys-you-disc-${Date.now()}`,
      type: 'system',
      variant: 'disconnected',
      text: 'You disconnected from the chat',
      time: new Date()
    }])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="chat-room">
      {/* Partner Bar */}
      <div className="chat-partner-bar">
        <div className="partner-info">
          <div className="partner-avatar">S</div>
          <div className="partner-details">
            <h3>Stranger</h3>
            {sharedInterests.length > 0 && (
              <div className="partner-tags">
                {sharedInterests.map(i => <span key={i}>{i}</span>)}
              </div>
            )}
          </div>
        </div>
        <div className="partner-actions">
          <button className="btn-new-chat" onClick={handleNewChat}>
            <RefreshCw size={14} /> New
          </button>
          <button className="btn-add-friend" title="Add as friend">
            <UserPlus size={14} /> Add
          </button>
          <button className="btn-report">
            <Flag size={14} />
          </button>
          <button className="btn-disconnect" onClick={handleDisconnect} disabled={!isConnected}>
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map(msg => {
          if (msg.type === 'system') {
            return (
              <div key={msg.id} className={`system-message ${msg.variant || ''}`}>
                {msg.text}
              </div>
            )
          }
          return (
            <div key={msg.id} className={`chat-bubble ${msg.type}`}>
              {msg.text}
              <div className="bubble-time">{formatTime(msg.time)}</div>
            </div>
          )
        })}
        {isTyping && (
          <div className="typing-indicator">
            <span /><span /><span />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="message-input-bar">
        <div className="message-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            placeholder={isConnected ? 'Type a message...' : 'Chat ended. Click New to start another.'}
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); handleTyping() }}
            onKeyDown={handleKeyDown}
            disabled={!isConnected}
            autoFocus
          />
          <button
            className="btn-send"
            onClick={sendMessage}
            disabled={!inputValue.trim() || !isConnected}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
