import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../services/authService'

export default function Register() {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [confirmContrasena, setConfirmContrasena] = useState('')
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
    if (!nombre.trim()) {
      errors.nombre = 'El nombre es requerido'
    } else if (nombre.trim().length < 3) {
      errors.nombre = 'El nombre debe tener al menos 3 caracteres'
    }
    if (!correo.trim()) {
      errors.correo = 'El correo es requerido'
    } else if (!validateEmail(correo)) {
      errors.correo = 'Ingresa un correo válido'
    }
    if (!contrasena.trim()) {
      errors.contrasena = 'La contraseña es requerida'
    } else if (contrasena.length < 6) {
      errors.contrasena = 'La contraseña debe tener al menos 6 caracteres'
    }
    if (!confirmContrasena.trim()) {
      errors.confirmContrasena = 'La confirmación es requerida'
    } else if (contrasena !== confirmContrasena) {
      errors.confirmContrasena = 'Las contraseñas no coinciden'
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    try {
      await register({ nombre, correo_electronico: correo, contrasena })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Error en el registro')
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
        <h2 style={{ color: '#dc3545', marginBottom: 20, textAlign: 'center' }}>✍️ Registrarse</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <input 
              placeholder="Nombre" 
              value={nombre} 
              onChange={e => setNombre(e.target.value)}
              style={{ 
                width: '100%', 
                padding: 10, 
                boxSizing: 'border-box', 
                border: validationErrors.nombre ? '2px solid #dc3545' : '1px solid #ccc',
                borderRadius: 4,
                fontSize: 14
              }}
            />
            {validationErrors.nombre && <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>{validationErrors.nombre}</div>}
          </div>
          <div style={{ marginBottom: 12 }}>
            <input 
              placeholder="Correo" 
              value={correo} 
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
              placeholder="Contraseña (min. 6 caracteres)" 
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
          <div style={{ marginBottom: 12 }}>
            <input 
              type="password" 
              placeholder="Confirmar contraseña" 
              value={confirmContrasena} 
              onChange={e => setConfirmContrasena(e.target.value)}
              style={{ 
                width: '100%', 
                padding: 10, 
                boxSizing: 'border-box', 
                border: validationErrors.confirmContrasena ? '2px solid #dc3545' : '1px solid #ccc',
                borderRadius: 4,
                fontSize: 14
              }}
            />
            {validationErrors.confirmContrasena && <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>{validationErrors.confirmContrasena}</div>}
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
            cursor: 'pointer'
          }}
          onMouseOver={e => e.target.style.background = '#bb2d3b'}
          onMouseOut={e => e.target.style.background = '#dc3545'}
          >
            Crear cuenta
          </button>
          {error && <div style={{ color: '#dc3545', marginTop: 12, textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
          ¿Ya tienes cuenta? <a href="/login" style={{ color: '#dc3545', textDecoration: 'none', fontWeight: 'bold' }}>Inicia sesión aquí</a>
        </p>
      </div>
    </div>
  )
}
