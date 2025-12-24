import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'
import { deleteUser } from '../services/authService'
import { generateUserAlertsForUsers } from '../mocks/alertsMock'


export default function UsersList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [period, setPeriod] = useState('mes')
  const [status, setStatus] = useState('todas')
  const [showPasswords, setShowPasswords] = useState({})

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true)
        const res = await api.get('/usuarios/listar')
        const rawUsers = res.data || []

        // obtener teléfonos (si el backend provee datos)
        let phones = []
        try {
          const pRes = await api.get('/usuarios_numeros/listar')
          phones = pRes.data || []
        } catch (err) {
          phones = []
        }

        // enriquecer con teléfono; si el backend no trae conteos, usar generator determinístico
        const generated = generateUserAlertsForUsers(rawUsers, period, status)
        const enriched = rawUsers.map(u => {
          const myPhone = phones.find(p => Number(p.usuarioId) === Number(u.id))
          const gen = generated[u.id]
          // calcular alertas según filtro de estado
          let totalAlerts = 0
          if (gen) {
            if (status === 'activas') totalAlerts = gen.alertasActivas || 0
            else if (status === 'cerradas') totalAlerts = gen.alertasCerradas || 0
            else totalAlerts = (gen.alertasActivas || 0) + (gen.alertasCerradas || 0)
          }
          const typesCounts = gen ? Object.fromEntries(Object.entries(gen.types).map(([k, v]) => [k, (v.activas || 0) + (v.cerradas || 0)])) : { medica: 0, incendio: 0, mecanica: 0, incidentesRobo: 0, otros: 0 }
          return { ...u, alertas: u.alertas || totalAlerts, typesCounts, telefono: myPhone ? myPhone.numero : null }
        })

        setUsers(enriched)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [period, status])

  async function handleDelete(userId) {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return
    }

    setDeleting(userId)
    try {
      await deleteUser(userId)
      setUsers(users.filter(u => u.id !== userId))
    } catch (err) {
      console.error('Error eliminando usuario:', err)
      alert('Error al eliminar el usuario')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ color: '#dc3545', marginBottom: 12 }}>👥 Usuarios Registrados</h2>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: '#333' }}>
          <label style={{ marginRight: 8 }}>Periodo:</label>
          <select value={period} onChange={e => setPeriod(e.target.value)} style={{ padding: '6px 8px', borderRadius: 4 }}>
            <option value="dia">Día</option>
            <option value="semana">Semana</option>
            <option value="mes">Mes</option>
          </select>
        </div>
        <div style={{ fontSize: 13, color: '#333' }}>
          <label style={{ marginRight: 8 }}>Estado:</label>
          <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '6px 8px', borderRadius: 4 }}>
            <option value="todas">Todas</option>
            <option value="activas">Activas</option>
            <option value="cerradas">Cerradas</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>Cargando...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, width: '100%' }}>
          {users.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: 20, textAlign: 'center', color: '#666' }}>No hay usuarios registrados</div>
          ) : (
            users.map(u => (
              <div key={u.id} style={{ padding: 16, border: '2px solid #dc3545', borderRadius: 8, background: '#fff5f5', boxShadow: '0 2px 8px rgba(220, 53, 69, 0.1)', transition: 'transform 0.3s, boxShadow 0.3s' }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(220, 53, 69, 0.2)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.1)';
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <strong style={{ color: '#dc3545', fontSize: 18 }}>👤 {u.nombre}</strong>
                  <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>📧 {u.correo_electronico}</div>
                  <div style={{ marginTop: 6 }}><span style={{ display: 'inline-block', background: '#fff', padding: '4px 8px', borderRadius: 8, border: '1px solid #eee', fontSize: 12 }}>{u.grupo || u.group || 'Sin Grupo'}</span></div>
                  {u.telefono && <div style={{ color: '#333', fontSize: 13, marginTop: 6 }}>📞 {u.telefono}</div>}

                  {/* Mostrar contraseña si el backend la provee (nombres comunes) */}
                  {(() => {
                    const pwd = u.password || u.contrasena || u.plainPassword || u.clave || null
                    if (!pwd) return null
                    const isShown = !!showPasswords[u.id]
                    return (
                      <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ fontSize: 13, color: '#333' }}>🔒 Contraseña: <strong style={{ marginLeft: 6 }}>{isShown ? pwd : '••••••••'}</strong></div>
                        <button onClick={() => setShowPasswords(s => ({ ...s, [u.id]: !s[u.id] }))} style={{ padding: '6px 8px', borderRadius: 6, border: 'none', background: '#007bff', color: 'white', cursor: 'pointer' }}>{isShown ? 'Ocultar' : 'Ver'}</button>
                        <button onClick={() => { navigator.clipboard?.writeText(pwd); alert('Contraseña copiada al portapapeles'); }} style={{ padding: '6px 8px', borderRadius: 6, border: 'none', background: '#6c757d', color: 'white', cursor: 'pointer' }}>Copiar</button>
                      </div>
                    )
                  })()}

                  <div style={{ marginTop: 8, fontSize: 13, color: '#333' }}>⚠️ <strong>{u.alertas || 0}</strong> alertas</div>
                  <div style={{ marginTop: 6, fontSize: 12, color: '#555', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {Object.entries(u.typesCounts || {}).map(([k, v]) => (
                      <div key={k} style={{ background: '#fff', padding: '4px 8px', borderRadius: 12, border: '1px solid #eee', fontSize: 12 }}>{k}: {v}</div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <Link 
                    to={`/users/${u.id}`} 
                    style={{ 
                      flex: 1,
                      background: '#007bff',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: 4,
                      textDecoration: 'none',
                      fontSize: 13,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      transition: 'background 0.3s'
                    }}
                    onMouseOver={e => e.target.style.background = '#0056b3'}
                    onMouseOut={e => e.target.style.background = '#007bff'}
                  >
                    Ver Detalles
                  </Link>
                  <button 
                    onClick={() => handleDelete(u.id)} 
                    disabled={deleting === u.id}
                    style={{ 
                      flex: 1,
                      background: '#dc3545', 
                      color: 'white', 
                      padding: '8px 12px', 
                      border: 'none', 
                      borderRadius: 4,
                      cursor: deleting === u.id ? 'not-allowed' : 'pointer',
                      opacity: deleting === u.id ? 0.6 : 1,
                      fontSize: 13,
                      fontWeight: 'bold',
                      transition: 'background 0.3s'
                    }}
                    onMouseOver={e => !deleting && (e.target.style.background = '#bb2d3b')}
                    onMouseOut={e => !deleting && (e.target.style.background = '#dc3545')}
                  >
                    {deleting === u.id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
