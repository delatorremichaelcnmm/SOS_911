import axios from 'axios'

// Use the real backend by default; set VITE_USE_MOCK=true to force in-memory mock
const useMock = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_USE_MOCK === 'true')
const baseURL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:3000'

let api

if (!useMock) {
  api = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
  })
} else {
  // Mock API to disable real backend requests during local frontend-only development
  // This returns Promise-like responses similar to axios (i.e., { data: ... })
  const delay = (ms = 200) => new Promise(r => setTimeout(r, ms))
  let users = [
    { id: 1, nombre: 'Demo User', correo_electronico: 'demo@example.com', contrasena: 'pass' }
  ]
  let nextId = 2

  api = {
    async get(url) {
      await delay()
      if (url === '/usuarios/listar') {
        return { data: users.map(u => ({ id: u.id, nombre: u.nombre, correo_electronico: u.correo_electronico })) }
      }
      if (url.startsWith('/usuarios/detalle/')) {
        const id = Number(url.split('/').pop())
        const u = users.find(x => x.id === id)
        return { data: u ? { id: u.id, nombre: u.nombre, correo_electronico: u.correo_electronico } : null }
      }
      return { data: null }
    },

    async post(url, payload) {
      await delay()
      if (url === '/usuarios/login') {
        const u = users.find(x => x.correo_electronico === payload.correo_electronico && x.contrasena === payload.contrasena)
        if (u) return { data: { message: 'ok', userId: u.id, nombre: u.nombre, correo_electronico: u.correo_electronico } }
        const err = new Error('Invalid credentials')
        err.response = { data: { message: 'Invalid credentials' } }
        throw err
      }

      if (url === '/usuarios/registro') {
        const newUser = { id: nextId++, nombre: payload.nombre, correo_electronico: payload.correo_electronico, contrasena: payload.contrasena }
        users.push(newUser)
        return { data: { message: 'created', id: newUser.id } }
      }

      return { data: null }
    },

    async put(url, payload) {
      await delay()
      return { data: null }
    },

    async delete(url) {
      await delay()
      return { data: null }
    }
  }
}

export default api
