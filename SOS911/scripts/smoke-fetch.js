async function req(path, options = {}){
  const res = await fetch('http://localhost:3000' + path, options)
  const text = await res.text()
  let body
  try { body = JSON.parse(text) } catch(e) { body = text }
  return { status: res.status, body }
}

async function main(){
  try{
    console.log('1) Registering user...')
    const registro = await req('/usuarios/registro', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ nombre: 'Smoke Fetch', correo_electronico: `fetch${Date.now()}@example.com`, cedula_identidad: String(Math.floor(Math.random()*10000000)), contrasena: 'smoke-pass', fecha_nacimiento: '1990-01-01', direccion: 'Fetch St' })
    })
    console.log('Register status:', registro.status)
    console.log('Register body:', registro.body)

    console.log('\n2) Login...')
    const login = await req('/usuarios/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ correo_electronico: registro.body?.correo_electronico || 'fetch@example.com', contrasena: 'smoke-pass' }) })
    console.log('Login status:', login.status)
    console.log('Login body:', login.body)

    console.log('\n3) List users...')
    const list = await req('/usuarios/listar')
    console.log('List status:', list.status)
    console.log('Users length:', Array.isArray(list.body) ? list.body.length : 'non-array')
    console.log('First user:', Array.isArray(list.body) ? list.body[0] : list.body)
  }catch(e){
    console.error('Error during smoke tests:', e)
    process.exit(1)
  }
}

main()
