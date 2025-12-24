const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
// Node 18+ has global fetch available; no external dependency required

async function run() {
  console.log('Backend base URL:', base);

  // 1) Register a new user
  const regPayload = { nombre: 'smokeTest', correo_electronico: `smoketest+${Date.now()}@example.com`, contrasena: 'test1234' };
  try {
    const regRes = await fetch(`${base}/usuarios/registro`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(regPayload)
    });
    const regJson = await regRes.json();
    console.log('Register status:', regRes.status, regJson);
  } catch (e) {
    console.error('Register error:', e.message);
    return;
  }

  // 2) Login with same credentials
  try {
    const loginRes = await fetch(`${base}/usuarios/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ correo_electronico: regPayload.correo_electronico, contrasena: regPayload.contrasena })
    });
    const loginJson = await loginRes.json();
    console.log('Login status:', loginRes.status, loginJson);
    if (!loginJson || !loginJson.userId) {
      console.warn('Login did not return userId; stopping');
      return;
    }
    const userId = loginJson.userId || loginJson.id || null;

    // 3) List users
    const listRes = await fetch(`${base}/usuarios/listar`);
    const listJson = await listRes.json();
    console.log('List status:', listRes.status, Array.isArray(listJson) ? `${listJson.length} users` : listJson);

    // 4) Get detail
    if (userId) {
      const detailRes = await fetch(`${base}/usuarios/detalle/${userId}`);
      const detailJson = await detailRes.json();
      console.log('Detail status:', detailRes.status, detailJson);
    }

  } catch (e) {
    console.error('Login/List/Detail error:', e.message);
  }
}

run().catch(e => console.error(e));