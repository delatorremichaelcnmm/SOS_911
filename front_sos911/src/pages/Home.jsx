import React from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUser } from '../services/authService'

export default function Home() {
  const user = getCurrentUser()

  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ color: '#dc3545', fontSize: 48, marginBottom: 20 }}>🚨 SOS911</h1>
        <p style={{ fontSize: 18, color: '#666', marginBottom: 30 }}>
          Plataforma integral de respuesta a emergencias
        </p>

        {user ? (
          <div style={{ background: '#fff5f5', padding: 30, borderRadius: 8, border: '2px solid #dc3545' }}>
            <h2 style={{ color: '#dc3545', marginBottom: 20 }}>Bienvenido, {user.nombre}!</h2>
            <p style={{ color: '#666', marginBottom: 20 }}>
              Accede a tu red de seguridad y gestiona tus contactos de emergencia.
            </p>
            <Link 
              to="/users" 
              style={{
                display: 'inline-block',
                background: '#dc3545',
                color: 'white',
                padding: '12px 30px',
                borderRadius: 4,
                textDecoration: 'none',
                fontSize: 16,
                fontWeight: 'bold'
              }}
            >
              Ir a Usuarios
            </Link>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 16, color: '#666', marginBottom: 30 }}>
              Por favor, inicia sesión para acceder al sistema.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <Link 
                to="/login" 
                style={{
                  background: '#dc3545',
                  color: 'white',
                  padding: '12px 30px',
                  borderRadius: 4,
                  textDecoration: 'none',
                  fontSize: 16,
                  fontWeight: 'bold'
                }}
              >
                Iniciar Sesión
              </Link>
              <Link 
                to="/register" 
                style={{
                  background: '#6c757d',
                  color: 'white',
                  padding: '12px 30px',
                  borderRadius: 4,
                  textDecoration: 'none',
                  fontSize: 16,
                  fontWeight: 'bold'
                }}
              >
                Registrarse
              </Link>
            </div>
          </div>
        )}

        <div style={{ marginTop: 50, paddingTop: 30, borderTop: '1px solid #ddd' }}>
          <h3 style={{ color: '#dc3545', marginBottom: 15 }}>Características principales:</h3>
          <ul style={{ textAlign: 'left', display: 'inline-block', color: '#666' }}>
            <li>✓ Gestión de contactos de emergencia</li>
            <li>✓ Red de seguridad familiar y vecinal</li>
            <li>✓ Ubicación en tiempo real</li>
            <li>✓ Notificaciones instantáneas</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
