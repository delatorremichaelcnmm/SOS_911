import { request } from 'http';

// Using global fetch to retrieve CSRF token and Set-Cookie header, then perform POST with cookie and token
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';

async function getCsrf() {
  const r = await fetch(`${base}/csrf-token`, { method: 'GET' });
  const body = await r.text();
  let parsed
  try { parsed = JSON.parse(body) } catch (e) { parsed = null }
  const csrfToken = parsed && parsed.csrfToken ? parsed.csrfToken : null;
  const setCookie = r.headers.get('set-cookie');
  return { csrfToken, setCookie };
}

async function postRegister(csrfToken, cookie, payload) {
  const res = await fetch(`${base}/usuarios/registro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      'Cookie': cookie
    },
    body: JSON.stringify(payload)
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

async function postLogin(csrfToken, cookie, payload) {
  const res = await fetch(`${base}/usuarios/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      'Cookie': cookie
    },
    body: JSON.stringify(payload)
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

async function listUsers() {
  const res = await fetch(`${base}/usuarios/listar`);
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

(async () => {
  console.log('Backend base:', base);
  const { csrfToken, setCookie } = await getCsrf();
  console.log('csrfToken:', csrfToken);
  console.log('set-cookie header sample:', setCookie ? setCookie.split(';')[0] : null);
  if (!csrfToken) {
    console.error('Could not obtain CSRF token; aborting');
    process.exit(1);
  }

  const payload = { nombre: 'smokeUser', correo_electronico: `smoke+${Date.now()}@example.com`, contrasena: 'pass1234' };
  const cookie = setCookie ? setCookie.split(';')[0] : '';

  const reg = await postRegister(csrfToken, cookie, payload);
  console.log('Register ->', reg.status, reg.json);

  const login = await postLogin(csrfToken, cookie, { correo_electronico: payload.correo_electronico, contrasena: payload.contrasena });
  console.log('Login ->', login.status, login.json);

  const list = await listUsers();
  console.log('List ->', list.status, Array.isArray(list.json) ? `${list.json.length} users` : list.json);

  if (login.json && (login.json.userId || login.json.id)) {
    const id = login.json.userId || login.json.id;
    const det = await fetch(`${base}/usuarios/detalle/${id}`);
    const detJson = await det.json().catch(() => null);
    console.log('Detail ->', det.status, detJson);
  }
})();