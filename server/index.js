import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

// ============================================
// CONFIG
// ============================================
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'vibe-secret-change-in-production'
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true
  }
})

app.use(cors({ origin: CORS_ORIGIN, credentials: true }))
app.use(express.json())

// ============================================
// IN-MEMORY STORES (Replace with MongoDB in prod)
// ============================================
const users = new Map()          // userId -> userData
const matchQueue = []            // [{ userId, socketId, interests, gender, filterGender, joinedAt }]
const activeMatches = new Map()  // matchId -> { user1, user2, interests, startedAt, messages[] }
const analytics = {
  totalUsers: 0,
  totalChats: 0,
  totalMessages: 0,
  premiumUsers: 0,
  revenue: 0,
  dailyStats: {},
  chatsByHour: new Array(24).fill(0),
  usersByCountry: {},
  activeNow: 0
}

// ============================================
// HELPERS
// ============================================
function generateAnonymousName() {
  const adjectives = [
    'Cosmic', 'Silent', 'Neon', 'Pixel', 'Lunar', 'Frost',
    'Echo', 'Velvet', 'Wild', 'Crystal', 'Dark', 'Golden',
    'Azure', 'Phantom', 'Silver', 'Blaze', 'Mystic', 'Radiant',
    'Serene', 'Vivid', 'Dreamy', 'Electric', 'Twilight', 'Stellar'
  ]
  const nouns = [
    'Wanderer', 'Wave', 'Fox', 'Dancer', 'Shadow', 'Storm',
    'Sky', 'Spark', 'Edge', 'Bloom', 'Drift', 'Wind',
    'Rain', 'Spirit', 'Flame', 'Whisper', 'River', 'Phoenix',
    'Comet', 'Star', 'Falcon', 'Aurora', 'Ember', 'Breeze'
  ]
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  return `${adj} ${noun}`
}

function createToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' })
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

function todayKey() {
  return new Date().toISOString().split('T')[0]
}

function updateDailyStats(field) {
  const day = todayKey()
  if (!analytics.dailyStats[day]) {
    analytics.dailyStats[day] = { users: 0, chats: 0, messages: 0, revenue: 0 }
  }
  analytics.dailyStats[day][field]++
}

function findMatch(queueEntry) {
  for (let i = 0; i < matchQueue.length; i++) {
    const candidate = matchQueue[i]
    if (candidate.userId === queueEntry.userId) continue

    // Premium gender filter check (server-side enforcement!)
    if (queueEntry.isPremium && queueEntry.filterGender !== 'both') {
      if (candidate.gender !== queueEntry.filterGender) continue
    }
    if (candidate.isPremium && candidate.filterGender !== 'both') {
      if (queueEntry.gender !== candidate.filterGender) continue
    }

    // Interest matching score
    const sharedInterests = queueEntry.interests.filter(
      i => candidate.interests.includes(i)
    )

    // Accept match (prefer shared interests, but allow random)
    if (sharedInterests.length > 0 || Math.random() > 0.3) {
      matchQueue.splice(i, 1)
      return { candidate, sharedInterests }
    }
  }
  return null
}

// ============================================
// REST API ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() })
})

// Anonymous signup
app.post('/api/auth/signup', (req, res) => {
  const userId = uuidv4()
  const username = generateAnonymousName()
  const user = {
    id: userId,
    username,
    gender: null,
    isPremium: false,
    subscription: null,
    matchPreferences: {
      withInterests: true,
      genderFilter: null,
      interestTimeout: 10
    },
    badges: [],
    createdAt: new Date().toISOString()
  }
  users.set(userId, user)
  analytics.totalUsers++
  updateDailyStats('users')

  const token = createToken(userId)
  res.json({ user, token })
})

// Get current user
app.get('/api/users/me', (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'No token' })

  const decoded = verifyToken(authHeader.replace('Bearer ', ''))
  if (!decoded) return res.status(401).json({ error: 'Invalid token' })

  const user = users.get(decoded.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })

  res.json(user)
})

