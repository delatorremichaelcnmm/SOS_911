export const zoneAlerts = [
  { zoneId: 1, name: 'Centro Histórico', lat: 9.9281, lng: -84.0907, color: '#dc3545', types: { medica: { activas: 20, cerradas: 5 }, incendio: { activas: 10, cerradas: 0 }, mecanica: { activas: 6, cerradas: 2 }, incidentesRobo: { activas: 5, cerradas: 1 }, otros: { activas: 4, cerradas: 1 } } },
  { zoneId: 2, name: 'Barrio Escalante', lat: 9.94, lng: -84.05, color: '#fd7e14', types: { medica: { activas: 16, cerradas: 4 }, incendio: { activas: 8, cerradas: 1 }, mecanica: { activas: 7, cerradas: 2 }, incidentesRobo: { activas: 5, cerradas: 0 }, otros: { activas: 2, cerradas: 1 } } },
  { zoneId: 3, name: 'San Pedro', lat: 9.935, lng: -84.03, color: '#ffc107', types: { medica: { activas: 12, cerradas: 3 }, incendio: { activas: 6, cerradas: 1 }, mecanica: { activas: 7, cerradas: 2 }, incidentesRobo: { activas: 4, cerradas: 0 }, otros: { activas: 3, cerradas: 1 } } },
  { zoneId: 4, name: 'Zapote', lat: 9.88, lng: -84.02, color: '#28a745', types: { medica: { activas: 8, cerradas: 2 }, incendio: { activas: 4, cerradas: 0 }, mecanica: { activas: 6, cerradas: 1 }, incidentesRobo: { activas: 5, cerradas: 0 }, otros: { activas: 3, cerradas: 0 } } },
  { zoneId: 5, name: 'Los Ángeles', lat: 9.96, lng: -84.0, color: '#17a2b8', types: { medica: { activas: 5, cerradas: 1 }, incendio: { activas: 3, cerradas: 0 }, mecanica: { activas: 4, cerradas: 1 }, incidentesRobo: { activas: 3, cerradas: 0 }, otros: { activas: 4, cerradas: 1 } } },
  { zoneId: 6, name: 'Desamparados', lat: 9.83, lng: -83.95, color: '#007bff', types: { medica: { activas: 3, cerradas: 1 }, incendio: { activas: 2, cerradas: 0 }, mecanica: { activas: 4, cerradas: 0 }, incidentesRobo: { activas: 2, cerradas: 0 }, otros: { activas: 1, cerradas: 0 } } }
]

export const userGroups = {
  1: 'Centro',
  2: 'Sur',
  3: 'Norte',
  4: 'Este',
  5: 'Oeste'
}

// Deterministic pseudo-random generator from a string seed
function seededNumber(seed) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h
}

export function generateUserAlertsForUsers(users = [], period = 'mes', status = 'todas') {
  // returns a map { [userId]: { userId, alertasActivas, alertasCerradas, types } }
  const result = {}
  users.forEach(u => {
    const seed = `${u.id}:${period}:${status}`
    const n = seededNumber(seed)
    const total = (n % 10) + 1 // 1..10 alerts

    // distribute total into types
    const keys = ['medica', 'incendio', 'mecanica', 'incidentesRobo', 'otros']
    const typesBase = {}
    let remaining = total
    for (let i = 0; i < keys.length; i++) {
      if (i === keys.length - 1) {
        typesBase[keys[i]] = remaining
      } else {
        const v = (Math.abs((n >> (i * 4)) % (remaining + 1)))
        typesBase[keys[i]] = v
        remaining -= v
      }
    }

    // split active/closed roughly based on seed
    const activeRatio = ((n >>> 8) % 50) / 100 // 0..0.49
    const alertasActivas = Math.round(total * activeRatio)
    const alertasCerradas = total - alertasActivas

    const types = {}
    keys.forEach(k => {
      const t = typesBase[k] || 0
      const tAct = Math.round(t * (alertasActivas / (total || 1)))
      const tCer = t - tAct
      types[k] = { activas: tAct, cerradas: tCer }
    })

    result[u.id] = { userId: u.id, alertasActivas, alertasCerradas, types }
  })
  return result
}
