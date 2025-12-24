import api from './api'

const KEY_USER = 'sos911_user'

export async function login({ correo_electronico, contrasena }) {
  // Primero obtener token CSRF (el servidor almacena la sesión en cookie)
  try {
    const csrfRes = await api.get('/csrf-token')
    const csrfToken = csrfRes?.data?.csrfToken
    const headers = csrfToken ? { 'X-CSRF-Token': csrfToken } : {}
    const res = await api.post('/usuarios/login', { correo_electronico, contrasena }, { headers })
    // backend returns { message, userId, nombre, correo_electronico }
    const user = { ...res.data }
    localStorage.setItem(KEY_USER, JSON.stringify(user))
    return user
  } catch (err) {
    // Re-lanzar para que el componente pueda mostrar el mensaje adecuado
    throw err
  }
}

export async function register(payload) {
  try {
    const csrfRes = await api.get('/csrf-token')
    const csrfToken = csrfRes?.data?.csrfToken
    const headers = csrfToken ? { 'X-CSRF-Token': csrfToken } : {}
    const res = await api.post('/usuarios/registro', payload, { headers })
    return res.data
  } catch (err) {
    throw err
  }
}

export async function logout() {
  localStorage.removeItem(KEY_USER)
}

export async function deleteUser(userId) {
  try {
    const csrfRes = await api.get('/csrf-token')
    const csrfToken = csrfRes?.data?.csrfToken
    const headers = csrfToken ? { 'X-CSRF-Token': csrfToken } : {}
    const res = await api.delete(`/usuarios/eliminar/${userId}`, { headers })
    return res.data
  } catch (err) {
    throw err
  }
}

export function getCurrentUser() {
  const raw = localStorage.getItem(KEY_USER)
  return raw ? JSON.parse(raw) : null
}

export default { login, register, logout, getCurrentUser }
