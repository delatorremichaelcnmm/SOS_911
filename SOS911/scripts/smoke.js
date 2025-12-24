const axios = require('axios')

const base = 'http://localhost:3000'

async function main(){
  try{
    console.log('1) Registering user...')
    const reg = await axios.post(base + '/usuarios/registro', {
      nombre: 'Smoke Test',
      correo_electronico: `smoke${Date.now()}@example.com`,
      cedula_identidad: String(Math.floor(Math.random()*100000000)),
      contrasena: 'smoke-pass',
      fecha_nacimiento: '1990-01-01',
      direccion: 'Smoke St 1'
    })
    console.log('Register response:', reg.data)

    console.log('\n2) Logging in...')
    const { correo_electronico, contrasena } = { correo_electronico: reg.config.data ? JSON.parse(reg.config.data).correo_electronico : undefined, contrasena: 'smoke-pass' }
    // Fallback if reg did not return correo
    const loginEmail = correo_electronico || 'smoke@example.com'
    const login = await axios.post(base + '/usuarios/login', { correo_electronico: loginEmail, contrasena })
    console.log('Login response:', login.data)

    console.log('\n3) Listing users...')
    const list = await axios.get(base + '/usuarios/listar')
    console.log('Users count:', list.data.length)
    console.log('First user (if any):', list.data[0] || null)
  }catch(e){
    console.error('--- ERROR DETALLE ---')
    if(e.response){
      try{ console.error('Error status:', e.response.status) }catch(err){}
      try{ console.error('Error data:', JSON.stringify(e.response.data, null, 2)) }catch(err){}
    }
    console.error('Error message:', e.message)
    console.error('Stack:', e.stack)
    process.exit(1)
  }
}

main()
