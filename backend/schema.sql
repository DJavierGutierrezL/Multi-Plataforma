-- 1) Usuarios (sin barberia_id inicialmente)
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','empleado','cliente')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2) Barberías (referencia owner_id -> users.id)
CREATE TABLE IF NOT EXISTS barberias (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  direccion TEXT,
  telefono TEXT,
  owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL
);

-- 3) Agregar barberia_id a users y crear FK (evita circular)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS barberia_id BIGINT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE c.conname = 'users_barberia_fk'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_barberia_fk
      FOREIGN KEY (barberia_id) REFERENCES barberias(id) ON DELETE SET NULL;
  END IF;
END
$$;

-- 4) Servicios
CREATE TABLE IF NOT EXISTS servicios (
  id BIGSERIAL PRIMARY KEY,
  barberia_id BIGINT NOT NULL REFERENCES barberias(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  precio NUMERIC(10,2) NOT NULL DEFAULT 0,
  duracion_min INTEGER NOT NULL DEFAULT 30,
  activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- 5) Citas
CREATE TABLE IF NOT EXISTS citas (
  id BIGSERIAL PRIMARY KEY,
  barberia_id BIGINT NOT NULL REFERENCES barberias(id) ON DELETE CASCADE,
  servicio_id BIGINT NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  cliente_id BIGINT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  empleado_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  fecha TIMESTAMP WITH TIME ZONE NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('pendiente','completada','cancelada')),
  notas TEXT
);

-- 6) Suscripciones
CREATE TABLE IF NOT EXISTS suscripciones (
  id BIGSERIAL PRIMARY KEY,
  barberia_id BIGINT UNIQUE NOT NULL REFERENCES barberias(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('individual','paquete')),
  plan_name TEXT,
  max_usuarios INTEGER NOT NULL DEFAULT 5,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  estado TEXT NOT NULL CHECK (estado IN ('activa','expirada','suspendida'))
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_users_barberia_id ON users(barberia_id);
CREATE INDEX IF NOT EXISTS idx_servicios_barberia_id ON servicios(barberia_id);
CREATE INDEX IF NOT EXISTS idx_citas_barberia_fecha ON citas(barberia_id, fecha DESC);


-- Clientes table (separate from users for CRM)
CREATE TABLE IF NOT EXISTS clientes (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  birth_date DATE,
  service_history JSONB DEFAULT '[]'::jsonb,
  preferences TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
