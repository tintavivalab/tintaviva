CREATE TABLE IF NOT EXISTS pedidos (
  id BIGSERIAL PRIMARY KEY,
  numero VARCHAR(50) UNIQUE NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente de pago',
  cliente JSONB NOT NULL,
  entrega VARCHAR(50) NOT NULL,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  cantidad_prendas INTEGER NOT NULL DEFAULT 0,
  metodo_pago VARCHAR(50) NOT NULL DEFAULT 'Transferencia bancaria',
  remitente_transferencia VARCHAR(150),
  comprobante_nombre_original VARCHAR(255),
  comprobante_archivo VARCHAR(500),
  payload JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pedido_items (
  id BIGSERIAL PRIMARY KEY,
  pedido_id BIGINT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id VARCHAR(100),
  nombre VARCHAR(200) NOT NULL,
  color VARCHAR(100),
  talle VARCHAR(50),
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario NUMERIC(12, 2) NOT NULL DEFAULT 0,
  personalizacion JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pedidos_numero
ON pedidos(numero);

CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido_id
ON pedido_items(pedido_id);