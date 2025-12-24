import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../services/authService'
import api from '../services/api'

export default function CreateUser() {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [telefono, setTelefono] = useState('')
  const [grupo, setGrupo] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!nombre.trim()) return setError('El nombre es requerido')
    if (!correo.trim() || !validateEmail(correo)) return setError('Correo inválido')
    if (!contrasena || contrasena.length < 6) return setError('Contraseña mínima 6 caracteres')

    setLoading(true)
    try {
      const payload = { nombre, correo_electronico: correo, contrasena }
      // registrar usuario (backend maneja la creación)
      const created = await register(payload)

      // si se proporcionó teléfono, validar y crear registro en /usuarios_numeros/crear
      if (telefono && created && created.userId) {
        const digits = (telefono || '').toString().replace(/\D/g, '')
        if (digits.length < 9) {
          // no bloquear creación del usuario si el teléfono es inválido; solo avisar
          console.warn('Teléfono inválido (debe tener al menos 9 dígitos); usuario creado sin teléfono')
        } else {
          try {
            const csrfRes = await api.get('/csrf-token')
            const csrfToken = csrfRes?.data?.csrfToken
            const headers = csrfToken ? { 'X-CSRF-Token': csrfToken } : {}
            await api.post('/usuarios_numeros/crear', { nombre: 'Teléfono de contacto', numero: digits, usuarioId: created.userId }, { headers })
          } catch (err) {
            console.warn('No se pudo crear teléfono:', err?.response?.data || err.message)
          }
        }
      }

      // Si se proporcionó grupo, no hay endpoint para grupos en registros públicos; es solo visual (mock)
      navigate('/users')
    } catch (err) {
      setError(err.response?.data?.error || 'Error creando usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '20px auto' }}>
      <div style={{ background: '#fff5f5', padding: 24, borderRadius: 8, border: '2px solid #dc3545' }}>
        <h2 style={{ color: '#dc3545', textAlign: 'center' }}>➕ Crear Usuario</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <input placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 6 }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <input placeholder="Correo" value={correo} onChange={e => setCorreo(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 6 }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <input type="password" placeholder="Contraseña" value={contrasena} onChange={e => setContrasena(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 6 }} />
          </div>
          <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
            <input placeholder="Teléfono (opcional)" value={telefono} onChange={e => setTelefono(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 6 }} />
            <input placeholder="Grupo (opcional)" value={grupo} onChange={e => setGrupo(e.target.value)} style={{ padding: 10, borderRadius: 6 }} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: 10, background: '#28a745', color: 'white', border: 'none', borderRadius: 6, fontWeight: 'bold' }}>{loading ? 'Creando...' : 'Crear Usuario'}</button>
            <button type="button" onClick={() => navigate('/users')} style={{ padding: 10, background: '#6c757d', color: 'white', border: 'none', borderRadius: 6 }}>Cancelar</button>
          </div>

          {error && <div style={{ color: '#dc3545', marginTop: 12 }}>{error}</div>}
          <div style={{ marginTop: 8, color: '#666', fontSize: 13 }}>Nota: el campo <strong>Grupo</strong> es opcional; el teléfono se guarda si el backend lo acepta.</div>
        </form>
      </div>
    </div>
  )
}
