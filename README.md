# Cafeteria (BE + FE)

Proyecto full stack de Cafeteria con:
- Backend: Django + DRF + MongoDB (djongo)
- Frontend: React + Vite

## Un solo switch de entorno

Todo el proyecto usa la variable `APP_ENV`:
- `APP_ENV=development` -> entorno local
- `APP_ENV=production` -> entorno Render

## Desarrollo local con Docker Compose

1. Copia `.env.example` a `.env` en la raiz.
2. Ejecuta:

```bash
docker compose up --build
```

Servicios:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- MongoDB: `mongodb://localhost:27017`

## Despliegue en Render

Configura estas variables de entorno:

Backend (`cafeteria_be`):
- `APP_ENV=production`
- `SECRET_KEY=<valor-seguro>`
- `JWT_SECRET=<valor-seguro>`
- `DB_NAME=<db>`
- `DB_HOST=<mongodb-uri>`
- `ADMIN_USERNAME=<usuario-admin>`
- `ADMIN_PASSWORD=<password-admin>`
- `ADMIN_EMAIL=<correo-admin>`

Frontend (`cafeteria_fe`):
- `APP_ENV=production`
- Opcional: `APP_API_BASE_URL=https://<tu-backend>.onrender.com`

Si no defines `APP_API_BASE_URL`, el frontend usa por defecto `https://cafeteria-be.onrender.com` en produccion.

## Admin Django en Docker

Al iniciar el backend en Docker, se ejecutan migraciones y se crea/actualiza automaticamente un superusuario si existen estas variables:
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_EMAIL`

Luego puedes entrar en `/admin/` con esas credenciales.
