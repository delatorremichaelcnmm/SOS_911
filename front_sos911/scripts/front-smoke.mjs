import api from '../src/services/api.js'

async function run() {
  console.log('Using API base url:', api.defaults ? api.defaults.baseURL : 'mock')

  const email = `frontsmoke+${Date.now()}@example.com`
  const payload = { nombre: 'frontSmoke', correo_electronico: email, contrasena: 'frontPass123' }

  try {
    // First fetch CSRF token and session cookie
    console.log('Fetching CSRF token to set headers and cookie...')
    const csrfRes = await fetch((api.defaults && api.defaults.baseURL ? api.defaults.baseURL : 'http://localhost:3000') + '/csrf-token', { method: 'GET' })
    const csrfJson = await csrfRes.json().catch(() => null)
    const csrfToken = csrfJson && csrfJson.csrfToken ? csrfJson.csrfToken : null
    const setCookie = csrfRes.headers.get('set-cookie') || csrfRes.headers.get('Set-Cookie')
    const cookie = setCookie ? setCookie.split(';')[0] : ''
    console.log('csrfToken:', csrfToken, 'cookie sample:', cookie)

    if (!csrfToken) {
      console.error('Could not get CSRF token; aborting')
      return
    }

    console.log('Registering user via api.post /usuarios/registro with CSRF token...')
    const regRes = await api.post('/usuarios/registro', payload, { headers: { 'X-CSRF-Token': csrfToken, Cookie: cookie } })
    console.log('Register response status/data:', regRes.status || 'unknown', regRes.data)

    console.log('Logging in via api.post /usuarios/login with CSRF token...')
    const loginRes = await api.post('/usuarios/login', { correo_electronico: email, contrasena: payload.contrasena }, { headers: { 'X-CSRF-Token': csrfToken, Cookie: cookie } })
    console.log('Login response status/data:', loginRes.status || 'unknown', loginRes.data)
    if (!loginRes.data || (!loginRes.data.userId && !loginRes.data.id)) {
      console.error('Login response missing user id; aborting')
      return
    }

    // --- Opcional: probar credenciales demo (solo si el backend las habilita) ---
    try {
      console.log('Testing demo credentials...')
      const demoEmail = process.env.DEV_SMOKE_EMAIL || 'demo@local.com'
      const demoPass = process.env.DEV_SMOKE_PASSWORD || 'demo1234'
      const demoLogin = await api.post('/usuarios/login', { correo_electronico: demoEmail, contrasena: demoPass }, { headers: { 'X-CSRF-Token': csrfToken, Cookie: cookie } })
      console.log('Demo login response:', demoLogin.status, demoLogin.data)
      if (demoLogin.data?.isDevUser) console.log('Demo login succeeded and returned isDevUser flag')
    } catch (err) {
      console.warn('Demo credentials test failed or not enabled:', err.response ? err.response.data : err.message)
    }

  } catch (e) {
    console.error('Register/Login failed:', e.response ? e.response.data : e.message)
    return
  }

  try {
    console.log('Fetching users via api.get(/usuarios/listar) ...')
    const res = await api.get('/usuarios/listar')
    console.log('Users list status:', res.status || 'unknown', 'count:', Array.isArray(res.data) ? res.data.length : 'n/a')
    if (Array.isArray(res.data) && res.data.length > 0) console.log('Sample user:', res.data[0])
  } catch (e) {
    console.error('List failed:', e.response ? e.response.data : e.message)
  }
}

run().catch(e => console.error(e))
