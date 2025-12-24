import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/authService'

export default function Login() {
  const [correo_electronico, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState({})
  const navigate = useNavigate()

  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setValidationErrors({})
    setError('')

    const errors = {}
    if (!correo_electronico.trim()) {
      errors.correo = 'El correo es requerido'
    } else if (!validateEmail(correo_electronico)) {
      errors.correo = 'Ingresa un correo válido'
    }
    if (!contrasena.trim()) {
      errors.contrasena = 'La contraseña es requerida'
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    try {
      await login({ correo_electronico, contrasena })
      navigate('/users')
    } catch (err) {
      setError(err.response?.data?.message || 'Error en el login')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <div style={{ 
        background: '#fff5f5', 
        padding: 30, 
        borderRadius: 8, 
        border: '2px solid #dc3545',
        boxShadow: '0 2px 8px rgba(220, 53, 69, 0.1)'
      }}>
        <h2 style={{ color: '#dc3545', marginBottom: 20, textAlign: 'center' }}>🔐 Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <input 
              placeholder="Correo electrónico" 
              value={correo_electronico} 
              onChange={e => setCorreo(e.target.value)}
              style={{ 
                width: '100%', 
                padding: 10, 
                boxSizing: 'border-box', 
                border: validationErrors.correo ? '2px solid #dc3545' : '1px solid #ccc',
                borderRadius: 4,
                fontSize: 14
              }}
            />
            {validationErrors.correo && <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>{validationErrors.correo}</div>}
          </div>
          <div style={{ marginBottom: 12 }}>
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={contrasena} 
              onChange={e => setContrasena(e.target.value)}
              style={{ 
                width: '100%', 
                padding: 10, 
                boxSizing: 'border-box', 
                border: validationErrors.contrasena ? '2px solid #dc3545' : '1px solid #ccc',
                borderRadius: 4,
                fontSize: 14
              }}
            />
            {validationErrors.contrasena && <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>{validationErrors.contrasena}</div>}
          </div>
          <button type="submit" style={{ 
            width: '100%', 
            padding: 10, 
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            fontSize: 16,
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background 0.3s'
          }}
          onMouseOver={e => e.target.style.background = '#bb2d3b'}
          onMouseOut={e => e.target.style.background = '#dc3545'}
          >
            Entrar
          </button>
          {error && <div style={{ color: '#dc3545', marginTop: 12, textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
          ¿No tienes cuenta? <a href="/register" style={{ color: '#dc3545', textDecoration: 'none', fontWeight: 'bold' }}>Regístrate aquí</a>
        </p>
      </div>
    </div>
  )
}
