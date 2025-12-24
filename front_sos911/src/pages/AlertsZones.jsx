import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { zoneAlerts } from '../mocks/alertsMock'

export default function AlertsZones() {
  // Estado de filtro por estatus
  const [statusFilter, setStatusFilter] = useState('activas') // 'activas' | 'cerradas' | 'todas'

  // Usar zonas desde mock central
  const mockZonesData = zoneAlerts

  // función helper para calcular alertas según estado seleccionado
  const getZoneCount = (zone) => {
    const types = zone.types || {}
    let sum = 0
    Object.values(types).forEach(t => {
      if (statusFilter === 'activas') sum += t.activas || 0
      else if (statusFilter === 'cerradas') sum += t.cerradas || 0
      else sum += (t.activas || 0) + (t.cerradas || 0)
    })
    return sum
  }

  const zonesWithCounts = mockZonesData.map(z => ({ ...z, alertas: getZoneCount(z) }))
  const sortedZones = [...zonesWithCounts].sort((a, b) => b.alertas - a.alertas)
  const totalAlertas = sortedZones.reduce((sum, z) => sum + z.alertas, 0)
  const maxAlertas = sortedZones.length > 0 ? sortedZones[0].alertas : 0

  const [selectedZone, setSelectedZone] = useState(null)
  const [map, setMap] = useState(null)

  useEffect(() => {
    if (map && selectedZone) {
      const zone = sortedZones.find(z => z.zoneId === selectedZone)
      if (zone) {
        map.flyTo([zone.lat, zone.lng], 13, { duration: 0.7 })
      }
    }
  }, [selectedZone, map])

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ color: '#dc3545', marginBottom: 20 }}>🗺️ Alertas por Zona Geográfica</h2>

      {/* Resumen general */}
      <div style={{ marginBottom: 24, background: '#fff5f5', border: '2px solid #dc3545', borderRadius: 8, padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <div>
            <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>Total de Alertas en Zonas</div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#dc3545' }}>{totalAlertas}</div>
          </div>
          <div>
            <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>Zona Crítica</div>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#dc3545' }}>
              {sortedZones.length > 0 ? `${sortedZones[0].name} (${sortedZones[0].alertas} alertas)` : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Mapa visual y datos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Controles de estado para el mapa */}
      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Grupo de botones (tamaño reducido) */}
        <div style={{ display: 'flex', gap: 6 }}>
          {['activas', 'cerradas', 'todas'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '6px 10px',
                fontSize: 13,
                background: statusFilter === s ? '#007bff' : '#f0f0f0',
                color: statusFilter === s ? 'white' : '#333',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {s === 'activas' ? 'Activas' : s === 'cerradas' ? 'Cerradas' : 'Todas'}
            </button>
          ))}
        </div>

        {/* Separador visual entre botones nuevos y el resto (antiguos) */}
        <div style={{ width: 1, height: 28, background: '#e0e0e0', borderRadius: 1, margin: '0 6px' }} />

        {/* Controles antiguos (si los hubiese) - pequeño espacio reservado para evitar saturación visual */}
        <div style={{ opacity: 0.9, fontSize: 13, color: '#666' }}>
          Filtro de mapa
        </div>
      </div>

      {/* Línea divisora horizontal para separar controles del mapa */}
      <div style={{ height: 1, background: '#eee', marginBottom: 12 }} />

      {/* Mapa real usando react-leaflet (OpenStreetMap tiles) */}
      <div style={{
        background: '#e8f4f8',
        border: '2px solid #ddd',
        borderRadius: 8,
        padding: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Import CSS de Leaflet (se carga en este componente para simplicidad) */}
        <div style={{ width: '100%', maxWidth: 650 }}>
          <MapContainer
            center={[9.9281, -84.0907]}
            zoom={12}
            style={{ height: 380, width: '100%', borderRadius: 6 }}
            whenCreated={map => setMap(map)}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {zonesWithCounts.map(zone => {
              const radius = maxAlertas ? (zone.alertas / maxAlertas) * 18 + 6 : 6 // pixels for CircleMarker
              const isSelected = selectedZone === zone.zoneId
              return (
                <CircleMarker
                  key={zone.zoneId}
                  center={[zone.lat, zone.lng]}
                  radius={radius}
                  pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: isSelected ? 0.9 : 0.6 }}
                  eventHandlers={{
                    click: () => {
                      setSelectedZone(isSelected ? null : zone.zoneId)
                    }
                  }}
                >
                  <Popup>
                    <div style={{ fontWeight: 'bold' }}>{zone.name}</div>
                    <div>Alertas ({statusFilter === 'activas' ? 'Activas' : statusFilter === 'cerradas' ? 'Cerradas' : 'Total'}): {zone.alertas}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                      <div><strong>Desglose por tipo:</strong></div>
                      {Object.entries(zone.types || {}).map(([tKey, tVal]) => {
                        const ct = tVal || { activas: 0, cerradas: 0 }
                        const count = statusFilter === 'activas' ? (ct.activas || 0) : statusFilter === 'cerradas' ? (ct.cerradas || 0) : ((ct.activas || 0) + (ct.cerradas || 0))
                        const labels = { medica: 'Médica', incendio: 'Incendio', mecanica: 'Mecánica', incidentesRobo: 'Incidentes de Robo', otros: 'Otros' }
                        return (
                          <div key={tKey} style={{ fontSize: 12 }}>
                            • {labels[tKey]}: {count}
                          </div>
                        )
                      })}
                    </div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>{zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}</div>
                  </Popup>
                </CircleMarker>
              )
            })}
          </MapContainer>
        </div>
      </div>

        {/* Lista de zonas compilada */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 400 }}>
          {sortedZones.map((zone, idx) => {
            const percentage = totalAlertas ? Math.round((zone.alertas / totalAlertas) * 100) : 0
            return (
              <div
                key={zone.zoneId}
                onClick={() => setSelectedZone(selectedZone === zone.zoneId ? null : zone.zoneId)}
                style={{
                  background: selectedZone === zone.zoneId ? zone.color : '#fff5f5',
                  color: selectedZone === zone.zoneId ? 'white' : '#333',
                  border: `2px solid ${zone.color}`,
                  borderRadius: 6,
                  padding: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  transform: selectedZone === zone.zoneId ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <strong>#{idx + 1} {zone.name}</strong>
                  <strong style={{ fontSize: 18 }}>{zone.alertas}</strong>
                </div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  {percentage}% • {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tabla detallada */}
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
              <th style={{ padding: 12, textAlign: 'left', fontWeight: 'bold' }}>🗺️ Zona</th>
              <th style={{ padding: 12, textAlign: 'center', fontWeight: 'bold' }}>📍 Coordenadas</th>
              <th style={{ padding: 12, textAlign: 'center', fontWeight: 'bold' }}>🚨 Alertas</th>
              <th style={{ padding: 12, textAlign: 'center', fontWeight: 'bold' }}>📊 Porcentaje</th>
              <th style={{ padding: 12, textAlign: 'center', fontWeight: 'bold' }}>Nivel Riesgo</th>
            </tr>
          </thead>
          <tbody>
            {sortedZones.map((zone, idx) => {
              const percentage = totalAlertas ? Math.round((zone.alertas / totalAlertas) * 100) : 0
              const riskLevel = zone.alertas > 40 ? 'Crítico' : zone.alertas > 25 ? 'Alto' : zone.alertas > 15 ? 'Moderado' : 'Bajo'
              const riskColor = zone.alertas > 40 ? '#dc3545' : zone.alertas > 25 ? '#fd7e14' : zone.alertas > 15 ? '#ffc107' : '#28a745'
              
              return (
                <tr 
                  key={zone.zoneId}
                  style={{
                    background: idx % 2 === 0 ? '#fff' : '#fffdfd',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                >
                  <td style={{ padding: 12, color: '#333', fontWeight: 'bold' }}>
                    {zone.name}
                  </td>
                  <td style={{ padding: 12, textAlign: 'center', color: '#666', fontSize: 12 }}>
                    {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}
                  </td>
                  <td style={{ padding: 12, textAlign: 'center', color: '#dc3545', fontWeight: 'bold' }}>
                    {zone.alertas}
                  </td>
                  <td style={{ padding: 12, textAlign: 'center', color: '#666' }}>
                    {percentage}%
                  </td>
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    <div style={{
                      display: 'inline-block',
                      background: riskColor,
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 'bold'
                    }}>
                      {riskLevel}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
