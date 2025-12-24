import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { generateUserAlertsForUsers } from '../mocks/alertsMock'


export default function Dashboard() {
  const [period, setPeriod] = useState('mes') // día, semana, mes
  const [statusFilter, setStatusFilter] = useState('activas') // 'activas' | 'cerradas' | 'todas'

  // Obtener lista de usuarios del backend (para mostrar exactamente los usuarios existentes)
  const [usersList, setUsersList] = useState([])

  const [loadingUsers, setLoadingUsers] = useState(true)
  const [backendAvailable, setBackendAvailable] = useState(null) // null = unknown, true/false

  async function fetchUsers() {
    setLoadingUsers(true)
    try {
      const res = await api.get('/usuarios/listar')
      setUsersList(res.data || [])
      setBackendAvailable(true)
    } catch (err) {
      // Backend not reachable or returned error
      setUsersList([])
      setBackendAvailable(false)
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const emptyTypes = { medica: { activas: 0, cerradas: 0 }, incendio: { activas: 0, cerradas: 0 }, mecanica: { activas: 0, cerradas: 0 }, incidentesRobo: { activas: 0, cerradas: 0 }, otros: { activas: 0, cerradas: 0 } }

  // generate pseudo-random alert counts per user (frontend-only) so dashboard shows data
  const generatedAlertsMap = useMemo(() => generateUserAlertsForUsers(usersList || [], period, statusFilter), [usersList, period, statusFilter])

  // Use backend users as source of truth for user list, but enrich with generated alerts for display
  const usersRaw = (usersList && usersList.length > 0)
    ? usersList.map(apiUser => {
        const id = Number(apiUser.id)
        const nombre = apiUser.nombre || apiUser.nombre_completo || apiUser.correo_electronico || `Usuario ${id}`
        const alertEntry = generatedAlertsMap[apiUser.id] || { alertasActivas: 0, alertasCerradas: 0, types: emptyTypes }
        const types = alertEntry.types || emptyTypes
        const alertasActivas = alertEntry.alertasActivas || 0
        const alertasCerradas = alertEntry.alertasCerradas || 0
        const group = apiUser.grupo || apiUser.group || 'Sin Grupo'
        return { userId: id, nombre, alertasActivas, alertasCerradas, types, group }
      })
    : []

  // calcular alertas según filtro de estado y agregar desglose por tipo para cada usuario (memoizado)
  const currentData = useMemo(() => {
    return usersRaw.map(u => {
      const alertasCount = statusFilter === 'activas' ? (u.alertasActivas || 0) : statusFilter === 'cerradas' ? (u.alertasCerradas || 0) : ((u.alertasActivas || 0) + (u.alertasCerradas || 0))

      // calcular conteo por tipo según filtro
      const typesCounts = Object.entries(u.types || {}).reduce((acc, [tKey, tVal]) => {
        acc[tKey] = statusFilter === 'activas' ? (tVal.activas || 0) : statusFilter === 'cerradas' ? (tVal.cerradas || 0) : ((tVal.activas || 0) + (tVal.cerradas || 0))
        return acc
      }, {})

      // Asegurar que el total 'alertas' coincide con la suma de typesCounts
      const sumFromTypes = Object.values(typesCounts).reduce((s, n) => s + n, 0)
      const alertasFinal = sumFromTypes > 0 ? sumFromTypes : alertasCount

      return { ...u, alertas: alertasFinal, typesCounts }
    })
  }, [usersRaw, statusFilter])

  const totalAlertas = useMemo(() => currentData.reduce((sum, u) => sum + u.alertas, 0), [currentData])
  const promedio = useMemo(() => (currentData.length === 0 ? 0 : Math.round(totalAlertas / currentData.length)), [currentData, totalAlertas])

  // calcular conteos por tipo a partir de los datos mostrados (evita discrepancias)
  const typeCounts = useMemo(() => currentData.reduce((acc, u) => {
    Object.entries(u.typesCounts || {}).forEach(([k, v]) => {
      acc[k] = (acc[k] || 0) + (v || 0)
    })
    return acc
  }, { medica: 0, incendio: 0, mecanica: 0, incidentesRobo: 0, otros: 0 }), [currentData])

  // Comprobar coherencia entre totales por usuario y totales por tipo
  const sumTypeTotals = useMemo(() => Object.values(typeCounts).reduce((s, n) => s + (n || 0), 0), [typeCounts])
  const totalsMatch = useMemo(() => sumTypeTotals === totalAlertas, [sumTypeTotals, totalAlertas])

  const periodLabel = {
    dia: 'Hoy',
    semana: 'Esta Semana',
    mes: 'Este Mes'
  }

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ color: '#dc3545', marginBottom: 20 }}>📊 Dashboard de Alertas</h2>

      {/* Selector de período y estado */}
      <div style={{ marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['dia', 'semana', 'mes'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '8px 14px',
                background: period === p ? '#dc3545' : '#f0f0f0',
                color: period === p ? 'white' : '#333',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
            >
              {periodLabel[p]}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 8 }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Mostrar</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {['activas', 'cerradas', 'todas'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '8px 12px',
                  background: statusFilter === s ? '#007bff' : '#f0f0f0',
                  color: statusFilter === s ? 'white' : '#333',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
              >
                {s === 'activas' ? 'Activas' : s === 'cerradas' ? 'Cerradas' : 'Todas'}
              </button>
            ))}

            <button onClick={() => fetchUsers()} style={{ marginLeft: 10, padding: '8px 10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>🔄 Refrescar Usuarios</button>
            <a href="/users/new" style={{ marginLeft: 8, padding: '8px 10px', background: '#28a745', color: 'white', borderRadius: 6, textDecoration: 'none', fontWeight: 'bold' }}>➕ Nuevo Usuario</a>


          </div>
        </div>
      </div>

      {loadingUsers ? (
        <div style={{ padding: 20, textAlign: 'center', background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 6, marginBottom: 12 }}>🔄 Cargando usuarios...</div>
      ) : (
        <>
          {/* Indicar si backend está caído y se está usando mock */}
          {backendAvailable === false && (
            <div style={{ padding: 10, marginBottom: 12, borderRadius: 6, background: '#fff3cd', color: '#856404' }}>
              ⚠️ El backend no respondió. {showMockFallback ? 'Mostrando datos MOCK (habilitado).' : 'Los datos están ocultos porque el mock está desactivado.'} <button onClick={() => setShowMockFallback(s => !s)} style={{ marginLeft: 8, padding: '4px 8px', borderRadius: 6, border: 'none', background: '#343a40', color: 'white' }}>{showMockFallback ? 'Desactivar mock' : 'Activar mock'}</button>
            </div>
          )}

          {/* Tarjetas de resumen */}

          {/* Tarjetas de resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
        <div style={{
          background: '#fff5f5',
          border: '2px solid #dc3545',
          borderRadius: 8,
          padding: 20,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Total de Alertas</div>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#dc3545' }}>{totalAlertas}</div>
          {!totalsMatch && (
            <div style={{ marginTop: 8, color: '#856404', background: '#fff3cd', padding: 8, borderRadius: 6, fontSize: 13 }}>
              ⚠️ Discrepancia detectada entre totales por usuario y por tipo (recalculados desde la tabla). Se muestran los datos desde la tabla.
            </div>
          )}
        </div>
        <div style={{
          background: '#f0f8ff',
          border: '2px solid #007bff',
          borderRadius: 8,
          padding: 20,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Usuarios Activos</div>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#007bff' }}>{currentData.length}</div>
        </div>
        <div style={{
          background: '#f8fff5',
          border: '2px solid #28a745',
          borderRadius: 8,
          padding: 20,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Promedio por Usuario</div>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#28a745' }}>{promedio}</div>
        </div>
      </div>

      {/* Métricas por tipo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {Object.entries(typeCounts).map(([key, val]) => {
          const labels = {
            medica: 'Médica',
            incendio: 'Incendio',
            mecanica: 'Mecánica',
            incidentesRobo: 'Incidentes de Robo',
            otros: 'Otros'
          }
          const colors = {
            medica: '#17a2b8',
            incendio: '#dc3545',
            mecanica: '#ffc107',
            incidentesRobo: '#6f42c1',
            otros: '#6c757d'
          }

          return (
            <div key={key} style={{ background: '#fff', border: `2px solid ${colors[key]}`, borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{labels[key]}</div>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: colors[key] }}>{val}</div>
            </div>
          )
        })}
      </div>

      {/* Tabla de alertas */}
      <div style={{
        background: '#fff5f5',
        border: '2px solid #dc3545',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(220, 53, 69, 0.1)',
        width: '100%'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#dc3545', color: 'white' }}>
              <th style={{ padding: 12, textAlign: 'left', fontWeight: 'bold' }}>👤 Usuario</th>
              <th style={{ padding: 12, textAlign: 'center', fontWeight: 'bold' }}>🏘️ Grupo</th>
              <th style={{ padding: 12, textAlign: 'center', fontWeight: 'bold' }}>🚨 Alertas {periodLabel[period]} ({statusFilter === 'activas' ? 'Activas' : statusFilter === 'cerradas' ? 'Cerradas' : 'Todas'})</th>
              <th style={{ padding: 12, textAlign: 'center', fontWeight: 'bold' }}>📊 Porcentaje</th>
              <th style={{ padding: 12, textAlign: 'center', fontWeight: 'bold' }}>Tipos</th>
              <th style={{ padding: 12, textAlign: 'center', fontWeight: 'bold' }}>Gráfico</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((user, idx) => {
              const percentage = totalAlertas ? Math.round((user.alertas / totalAlertas) * 100) : 0
              const typeColors = { medica: '#17a2b8', incendio: '#dc3545', mecanica: '#ffc107', incidentesRobo: '#6f42c1', otros: '#6c757d' }
              const typeLabels = { medica: 'Médica', incendio: 'Incendio', mecanica: 'Mecánica', incidentesRobo: 'Incidentes de Robo', otros: 'Otros' }

              return (
                <tr 
                  key={user.userId}
                  style={{
                    background: idx % 2 === 0 ? '#fff' : '#fffdfd',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                >
                  <td style={{ padding: 12, color: '#333', fontWeight: 'bold' }}>
                    {idx + 1}. {user.nombre}
                  </td>
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', background: '#fff', padding: '6px 10px', borderRadius: 12, border: '1px solid #eee', fontSize: 13 }}>{user.group || 'Sin Grupo'}</div>
                  </td>
                  <td style={{ padding: 12, textAlign: 'center', color: '#dc3545', fontWeight: 'bold' }}>
                    {user.alertas}
                  </td>
                  <td style={{ padding: 12, textAlign: 'center', color: '#666' }}>
                    {percentage}%
                  </td>

                  {/* Tipos por usuario (badges compactos) */}
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    {Object.entries(user.typesCounts || {}).map(([tKey, tVal]) => (
                      <span 
                        key={tKey}
                        title={`${typeLabels[tKey]}: ${tVal}`}
                        style={{
                          display: 'inline-block',
                          background: typeColors[tKey],
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: '600',
                          marginRight: 6
                        }}
                      >
                        {tVal}
                      </span>
                    ))}
                  </td>

                  <td style={{ padding: 12, textAlign: 'center' }}>
                    <div style={{
                      background: '#f0f0f0',
                      borderRadius: 4,
                      overflow: 'hidden',
                      height: 20,
                      width: '100%'
                    }}>
                      <div style={{
                        background: '#dc3545',
                        height: '100%',
                        width: `${percentage}%`,
                        transition: 'width 0.3s'
                      }} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
  </>
)}
    </div>
  )
}
