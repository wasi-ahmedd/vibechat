import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Landing from './pages/Landing'
import ChatLobby from './pages/ChatLobby'
import ChatRoom from './pages/ChatRoom'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<AppLayout />}>
        <Route path="/chat" element={<ChatLobby />} />
        <Route path="/chat/:matchId" element={<ChatRoom />} />
      </Route>
    </Routes>
  )
}

export default App
