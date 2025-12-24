import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer style={{
      background: '#dc3545',
      color: 'white',
      padding: '30px 20px',
      marginTop: 'auto',
      boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 30, marginBottom: 30 }}>
          {/* Sección: Sobre SOS911 */}
          <div>
            <h4 style={{ marginBottom: 12, fontSize: 16 }}>🚨 SOS911</h4>
            <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.9 }}>
              Plataforma integral de respuesta a emergencias que conecta a usuarios en situaciones críticas con servicios de emergencia y contactos de confianza.
            </p>
          </div>

          {/* Sección: Enlaces rápidos */}
          <div>
            <h4 style={{ marginBottom: 12, fontSize: 16 }}>Enlaces Rápidos</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: 8 }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none', opacity: 0.9, transition: 'opacity 0.3s' }}
                  onMouseOver={e => e.target.style.opacity = '1'}
                  onMouseOut={e => e.target.style.opacity = '0.9'}
                >
                  Inicio
                </Link>
              </li>
              <li style={{ marginBottom: 8 }}>
                <Link to="/login" style={{ color: 'white', textDecoration: 'none', opacity: 0.9, transition: 'opacity 0.3s' }}
                  onMouseOver={e => e.target.style.opacity = '1'}
                  onMouseOut={e => e.target.style.opacity = '0.9'}
                >
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link to="/register" style={{ color: 'white', textDecoration: 'none', opacity: 0.9, transition: 'opacity 0.3s' }}
                  onMouseOver={e => e.target.style.opacity = '1'}
                  onMouseOut={e => e.target.style.opacity = '0.9'}
                >
                  Registrarse
                </Link>
              </li>
            </ul>
          </div>

          {/* Sección: Características */}
          <div>
            <h4 style={{ marginBottom: 12, fontSize: 16 }}>Características</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: 14 }}>
              <li style={{ marginBottom: 8 }}>✓ Gestión de contactos</li>
              <li style={{ marginBottom: 8 }}>✓ Red de seguridad</li>
              <li style={{ marginBottom: 8 }}>✓ Ubicación en tiempo real</li>
              <li>✓ Notificaciones instantáneas</li>
            </ul>
          </div>
        </div>

        {/* Separador */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <p style={{ fontSize: 12, opacity: 0.8, margin: 0 }}>
              © {currentYear} SOS911. Todos los derechos reservados.
            </p>
            <div style={{ display: 'flex', gap: 20, fontSize: 12 }}>
              <a href="#privacy" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Privacidad</a>
              <a href="#terms" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Términos</a>
              <a href="#contact" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Contacto</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
