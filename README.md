# Cafeteria - Full Stack (Backend + Frontend)

Aplicacion web para gestion de una cafeteria.

El proyecto esta dividido en dos apps:

- `cafeteria_be`: API REST con Django + Django REST Framework + MongoDB (djongo)
- `cafeteria_fe`: cliente web con React + Vite

## Contenido

- [Arquitectura general](#arquitectura-general)
- [Stack y componentes](#stack-y-componentes)
- [Modelo de datos](#modelo-de-datos)
- [Autenticacion y autorizacion](#autenticacion-y-autorizacion)
- [Grupos y permisos](#grupos-y-permisos)
- [API principal](#api-principal)
- [Variables de entorno](#variables-de-entorno)
- [Ejecucion local con Docker](#ejecucion-local-con-docker)
- [Ejecucion local sin Docker](#ejecucion-local-sin-docker)
- [Despliegue en Render](#despliegue-en-render)
- [Flujo funcional de la app](#flujo-funcional-de-la-app)
- [Modulo de fidelizacion](#modulo-de-fidelizacion)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Problemas comunes](#problemas-comunes)

## Arquitectura general

1. El usuario inicia sesion en el frontend (`/api/token/`).
2. El backend devuelve `access` y `refresh` JWT.
3. El frontend guarda el token (localStorage o sessionStorage).
4. Cada request protegida se envia con `Authorization: Bearer <token>`.
5. La API consulta/persiste datos en MongoDB.

## Stack y componentes

### Backend (`cafeteria_be`)

- Python 3.10
- Django 4.1
- Django REST Framework
- Simple JWT
- Djongo (MongoDB)
- WhiteNoise (estaticos)
- Gunicorn (produccion)

### Frontend (`cafeteria_fe`)

- React 18
- Vite
- Bootstrap

### Infra local

- Docker Compose con 3 servicios:
  - `mongo` (puerto `27017`)
  - `backend` (puerto `8000`)
  - `frontend` (puerto `5173`)

## Modelo de datos

### Producto

- Archivo: `cafeteria_be/productos/models.py`
- Campos:
  - `id` (Integer, PK)
  - `nombre` (string)
  - `precio` (integer)

### Pedido

- Archivo: `cafeteria_be/pedidos/models.py`
- Campos:
  - `id` (Integer, PK)
  - `mesa` (integer)
  - `listo` (boolean)
  - `fecha_pedido` (datetime)
  - `lista_productos` (JSON con `{ producto_id, cantidad }`)
  - `total_precio` (integer)
  - `nombre_cliente` (text)

`total_precio` se recalcula en backend al crear/editar pedidos (serializer).

### Usuario

- Se usa `django.contrib.auth.models.User`
- Se usan `Group` de Django para roles de negocio.

## Autenticacion y autorizacion

- Endpoint de login JWT:
  - `POST /api/token/`
- Refresh token:
  - `POST /api/token/refresh/`

Headers esperados para endpoints protegidos:

```http
Authorization: Bearer <access_token>
```

## Grupos y permisos

La aplicacion maneja roles mediante grupos de Django.

Nombres de grupos usados en codigo:

- `administrador`
- `recepcion`
- `cocina`

Implementacion actual:

- `IsRecepcionista` valida grupo `recepcion`
- `IsCocinero` valida grupo `cocina`
- Ademas se usa `IsAdminUser` de DRF para admin/staff

Notas importantes:

- El endpoint `GET /usuarios/{id}/grupos/` devuelve el primer grupo del usuario.
- Conviene asignar un solo grupo principal por usuario para evitar ambiguedad.
- Si un usuario no tiene grupo, las vistas que dependen de grupo pueden fallar o devolver 403/500 segun el caso.

## API principal

Las rutas se registran en `cafeteria_be/cafeteria_be/urls.py` y en los routers de cada app.

### Auth

- `POST /api/token/`
- `POST /api/token/refresh/`

### Productos (`/productos/`)

- `GET /productos/`
- `POST /productos/`
- `GET /productos/{id}/`
- `PUT /productos/{id}/`
- `PATCH /productos/{id}/`
- `DELETE /productos/{id}/`

Permisos actuales en codigo: `IsAdminUser | IsRecepcionista | IsCocinero`.

### Pedidos (`/pedidos/`)

- `GET /pedidos/`
- `POST /pedidos/`
- `GET /pedidos/{id}/`
- `PUT /pedidos/{id}/`
- `PATCH /pedidos/{id}/`
- `DELETE /pedidos/{id}/`
- `GET /pedidos/{id}/productos/` (accion custom)

Permisos actuales:

- Listar/ver/editar y ver productos del pedido:
  - `IsAdminUser | IsRecepcionista | IsCocinero`
- Crear/eliminar:
  - `IsAdminUser | IsRecepcionista`

### Usuarios (`/usuarios/`)

- `GET /usuarios/`
- `POST /usuarios/`
- `GET /usuarios/{id}/`
- `PUT /usuarios/{id}/`
- `PATCH /usuarios/{id}/`
- `DELETE /usuarios/{id}/`
- `GET /usuarios/{id}/grupos/` (accion custom)

Permisos actuales:

- CRUD usuarios: solo `IsAdminUser`
- `grupos`: `IsAdminUser | IsRecepcionista | IsCocinero`

## Variables de entorno

Se usa `APP_ENV` para separar desarrollo y produccion.

- `APP_ENV=development`
- `APP_ENV=production`

### Backend (minimas recomendadas)

- `APP_ENV`
- `SECRET_KEY`
- `JWT_SECRET`
- `DB_NAME`
- `DB_HOST`

Opcionales/utiles:

- `DB_SSL`
- `DB_SSL_ALLOW_INVALID_CERTS`
- `ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_EMAIL`

### Frontend

- `APP_ENV`
- `APP_API_BASE_URL` (opcional pero recomendado en produccion)

### Archivos de ejemplo

- `/.env.example`
- `/cafeteria_be/.env.example`
- `/cafeteria_fe/.env.example`

## Ejecucion local con Docker

1. Copia el ejemplo de entorno raiz:

```bash
cp .env.example .env
```

2. Levanta los servicios:

```bash
docker compose up --build
```

3. URLs locales:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Admin Django: `http://localhost:8000/admin/`
- MongoDB: `mongodb://localhost:27017`

### Admin automatico en backend

Al iniciar el contenedor backend:

- se ejecuta `python manage.py migrate`
- se crea/actualiza un superusuario si existen:
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD`
  - `ADMIN_EMAIL`

## Ejecucion local sin Docker

### Backend

```bash
cd cafeteria_be
python -m venv .venv
# activar entorno virtual
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd cafeteria_fe
npm install
npm run dev
```

## Despliegue en Render

Archivo de referencia: `render.yaml`

Servicios definidos:

- Backend web en Docker (`rootDir: cafeteria_be`)
- Frontend estatico (`rootDir: cafeteria_fe`, `build: npm ci && npm run build`, `publish: dist`)

Recomendaciones:

- Definir `APP_API_BASE_URL` del frontend con la URL publica real del backend desplegado.
- Configurar en backend:
  - `ALLOWED_HOSTS`
  - `CORS_ALLOWED_ORIGINS`
  - `CSRF_TRUSTED_ORIGINS`
- Usar `DB_HOST` apuntando a MongoDB accesible desde Render.

## Flujo funcional de la app

1. Login con usuario y contrasena.
2. Obtencion de JWT.
3. Consulta de grupo del usuario (`/usuarios/{id}/grupos/`).
4. UI habilita acciones segun rol.
5. Gestion de pedidos y productos via API.
6. El administrador puede acceder al modulo `Fidelizacion` del segundo parcial.
7. Fidelizacion opera solo en frontend con datos de ejemplo persistidos en `localStorage`.

## Modulo de fidelizacion

El sistema de fidelizacion esta integrado entre el backend Django y el frontend React.
Permite administrar clientes, reglas, puntos, usos y vencimientos con datos persistidos en MongoDB.

### Objetivo

  - Administrar el ciclo completo de fidelizacion de clientes.
  - Mantener el proyecto actual de cafeteria funcionando con login y roles existentes.
  - Permitir una ejecucion directa con datos de ejemplo cargados desde el backend.

### Ubicacion del codigo

- Entrada principal: `cafeteria_fe/src/FidelizacionApp.jsx`
- Modulos: `cafeteria_fe/src/fidelizacion/`
- API frontend: `cafeteria_fe/src/fidelizacion/api.js`
- Backend: `cafeteria_be/fidelizacion/`
- Seed inicial: `cafeteria_be/fidelizacion/management/commands/seed_fidelizacion.py`

### Como se accede

1. Iniciar sesion en la app con un usuario administrador.
2. Abrir la pesta??a `Fidelizacion` desde la navbar.
3. Navegar entre las secciones del modulo.

Usuario recomendado para demo:

- `admin / admin`

### Persistencia y alcance tecnico

- Los datos de fidelizacion se guardan en `localStorage` del navegador.
- Existe un boton para restablecer los datos de ejemplo.
- Las operaciones del modulo no dependen del backend actual.
- El modulo queda disponible para demostrar el parcial aun sin desarrollar APIs nuevas.

### Cobertura exacta de la consigna

- CRUD de clientes.
- CRUD de conceptos de uso de puntos.
- CRUD de reglas de asignacion.
- CRUD de vencimientos.
- Tabla de bolsa de puntos.
- Historial y detalle FIFO de uso de puntos.
- Servicios simulados de carga, uso y equivalencia.
- Consultas por cliente, concepto, fecha, rango y proximidad de vencimiento.
- Proceso planificado manual para vencer bolsas.

### Flujo funcional del modulo

1. Se administran clientes, conceptos, reglas y vencimientos desde ABMs simples.
2. El servicio `cargar puntos` calcula la equivalencia segun la regla aplicable y crea una nueva bolsa.
3. El servicio `usar puntos` descuenta saldo por FIFO y genera cabecera mas detalle del uso.
4. La vista de `Bolsa` muestra saldo, asignacion, caducidad y estado.
5. La vista de `Uso de puntos` muestra el historial y el detalle de bolsas consumidas.
6. `Consultas` permite filtrar los reportes principales pedidos por el profesor.
7. `Proceso planificado` simula la ejecucion periodica que vence bolsas expiradas.

### Que se puede demostrar rapidamente

1. Alta de un cliente.
2. Alta o ajuste de una regla de puntos.
3. Carga de puntos para un cliente con un monto de operacion.
4. Uso de puntos con descuento FIFO.
5. Visualizacion de la bolsa generada y del historial de uso.
6. Consulta de puntos a vencer.
7. Ejecucion manual del proceso planificado.

## Estructura del repositorio

```text
cafeteria/
????????? cafeteria_be/              # Backend Django + DRF
???   ????????? cafeteria_be/          # settings, urls, wsgi, permissions
???   ????????? productos/             # modulo productos
???   ????????? pedidos/               # modulo pedidos
???   ????????? usuarios/              # modulo usuarios
???   ????????? requirements.txt
???   ????????? start.sh
????????? cafeteria_fe/              # Frontend React + Vite
???   ????????? src/
???   ????????? package.json
???   ????????? start.sh
????????? docker-compose.yml
????????? render.yaml
????????? README.md
```

## Problemas comunes

- `401 Unauthorized`:
  - token vencido/invalido o falta header `Authorization`
- `403 Forbidden`:
  - el usuario no pertenece al grupo requerido
- Error de CORS:
  - revisar `CORS_ALLOWED_ORIGINS` y `APP_API_BASE_URL`
- Backend no conecta a Mongo:
  - validar `DB_HOST`, `DB_NAME` y SSL si aplica

---

Si quieres, en un siguiente paso te puedo preparar tambien un `README` tecnico separado para `cafeteria_be` y otro para `cafeteria_fe`, dejando este README raiz como vista general del monorepo.
