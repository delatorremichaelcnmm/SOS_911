# front_sos911 (Minimal React + Vite frontend)

Este es un scaffold mínimo para consumir el backend de `SOS911`.

## Requisitos
- Node 18+

## Uso
1. Copiar y configurar variables de entorno: crea un archivo `.env` en la raíz con:

```
VITE_API_URL=http://localhost:3000
```

2. Instalar dependencias:

```
npm install
```

3. Iniciar en modo desarrollo:

```
npm run dev
```

## Endpoints usados (ejemplos)
- POST /usuarios/login
- POST /usuarios/registro
- GET /usuarios/listar
- GET /usuarios/detalle/:id
- POST /usuarios/preferencias/registrar/:id

**Credenciales de demostración (solo en desarrollo):** `demo@local.com` / `demo1234` — inician sesión en modo demo (el backend devuelve `isDevUser: true`).

Ajusta `VITE_API_URL` si tu backend corre en otra URL/puerto.