// Update user profile (with SERVER-SIDE premium validation!)
app.patch('/api/users/me', (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'No token' })

  const decoded = verifyToken(authHeader.replace('Bearer ', ''))
  if (!decoded) return res.status(401).json({ error: 'Invalid token' })

  const user = users.get(decoded.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })

  const { gender, matchPreferences } = req.body

  // Block mass assignment of protected fields
  if (req.body.isPremium !== undefined || req.body.badges !== undefined || req.body.subscription !== undefined) {
    return res.status(400).json({ error: 'Validation failed: cannot modify protected fields' })
  }

  // Update allowed fields
  if (gender) user.gender = gender

  if (matchPreferences) {
    // SERVER-SIDE ENFORCEMENT: Only premium users can set gender filter
    if (matchPreferences.genderFilter && matchPreferences.genderFilter !== null) {
      if (!user.isPremium) {
        return res.status(403).json({
          error: 'Gender filter requires premium subscription',
          code: 'PREMIUM_REQUIRED'
        })
      }
    }
    user.matchPreferences = { ...user.matchPreferences, ...matchPreferences }
  }

  users.set(decoded.userId, user)
  res.json(user)
})

// Get active match
app.get('/api/match/active', (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'No token' })

  const decoded = verifyToken(authHeader.replace('Bearer ', ''))
  if (!decoded) return res.status(401).json({ error: 'Invalid token' })

  // Find active match for this user
  for (const [matchId, match] of activeMatches) {
    if (match.user1.userId === decoded.userId || match.user2.userId === decoded.userId) {
      return res.json({ matchId, ...match })
    }
  }

  res.json({ match: null })
})

// ============================================
// ANALYTICS API (for owner dashboard)
// ============================================
app.get('/api/analytics/overview', (req, res) => {
  // In production, protect this with admin auth
  const apiKey = req.headers['x-api-key']
  if (apiKey !== (process.env.ANALYTICS_API_KEY || 'vibe-admin-key')) {
    return res.status(403).json({ error: 'Invalid API key' })
  }

  res.json({
    totalUsers: analytics.totalUsers,
    totalChats: analytics.totalChats,
    totalMessages: analytics.totalMessages,
    premiumUsers: analytics.premiumUsers,
    revenue: analytics.revenue,
    activeNow: io.engine.clientsCount || 0,
    queueSize: matchQueue.length,
    activeMatches: activeMatches.size,
    dailyStats: analytics.dailyStats,
    chatsByHour: analytics.chatsByHour,
    timestamp: new Date().toISOString()
  })
})

app.get('/api/analytics/earnings', (req, res) => {
  const apiKey = req.headers['x-api-key']
  if (apiKey !== (process.env.ANALYTICS_API_KEY || 'vibe-admin-key')) {
    return res.status(403).json({ error: 'Invalid API key' })
  }

  // Compute earnings breakdown
  const dailyEarnings = {}
  for (const [day, stats] of Object.entries(analytics.dailyStats)) {
    dailyEarnings[day] = {
      ...stats,
      revenue: stats.revenue || 0
    }
  }

  res.json({
    totalRevenue: analytics.revenue,
    premiumSubscribers: analytics.premiumUsers,
    dailyBreakdown: dailyEarnings,
    currency: 'INR',
    timestamp: new Date().toISOString()
  })
})

app.get('/api/analytics/users', (req, res) => {
  const apiKey = req.headers['x-api-key']
  if (apiKey !== (process.env.ANALYTICS_API_KEY || 'vibe-admin-key')) {
    return res.status(403).json({ error: 'Invalid API key' })
  }

  res.json({
    totalRegistered: analytics.totalUsers,
    currentlyOnline: io.engine.clientsCount || 0,
    inQueue: matchQueue.length,
    inActiveChats: activeMatches.size * 2,
    premiumCount: analytics.premiumUsers,
    recentSignups: Array.from(users.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20)
      .map(u => ({ id: u.id, username: u.username, gender: u.gender, isPremium: u.isPremium, createdAt: u.createdAt })),
    timestamp: new Date().toISOString()
  })
})

