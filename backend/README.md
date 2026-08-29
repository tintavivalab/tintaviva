# TintaViva Backend — Sprint 2.4

Backend Node.js + Express + PostgreSQL para guardar pedidos reales y comprobantes de transferencia.

## 1. Crear la base

En PostgreSQL creá una base llamada `tintaviva` y ejecutá `schema.sql`.

## 2. Variables de entorno

Copiá `.env.example` como `.env` y completá `DATABASE_URL`.

## 3. Instalar

```bash
npm install
```

## 4. Ejecutar

```bash
npm run dev
```

Probar:

`GET http://localhost:4000/api/health`

Debe responder con `status: ok` y `database: ok`.

## Frontend

En el proyecto React creá `.env` con:

```env
VITE_API_URL=http://localhost:4000
```

Luego reiniciá Vite.

## Endpoints

- `GET /api/health`
- `POST /api/pedidos` — multipart/form-data con `pedido` (JSON) y `comprobante` (archivo)
- `GET /api/pedidos/:numero`

## Nota de producción

En este Sprint el comprobante se guarda en disco local del backend. Para Railway/Render u otros hosts con filesystem efímero, el siguiente paso debe mover comprobantes y diseños a almacenamiento persistente (por ejemplo S3/Cloudinary/R2).
