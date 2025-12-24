import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

export default function Preferences() {
  const { id } = useParams()
  const [prefs, setPrefs] = useState({ tema: 'light', sidebarMinimizado: false })
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function fetchPrefs() {
      try {
        const res = await api.get(`/usuarios/preferencias/listar/${id}`)
        if (res.data && res.data.preferencias) setPrefs(res.data.preferencias)
      } catch (err) {
        // ignore
      }
    }
    fetchPrefs()
  }, [id])

  async function handleSave(e) {
    e.preventDefault()
    try {
      await api.post(`/usuarios/preferencias/registrar/${id}`, prefs)
      setMessage('Guardado')
    } catch (err) {
      setMessage('Error al guardar')
    }
  }

  return (
    <div>
      <h2>Preferencias</h2>
      <form onSubmit={handleSave}>
        <label>Tema</label>
        <select value={prefs.tema} onChange={e => setPrefs(p => ({ ...p, tema: e.target.value }))}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
        <label>
          <input type="checkbox" checked={prefs.sidebarMinimizado} onChange={e => setPrefs(p => ({ ...p, sidebarMinimizado: e.target.checked }))} /> Sidebar minimizado
        </label>
        <button type="submit">Guardar</button>
      </form>
      {message && <div>{message}</div>}
    </div>
  )
}