// ============================================
// SOCKET.IO — Real-time Matching & Chat
// ============================================
io.on('connection', (socket) => {
  let currentUserId = null
  let currentMatchId = null

  console.log(`[Socket] Connected: ${socket.id}`)
  analytics.activeNow++

  // Authenticate
  socket.on('auth', ({ token }) => {
    const decoded = verifyToken(token)
    if (!decoded) {
      socket.emit('auth_error', { message: 'Invalid token' })
      return
    }
    currentUserId = decoded.userId
    socket.emit('auth_success', { userId: currentUserId })
    console.log(`[Socket] Authenticated: ${currentUserId}`)
  })

  // Join matching queue
  socket.on('join_queue', ({ interests = [], gender, filterGender = 'both' }) => {
    if (!currentUserId) return

    const user = users.get(currentUserId)
    if (!user) return

    // Server-side premium check for gender filter
    const effectiveFilter = user.isPremium ? filterGender : 'both'

    const queueEntry = {
      userId: currentUserId,
      socketId: socket.id,
      interests,
      gender: gender || user.gender,
      filterGender: effectiveFilter,
      isPremium: user.isPremium,
      joinedAt: Date.now()
    }

    // Remove from queue if already there
    const existingIdx = matchQueue.findIndex(e => e.userId === currentUserId)
    if (existingIdx >= 0) matchQueue.splice(existingIdx, 1)

    // Try to find a match immediately
    const result = findMatch(queueEntry)

    if (result) {
      // Match found!
      const matchId = uuidv4()
      const match = {
        user1: queueEntry,
        user2: result.candidate,
        sharedInterests: result.sharedInterests,
        startedAt: Date.now(),
        messages: []
      }
      activeMatches.set(matchId, match)
      analytics.totalChats++
      const hour = new Date().getHours()
      analytics.chatsByHour[hour]++
      updateDailyStats('chats')

      // Notify both users
      socket.join(matchId)
      const partnerSocket = io.sockets.sockets.get(result.candidate.socketId)
      if (partnerSocket) partnerSocket.join(matchId)

      const user1Data = users.get(queueEntry.userId)
      const user2Data = users.get(result.candidate.userId)

      socket.emit('match_found', {
        matchId,
        partner: { username: user2Data?.username || 'Stranger', gender: result.candidate.gender },
        sharedInterests: result.sharedInterests
      })

      if (partnerSocket) {
        partnerSocket.emit('match_found', {
          matchId,
          partner: { username: user1Data?.username || 'Stranger', gender: queueEntry.gender },
          sharedInterests: result.sharedInterests
        })
      }

      currentMatchId = matchId
      console.log(`[Match] ${queueEntry.userId} <-> ${result.candidate.userId} | Shared: ${result.sharedInterests.join(', ')}`)
    } else {
      // No match yet, add to queue
      matchQueue.push(queueEntry)
      socket.emit('queue_joined', { position: matchQueue.length })
      console.log(`[Queue] ${currentUserId} waiting. Queue size: ${matchQueue.length}`)
    }
  })

  // Leave queue
  socket.on('leave_queue', () => {
    const idx = matchQueue.findIndex(e => e.userId === currentUserId)
    if (idx >= 0) {
      matchQueue.splice(idx, 1)
      socket.emit('queue_left')
      console.log(`[Queue] ${currentUserId} left queue`)
    }
  })

  // Send message
  socket.on('send_message', ({ matchId, text }) => {
    if (!matchId || !text) return

    const match = activeMatches.get(matchId)
    if (!match) return

    const message = {
      id: uuidv4(),
      sender: currentUserId,
      text: text.substring(0, 2000), // Limit message length
      timestamp: Date.now()
    }

    match.messages.push(message)
    analytics.totalMessages++
    updateDailyStats('messages')

    // Broadcast to the room
    socket.to(matchId).emit('new_message', message)
  })

  // Typing indicator
  socket.on('typing_start', ({ matchId }) => {
    socket.to(matchId).emit('partner_typing', { isTyping: true })
  })

  socket.on('typing_stop', ({ matchId }) => {
    socket.to(matchId).emit('partner_typing', { isTyping: false })
  })

  // Disconnect from match
  socket.on('disconnect_match', ({ matchId }) => {
    const match = activeMatches.get(matchId)
    if (match) {
      socket.to(matchId).emit('partner_disconnected')
      activeMatches.delete(matchId)
      socket.leave(matchId)
      currentMatchId = null
      console.log(`[Match] ${currentUserId} disconnected from match ${matchId}`)
    }
  })

  // Report user
  socket.on('report_user', ({ matchId, reason }) => {
    console.log(`[Report] User ${currentUserId} reported match ${matchId}: ${reason}`)
    // In production: save to DB, auto-moderate, etc.
  })

  // Socket disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`)
    analytics.activeNow = Math.max(0, analytics.activeNow - 1)

    // Remove from queue
    const idx = matchQueue.findIndex(e => e.userId === currentUserId)
    if (idx >= 0) matchQueue.splice(idx, 1)

    // Notify partner if in active match
    if (currentMatchId) {
      const match = activeMatches.get(currentMatchId)
      if (match) {
        socket.to(currentMatchId).emit('partner_disconnected')
        activeMatches.delete(currentMatchId)
      }
    }
  })
})

// ============================================
// START SERVER
// ============================================
httpServer.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   🚀 Vibe Server Running            ║
  ║   Port: ${PORT}                        ║
  ║   API:  http://localhost:${PORT}/api    ║
  ║   WS:   ws://localhost:${PORT}          ║
  ╚══════════════════════════════════════╝
  `)
})
