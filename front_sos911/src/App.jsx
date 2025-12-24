import React from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AlertsZones from './pages/AlertsZones'
import UsersList from './pages/UsersList'
import CreateUser from './pages/CreateUser'
import UserProfile from './pages/UserProfile'
import ProtectedRoute from './components/ProtectedRoute'
import Footer from './components/Footer'
import { getCurrentUser, logout } from './services/authService'

function App() {
  const navigate = useNavigate()
  const user = getCurrentUser()

  function handleLogout() {
    logout()
    navigate('/')
  }

  const navStyle = {
    padding: '12px 20px',
    background: '#dc3545',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  }

  const linkStyle = {
    marginRight: 12,
    color: 'white',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: 14,
    transition: 'opacity 0.3s'
  }

  const logoutButtonStyle = {
    background: 'white',
    color: '#dc3545',
    padding: '8px 16px',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background 0.3s'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <nav style={navStyle}>
        <div>
          <Link to="/" style={linkStyle}>🚨 SOS911</Link>
          {user && (
            <>
              <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
              <Link to="/zones" style={linkStyle}>Zonas</Link>
              <Link to="/users" style={linkStyle}>Usuarios</Link>
            </>
          )}
        </div>
        {user ? (
          <button 
            onClick={handleLogout} 
            style={logoutButtonStyle}
            onMouseOver={e => e.target.style.background = '#f0f0f0'}
            onMouseOut={e => e.target.style.background = 'white'}
          >
            Logout
          </button>
        ) : (
          <div>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/register" style={linkStyle}>Register</Link>
          </div>
        )}
      </nav>

      <main style={{ padding: '16px 8px', flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/zones" element={<ProtectedRoute><AlertsZones /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UsersList /></ProtectedRoute>} />
          <Route path="/users/new" element={<ProtectedRoute><CreateUser /></ProtectedRoute>} />
          <Route path="/users/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App
