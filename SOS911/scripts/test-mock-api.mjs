import api from '../front_sos911/src/services/api.js'

async function run() {
  console.log('Users (initial):', (await api.get('/usuarios/listar')).data)
  try {
    const login = await api.post('/usuarios/login', { correo_electronico: 'demo@example.com', contrasena: 'pass' })
    console.log('Login success:', login.data)
  } catch (err) {
    console.error('Login failed:', err.message)
  }

  const reg = await api.post('/usuarios/registro', { nombre: 'NewUser', correo_electronico: 'new@example.com', contrasena: '1234' })
  console.log('Registro result:', reg.data)

  console.log('Users (after):', (await api.get('/usuarios/listar')).data)
}

run().catch(e => console.error(e))