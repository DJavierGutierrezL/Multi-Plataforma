# Barberías & Spa — Fullstack (Frontend + Backend)

Este repositorio contiene tu frontend (React + Vite) y un backend en Node.js (Express) listo para Render, más un `schema.sql` para PostgreSQL.

## Estructura
```
/ (tu frontend existente)
/backend
  server.js
  db.js
  setup_db.js
  schema.sql
  /routes
    auth.js
    barberias.js
    servicios.js
    citas.js
    suscripciones.js
  /middleware
    auth.js
  package.json
  .env.example
```

## Despliegue en Render

### 1) Base de datos (PostgreSQL)
- En Render, crea un servicio **PostgreSQL**.
- Copia la `External Connection` → será tu `DATABASE_URL`.
- Añade en el servicio del backend la variable `DATABASE_URL` con ese valor.

### 2) Backend (Web Service)
- Tipo: **Web Service**
- Root Directory: `backend`
- Runtime: Node
- Build Command: *(vacío)*
- Start Command: `node server.js`
- Environment Variables:
  - `DATABASE_URL`: (de tu Postgres en Render)
  - `JWT_SECRET`: (una cadena secreta segura)
  - `RUN_MIGRATIONS`: `true` (solo la primera vez para crear tablas)
- Ports:
  - Render usa el `PORT` automáticamente. El server lee `process.env.PORT`.

### 3) Frontend (Static Site)
- Tipo: **Static Site**
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Si tu proyecto usa Yarn/Vite, también puedes: `yarn && yarn build`

### 4) Migraciones / Esquema
- La primera vez, con `RUN_MIGRATIONS=true`, el backend ejecutará `schema.sql` y creará tablas.
- Después de creadas, cambia `RUN_MIGRATIONS` a `false` para evitar re-ejecutar.

## Endpoints básicos
- `POST /auth/register` → { name, email, password, role?, barberia_id? }
- `POST /auth/login` → { email, password } → { token }
- `POST /barberias` (admin) → crea barbería del usuario
- `GET /barberias` → lista las barberías del usuario
- `POST /servicios` → crea servicio
- `GET /servicios/:barberia_id` → lista servicios
- `POST /citas` → crea cita
- `GET /citas/:barberia_id` → lista citas de la barbería
- `POST /suscripciones` (admin) → crea/actualiza suscripción
- `GET /suscripciones/:barberia_id` → obtiene suscripción

> Todas excepto `/auth/*` requieren header `Authorization: Bearer <token>`

## Notas
- Asegúrate de **no** subir `.env` con credenciales reales al repo público.
- Para producción, deja `RUN_MIGRATIONS=false` tras el primer deploy estable.
