-- KandyApp Database Schema
--
-- Este script crea todas las tablas necesarias para la aplicación Kandy,
-- estableciendo relaciones, restricciones y tipos de datos adecuados.
-- Versión 1.0

-- Elimina las tablas si ya existen para empezar desde cero (opcional, cuidado en producción)
DROP TABLE IF EXISTS payments, subscriptions, appointments, products, clients, users, plans, businesses CASCADE;

-- Tabla para los Negocios (el núcleo de la aplicación)
CREATE TABLE businesses (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    salon_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255),
    account_number TEXT,
    prices JSONB, -- Usamos JSONB para guardar el objeto de precios flexible
    theme_primary_color VARCHAR(50) DEFAULT 'Pink',
    theme_background_color VARCHAR(50) DEFAULT 'White',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para los Planes de Suscripción
CREATE TABLE plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    price INTEGER NOT NULL, -- Guardamos el precio en centavos o la unidad mínima para evitar decimales
    features TEXT[] -- Usamos un array de texto para las características
);

-- Tabla para los Usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- NUNCA guardes contraseñas en texto plano
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'User',
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE, -- Si se borra un negocio, se borran sus usuarios
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para los Clientes de cada Negocio
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    birth_date DATE,
    preferences TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para las Citas
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    "time" TIME NOT NULL, -- "time" es una palabra reservada, por eso las comillas
    status VARCHAR(50) NOT NULL,
    services TEXT[] NOT NULL,
    cost INTEGER, -- El costo final, si difiere del cálculo de precios
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para el Inventario de Productos
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para las Suscripciones
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES plans(id),
    status VARCHAR(50) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabla para el Historial de Pagos
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    plan_name VARCHAR(100) NOT NULL
);

-- Mensaje de éxito
-- SELECT '¡Base de datos KandyApp creada exitosamente!' AS status;