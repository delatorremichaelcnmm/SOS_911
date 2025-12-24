import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import { generateUserAlertsForUsers } from '../mocks/alertsMock'

export default function UserProfile() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({})
  const [message, setMessage] = useState(null)


  const [phones, setPhones] = useState([])
  const [newPhone, setNewPhone] = useState('')
  const [addingPhone, setAddingPhone] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleDeletePhone(phoneId) {
    if (!window.confirm('¿Eliminar este teléfono?')) return
    try {
      const csrfRes = await api.get('/csrf-token')
      const csrfToken = csrfRes?.data?.csrfToken
      const headers = csrfToken ? { 'X-CSRF-Token': csrfToken } : {}
      await api.delete(`/usuarios_numeros/eliminar/${phoneId}`, { headers })
      setPhones(prev => prev.filter(p => Number(p.id) !== Number(phoneId)))
    } catch (err) {
      console.error('Error eliminando teléfono', err)
      alert(err?.response?.data?.message || 'Error al eliminar teléfono')
    }
  }

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get(`/usuarios/detalle/${id}`)
        setUser(res.data)
        setForm({
          nombre: res.data?.nombre || '',
          correo_electronico: res.data?.correo_electronico || '',
          cedula_identidad: res.data?.cedula_identidad || '',
          direccion: res.data?.direccion || '',
          fecha_nacimiento: res.data?.fecha_nacimiento || '',
          estado: res.data?.estado || 'activo'
        })

        // cargar números de teléfono para este usuario
        try {
          const phonesRes = await api.get('/usuarios_numeros/listar')
          const allNums = phonesRes.data || []
          const myNums = allNums.filter(n => Number(n.usuarioId) === Number(id))
          setPhones(myNums)
        } catch (err) {
          console.warn('No se pudo obtener teléfonos:', err?.response?.data || err.message)
          setPhones([])
        }
        // enriquecer con alertas generadas si el backend no aporta detalle
        try {
          const gen = generateUserAlertsForUsers([res.data], 'mes', 'todas')[res.data.id]
          if (gen) {
            // si API no trae alertas por tipo, añadir typesCounts o alertasPorTipo
            if (!res.data.alertasPorTipo && !res.data.typesCounts) {
              const totals = Object.fromEntries(Object.entries(gen.types).map(([k, v]) => [k, (v.activas || 0) + (v.cerradas || 0)]))
              setUser(prev => ({ ...prev, typesCounts: totals }))
            } else {
              setUser(res.data)
            }
          }
        } catch (err) {
          // ignore
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [id])

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>Cargando perfil...</div>
  if (!user) return <div style={{ textAlign: 'center', padding: 40, color: '#dc3545', fontWeight: 'bold' }}>Usuario no encontrado</div>

  const fieldStyle = {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottom: '1px solid #f0f0f0'
  }

  const labelStyle = {
    color: '#dc3545',
    fontWeight: 'bold',
    marginBottom: 4
  }

  const valueStyle = {
    color: '#333',
    fontSize: 15
  }

  const smallBadge = {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: 10,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 8
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ 
        background: '#fff5f5', 
        padding: 30, 
        borderRadius: 8, 
        border: '2px solid #dc3545',
        boxShadow: '0 2px 8px rgba(220, 53, 69, 0.1)'
      }}>
        <h2 style={{ color: '#dc3545', marginBottom: 24, fontSize: 28, textAlign: 'center' }}>👤 Perfil de Usuario</h2>
        
        <div style={fieldStyle}>
          <div style={labelStyle}>Nombre Completo</div>
          <div style={valueStyle}>{user.nombre || 'No especificado'}</div>
        </div>

        <div style={fieldStyle}>
          <div style={labelStyle}>📧 Correo Electrónico</div>
          <div style={valueStyle}>{user.correo_electronico || 'No especificado'}</div>
        </div>

        <div style={fieldStyle}>
          <div style={labelStyle}>🏘️ Barrio / Grupo</div>
          <div style={valueStyle}>{user.grupo || user.group || 'Sin Grupo'}</div>
        </div>

        {/* Contraseña (si el backend la incluye) */}
        {(() => {
          const pwd = user.password || user.contrasena || user.plainPassword || user.clave || null
          if (!pwd) return null
          return (
            <div style={{ marginBottom: 16 }}>
              <div style={labelStyle}>🔒 Contraseña</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={valueStyle}>{showPassword ? pwd : '••••••••'}</div>
                <button onClick={() => setShowPassword(s => !s)} style={{ padding: '6px 8px', borderRadius: 6, border: 'none', background: '#007bff', color: 'white', cursor: 'pointer' }}>{showPassword ? 'Ocultar' : 'Ver'}</button>
                <button onClick={() => { navigator.clipboard?.writeText(pwd); alert('Contraseña copiada al portapapeles') }} style={{ padding: '6px 8px', borderRadius: 6, border: 'none', background: '#6c757d', color: 'white', cursor: 'pointer' }}>Copiar</button>
              </div>
            </div>
          )
        })()}

        <div style={fieldStyle}>
          <div style={labelStyle}>🆔 Cédula de Identidad</div>
          <div style={valueStyle}>{user.cedula_identidad || 'No especificado'}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ color: '#dc3545', margin: 0, fontSize: 20 }}>Detalle de Usuario</h2>
          <div>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                style={{ padding: '8px 12px', background: '#007bff', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✏️ Editar
              </button>
            ) : (
              <>
                <button
                  onClick={async () => {
                    // Guardar cambios
                    try {
                      // Validaciones simples
                      if (!form.nombre || form.nombre.trim().length < 2) {
                        setMessage({ type: 'error', text: 'El nombre es requerido (mínimo 2 caracteres).' })
                        return
                      }
                      const emailRegex = /^\S+@\S+\.\S+$/
                      if (form.correo_electronico && !emailRegex.test(form.correo_electronico)) {
                        setMessage({ type: 'error', text: 'Correo electrónico inválido.' })
                        return
                      }

                      const payload = {
                        nombre: form.nombre,
                        correo_electronico: form.correo_electronico,
                        cedula_identidad: form.cedula_identidad,
                        direccion: form.direccion,
                        fecha_nacimiento: form.fecha_nacimiento,
                        estado: form.estado
                      }
                      // Obtener token CSRF antes de hacer el PUT (backend utiliza csurf)
                      try {
                        const csrfRes = await api.get('/csrf-token')
                        const csrfToken = csrfRes?.data?.csrfToken
                        const headers = csrfToken ? { 'X-CSRF-Token': csrfToken } : {}
                        const res = await api.put(`/usuarios/actualizar/${id}`, payload, { headers })
                        if (res?.data) {
                          setUser(res.data)
                          setForm({
                            nombre: res.data.nombre,
                            correo_electronico: res.data.correo_electronico,
                            cedula_identidad: res.data.cedula_identidad,
                            direccion: res.data.direccion,
                            fecha_nacimiento: res.data.fecha_nacimiento,
                            estado: res.data.estado
                          })
                        } else {
                          // Mock fallback: update local state
                          setUser(prev => ({ ...prev, ...payload }))
                        }
                        setMessage({ type: 'success', text: 'Usuario actualizado.' })
                      } catch (err) {
                        // Si falla por falta de permiso o CSRF, mostrar mensaje del servidor o genérico
                        const serverMsg = err?.response?.data?.message || err?.response?.data?.error || null
                        const status = err?.response?.status
                        if (status === 401 || status === 403) {
                          setMessage({ type: 'error', text: serverMsg || 'No autorizado. Por favor inicia sesión.' })
                        } else {
                          setMessage({ type: 'error', text: serverMsg || 'Error al actualizar el usuario.' })
                        }
                      }
                    } catch (err) {
                      console.error(err)
                      setMessage({ type: 'error', text: 'Error al actualizar el usuario.' })
                    } finally {
                      setEditMode(false)
                      setTimeout(() => setMessage(null), 3000)
                    }
                  }}
                  style={{ padding: '8px 12px', background: '#28a745', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', marginRight: 8 }}
                >
                  💾 Guardar
                </button>
                <button
                  onClick={() => {
                    setEditMode(false)
                    setForm({
                      nombre: user.nombre || '',
                      correo_electronico: user.correo_electronico || '',
                      cedula_identidad: user.cedula_identidad || '',
                      direccion: user.direccion || '',
                      fecha_nacimiento: user.fecha_nacimiento || '',
                      estado: user.estado || 'activo'
                    })
                  }}
                  style={{ padding: '8px 12px', background: '#6c757d', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ✖️ Cancelar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Formulario editable si editMode */}
        {editMode ? (
          <div style={{ marginBottom: 12 }}>
            <div style={{ marginBottom: 8 }}>
              <div style={labelStyle}>Nombre Completo</div>
              <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd' }} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={labelStyle}>Correo Electrónico</div>
              <input value={form.correo_electronico} onChange={e => setForm(f => ({ ...f, correo_electronico: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd' }} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={labelStyle}>Cédula</div>
              <input value={form.cedula_identidad} onChange={e => setForm(f => ({ ...f, cedula_identidad: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd' }} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={labelStyle}>Dirección</div>
              <input value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd' }} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={labelStyle}>Fecha de Nacimiento</div>
              <input value={form.fecha_nacimiento} onChange={e => setForm(f => ({ ...f, fecha_nacimiento: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd' }} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={labelStyle}>Estado</div>
              <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd' }}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        ) : null}

        {message && (
          <div style={{ marginBottom: 12, color: message.type === 'success' ? '#155724' : '#721c24' }}>{message.text}</div>
        )}

        {user.fecha_modificacion && (
          <div>
            <div style={labelStyle}>✏️ Última Modificación</div>
            <div style={valueStyle}>{user.fecha_modificacion}</div>
          </div>
        )}

        {/* Teléfonos de contacto */}
        <div style={{ marginTop: 12 }}>
          <div style={labelStyle}>📞 Teléfono(s) de Contacto</div>
          <div style={{ marginTop: 6 }}>
            {phones.length === 0 ? (
              <div style={{ color: '#666' }}>No hay teléfonos registrados</div>
            ) : (
              phones.map(p => (
                <div key={p.id} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ background: '#fff', padding: '6px 10px', borderRadius: 8, border: '1px solid #eee' }}>{p.numero}</div>
                    <div style={{ color: '#666', fontSize: 13 }}>{p.nombre}</div>
                    <button onClick={() => handleDeletePhone(p.id)} style={{ marginLeft: 8, padding: '6px 8px', background: '#dc3545', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Eliminar</button>
                  </div>
                </div>
              ))
            )}

            {!addingPhone ? (
              <button onClick={() => setAddingPhone(true)} style={{ marginTop: 8, padding: '8px 10px', background: '#007bff', color: 'white', border: 'none', borderRadius: 6 }}>➕ Agregar Teléfono</button>
            ) : (
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="Número" style={{ padding: 8, borderRadius: 6 }} />
                <button onClick={async () => {
                  const raw = (newPhone || '').toString()
                  const digits = raw.replace(/\D/g, '')
                  if (!digits) {
                    alert('Ingresa un número de teléfono válido')
                    return
                  }
                  if (digits.length < 9) {
                    alert('El teléfono debe tener al menos 9 dígitos')
                    return
                  }

                  try {
                    const csrfRes = await api.get('/csrf-token')
                    const csrfToken = csrfRes?.data?.csrfToken
                    const headers = csrfToken ? { 'X-CSRF-Token': csrfToken } : {}
                    const res = await api.post('/usuarios_numeros/crear', { nombre: 'Teléfono de contacto', numero: digits, usuarioId: Number(id) }, { headers })
                    if (res?.data?.usuarioNumero) {
                      setPhones(prev => [res.data.usuarioNumero, ...prev])
                      setNewPhone('')
                      setAddingPhone(false)
                    }
                  } catch (err) {
                    console.error('Error agregando teléfono', err)
                    alert(err?.response?.data?.message || 'Error al agregar teléfono')
                  }
                }} style={{ padding: '8px 10px', background: '#28a745', color: 'white', border: 'none', borderRadius: 6 }}>Guardar</button>
                <button onClick={() => { setAddingPhone(false); setNewPhone('') }} style={{ padding: '8px 10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: 6 }}>Cancelar</button>
              </div>
            )}
          </div>
        </div>

        {/* Alertas por tipo (si están disponibles) */}
        <div style={{ marginTop: 20, borderTop: '1px solid #eee', paddingTop: 16 }}>
          <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>Alertas por Tipo (total)</div>
          <div>
            {(() => {
              // Preferir datos que pueda traer la API (user.alertasPorTipo), sino usar mock
              const defaultCounts = { medica: 0, incendio: 0, mecanica: 0, incidentesRobo: 0, otros: 0 }
              // preferir datos del API / estado local, sino usar helper central
              const counts = user.alertasPorTipo || user.typesCounts || defaultCounts
              const labels = { medica: 'Médica', incendio: 'Incendio', mecanica: 'Mecánica', incidentesRobo: 'Incidentes de Robo', otros: 'Otros' }
              const colors = { medica: '#17a2b8', incendio: '#dc3545', mecanica: '#ffc107', incidentesRobo: '#6f42c1', otros: '#6c757d' }
              return Object.entries(counts).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ ...smallBadge, background: colors[k] }}>{v}</div>
                  <div style={{ color: '#333', fontWeight: '600' }}>{labels[k]}</div>
                </div>
              ))
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
