# Cafeteria - Full Stack (Backend + Frontend)

Aplicacion web para gestion de una cafeteria con modulo de fidelizacion de clientes.

El proyecto esta dividido en dos apps:

- `cafeteria_be`: API REST con Django + Django REST Framework + MongoDB (djongo)
- `cafeteria_fe`: cliente web con React + Vite + Bootstrap

## Contenido

- [Arquitectura general](#arquitectura-general)
- [Stack y componentes](#stack-y-componentes)
- [Requisitos previos](#requisitos-previos)
- [Ejecucion local con Docker](#ejecucion-local-con-docker)
- [Ejecucion local sin Docker](#ejecucion-local-sin-docker)
- [Variables de entorno](#variables-de-entorno)
- [Usuarios demo](#usuarios-demo)
- [Autenticacion y autorizacion](#autenticacion-y-autorizacion)
- [Grupos y permisos](#grupos-y-permisos)
- [API principal](#api-principal)
- [Modulo de fidelizacion](#modulo-de-fidelizacion)
- [Despliegue en Render](#despliegue-en-render)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Problemas comunes](#problemas-comunes)

## Arquitectura general

```
Cliente (React)
    |
    | HTTP (JWT Bearer token)
    v
API REST (Django + DRF)
    |
    | djongo
    v
MongoDB
```

1. El usuario inicia sesion desde el frontend o directamente contra `/api/token/`.
2. El backend devuelve un par `access` + `refresh` JWT.
3. Cada request protegida se envia con `Authorization: Bearer <token>`.
4. La API consulta y persiste datos en MongoDB a traves de djongo (traductor SQL -> MongoDB).
5. El frontend decide que vistas y acciones mostrar segun el grupo del usuario (obtenido de `/usuarios/{id}/grupos/`).

## Stack y componentes

### Backend (`cafeteria_be`)

| Componente | Version |
|---|---|
| Python | 3.10 |
| Django | 4.1 |
| Django REST Framework | 3.x |
| Simple JWT | 5.x |
| Djongo | 1.3.6 |
| WhiteNoise | (estaticos en produccion) |
| Gunicorn | (servidor WSGI en produccion) |
| pymongo | 3.13.0 |

### Frontend (`cafeteria_fe`)

| Componente | Version |
|---|---|
| React | 18 |
| Vite | 5.x |
| React Router DOM | 6.x |
| Bootstrap | 5.x |
| React Bootstrap | 2.x |

### Infraestructura local

Docker Compose con 3 servicios:

| Servicio | Imagen | Puerto local |
|---|---|---|
| `mongo` | mongo:6 | 27017 |
| `backend` | construida desde `cafeteria_be/` | 8000 |
| `frontend` | construida desde `cafeteria_fe/` | 5173 |

### Infraestructura en produccion (Render)

- Backend: Web Service con Docker (Gunicorn, puerto 10000)
- Frontend: Static Site construido con Vite, servido por Render CDN
- Base de datos: MongoDB Atlas (free tier M0)

## Requisitos previos

### Docker

- Docker Engine 24+
- Docker Compose v2

### Manual (sin Docker)

- Python 3.10
- Node.js 18+
- MongoDB 6+ (local o remoto)

## Ejecucion local con Docker

### 1. Clonar y entrar al repositorio

```bash
git clone git@github.com:hezqiel7/cafeteria.git
cd cafeteria
```

### 2. Copiar entorno

```bash
cp .env.example .env
```

El archivo `.env.example` ya contiene valores por defecto funcionales para desarrollo local. El archivo `.env` generado debe tener al menos:

```env
APP_ENV=development
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
```

### 3. Levantar servicios

```bash
docker compose up --build
```

La primera vez descargara imagenes y construira los contenedores. Las siguientes veces puede omitirse `--build`.

### 4. Acceder

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Admin Django | http://localhost:8000/admin/ |
| MongoDB (cliente externo) | mongodb://localhost:27017 |

### 5. Detener

```bash
docker compose down
```

Para eliminar tambien los volumenes (borra datos de MongoDB):

```bash
docker compose down -v
```

### Que pasa al iniciar el backend

El script `cafeteria_be/start.sh` ejecuta automaticamente:

1. `python manage.py migrate` — crea las colecciones/tablas en MongoDB.
2. `python manage.py seed_fidelizacion` — carga datos demo del modulo de fidelizacion (clientes, reglas, conceptos, vencimientos, bolsas, usos) y crea los usuarios `recepcion` / `cocinero` con sus grupos.
3. Creacion de superusuario admin — si no se pasan `ADMIN_USERNAME` / `ADMIN_PASSWORD` via env vars, se crea por defecto `admin` / `admin`.
4. En desarrollo: `runserver`. En produccion: `collectstatic` + `gunicorn`.

## Ejecucion local sin Docker

### Backend

```bash
cd cafeteria_be

# Entorno virtual
python -m venv .venv
source .venv/bin/activate   # Linux/Mac
.venv\Scripts\activate       # Windows

# Dependencias
pip install -r requirements.txt

# Migrar y cargar datos
python manage.py migrate
python manage.py seed_fidelizacion

# Crear superusuario (opcional si ya existe admin por seed)
python manage.py createsuperuser --username admin --email admin@local.dev

# Iniciar
python manage.py runserver
```

> Nota: Asegurate de tener MongoDB corriendo en `localhost:27017` o ajustar `DB_HOST` en las env vars.

### Frontend

```bash
cd cafeteria_fe
npm install
npm run dev
```

El frontend espera el backend en `http://localhost:8000` por defecto (configurado en `src/config.js`).

## Variables de entorno

### Backend

| Variable | Obligatoria | Default (desarrollo) | Default (produccion) | Descripcion |
|---|---|---|---|---|
| `APP_ENV` | Si | `development` | `production` | Controla modo desarrollo vs produccion |
| `SECRET_KEY` | Si | `django-insecure-...` | (definir en Render) | Clave secreta de Django |
| `JWT_SECRET` | Si | (usa SECRET_KEY) | (definir en Render) | Clave para firmar JWTs |
| `DB_NAME` | Si | `cafeteria_db` | `cafeteria_db` | Nombre de la base de datos |
| `DB_HOST` | Si | `mongodb://mongo:27017/` | hardcodeado a Atlas | URI de conexion MongoDB |
| `ADMIN_USERNAME` | No | `admin` | `admin` | Username del superusuario inicial |
| `ADMIN_PASSWORD` | No | `admin` | `admin` | Password del superusuario inicial |
| `ADMIN_EMAIL` | No | `admin@local.dev` | `admin@local.dev` | Email del superusuario |
| `ALLOWED_HOSTS` | No | `*` | (definir) | Hosts permitidos por Django |
| `CORS_ALLOWED_ORIGINS` | No | `http://localhost:5173` | (definir en Render) | Origenes permitidos por CORS |
| `CSRF_TRUSTED_ORIGINS` | No | — | (definir en Render) | Origenes CSRF confiables |
| `DB_SSL` | No | — | `true` (en produccion) | Usar SSL para MongoDB |
| `DB_SSL_ALLOW_INVALID_CERTS` | No | — | `true` (en produccion) | Permitir certificados SSL invalidos |

> En produccion (Render) `DB_HOST` esta hardcodeado en `settings.py` apuntando a MongoDB Atlas. La env var `DB_HOST` no se usa en produccion.

### Frontend

| Variable | Obligatoria | Default | Descripcion |
|---|---|---|---|
| `APP_API_BASE_URL` | No | `http://localhost:8000` | URL base del backend (importante en produccion) |

## Usuarios demo

Al iniciar el backend (con Docker o manualmente con `seed_fidelizacion`) se crean estos usuarios:

| Usuario | Password | Grupo | Rol |
|---|---|---|---|
| `admin` | `admin` | — | Superusuario Django (staff, acceso total) |
| `recepcion` | `recepcion` | `recepcion` | Puede crear/ver pedidos y acceder a Fidelizacion |
| `cocinero` | `cocinero` | `cocina` | Puede ver pedidos y marcar como listos |

Todos los usuarios pueden iniciar sesion en `/admin/` y en el frontend.

## Autenticacion y autorizacion

### Endpoints JWT

```
POST /api/token/          -> { access, refresh }
POST /api/token/refresh/  -> { access }
```

Headers para endpoints protegidos:

```http
Authorization: Bearer <access_token>
```

### Permisos por endpoint

| Endpoint | Metodos | Quien puede |
|---|---|---|
| `/productos/` | GET, POST, PUT, PATCH, DELETE | Administrador, Recepcion, Cocina |
| `/pedidos/` | GET, PUT, PATCH | Administrador, Recepcion, Cocina |
| `/pedidos/` | POST, DELETE | Administrador, Recepcion |
| `/usuarios/` | Todos | Solo Administrador |
| `/usuarios/{id}/grupos/` | GET | Administrador, Recepcion, Cocina |
| `/fidelizacion/*` | Todos | Administrador, Recepcion |

## Grupos y permisos

### Grupos definidos

| Grupo | Nombre en codigo | Descripcion |
|---|---|---|
| `administrador` | — | Grupo reservado para admins no-superusuario |
| `recepcion` | `IsRecepcionista` | Atencion al cliente, creacion de pedidos, fidelizacion |
| `cocina` | `IsCocinero` | Vista de pedidos, marcar como listo |

### Classes de permiso en backend

- `IsAdminUser` — DRF nativo, requiere `is_staff=True`
- `IsRecepcionista` — permisos.py, requiere grupo `recepcion`
- `IsCocinero` — permisos.py, requiere grupo `cocina`

Se usan combinadas con OR en las vistas (ej: `IsAdminUser | IsRecepcionista`).

## API principal

Todas las rutas estan montadas bajo `/api/` en el router principal.

### Auth

| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/api/token/` | Obtener JWT (login) |
| POST | `/api/token/refresh/` | Refrescar JWT |

### Productos

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/productos/` | Listar todos |
| POST | `/api/productos/` | Crear |
| GET | `/api/productos/{id}/` | Obtener uno |
| PUT | `/api/productos/{id}/` | Actualizar completo |
| PATCH | `/api/productos/{id}/` | Actualizar parcial |
| DELETE | `/api/productos/{id}/` | Eliminar |

Campos del modelo: `id`, `nombre`, `precio`.

### Pedidos

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/pedidos/` | Listar todos |
| POST | `/api/pedidos/` | Crear |
| GET | `/api/pedidos/{id}/` | Obtener uno |
| PUT | `/api/pedidos/{id}/` | Actualizar completo |
| PATCH | `/api/pedidos/{id}/` | Actualizar parcial |
| DELETE | `/api/pedidos/{id}/` | Eliminar |
| GET | `/api/pedidos/{id}/productos/` | Productos del pedido |

Campos del modelo: `id`, `mesa`, `listo`, `fecha_pedido`, `lista_productos` (JSON), `total_precio` (autocalculado), `nombre_cliente`.

### Usuarios

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/usuarios/` | Listar todos (solo admin) |
| POST | `/api/usuarios/` | Crear (solo admin) |
| GET | `/api/usuarios/{id}/` | Obtener uno (solo admin) |
| PUT | `/api/usuarios/{id}/` | Actualizar (solo admin) |
| PATCH | `/api/usuarios/{id}/` | Actualizar parcial (solo admin) |
| DELETE | `/api/usuarios/{id}/` | Eliminar (solo admin) |
| GET | `/api/usuarios/{id}/grupos/` | Obtener grupo del usuario |

### Fidelizacion

Endpoints bajo `/api/fidelizacion/`. Todos protegidos, requieren admin o recepcion.

| Recurso | Metodos |
|---|---|
| `/api/fidelizacion/clientes/` | GET, POST, PUT, PATCH, DELETE |
| `/api/fidelizacion/conceptos/` | GET, POST, PUT, PATCH, DELETE |
| `/api/fidelizacion/reglas/` | GET, POST, PUT, PATCH, DELETE |
| `/api/fidelizacion/vencimientos/` | GET, POST, PUT, PATCH, DELETE |
| `/api/fidelizacion/bolsas/` | GET, POST |
| `/api/fidelizacion/usos/` | GET, POST |
| `/api/fidelizacion/cargar-puntos/` | POST |
| `/api/fidelizacion/usar-puntos/` | POST |
| `/api/fidelizacion/procesar-vencimiento/` | POST |
| `/api/fidelizacion/consultas/` | GET (con filtros) |

> Las acciones personalizadas (`cargar-puntos`, `usar-puntos`, `procesar-vencimiento`, `consultas`) son endpoints con logica de negocio detallada en `services.py`.

## Modulo de fidelizacion

### Objetivo

Administrar el ciclo completo de fidelizacion de clientes: asignacion de puntos por compras, uso de puntos con descuento FIFO, reglas de equivalencia, vencimiento programado y consultas.

### Modelos

| Modelo | Descripcion |
|---|---|
| `ClienteFidelizacion` | Datos del cliente (nombre, documento, nacionalidad, email, telefono) |
| `ConceptoUsoPuntos` | Concepto por el cual se usan puntos (ej: vale descuento, vale premio) |
| `ReglaAsignacionPuntos` | Regla de equivalencia monto/puntos (por rangos de monto de operacion) |
| `VencimientoPuntos` | Periodo de vigencia de puntos (fecha inicio-fin, dias de duracion) |
| `BolsaPuntos` | Bolsa generada al cargar puntos (saldo, fechas, monto de operacion) |
| `UsoPuntos` | Cabecera de uso de puntos con detalle FIFO por bolsa |
| `ProcesoFidelizacion` | Control de la ultima ejecucion del proceso de vencimiento |

### Servicios (logica de negocio)

Los servicios estan en `cafeteria_be/fidelizacion/services.py`:

| Servicio | Funcion |
|---|---|
| `cargar_puntos` | Toma un cliente y un monto de operacion, aplica la regla de equivalencia, crea una bolsa de puntos |
| `usar_puntos` | Toma un cliente, concepto y puntaje, descuenta por FIFO de las bolsas no vencidas, registra el uso |
| `procesar_vencimiento` | Marca como vencidas las bolsas cuya fecha de caducidad ya paso |
| `puntos_a_vencer` | Consulta puntos que vencen en un rango de fechas |
| `puntos_vencidos_por_cliente` | Muestra puntos vencidos agrupados por cliente |

### Logica de equivalencia

Las `ReglaAsignacionPuntos` definen rangos de monto de operacion:

| Limite inferior | Limite superior | Monto por punto |
|---|---|
| Gs. 0 | Gs. 199.999 | Gs. 50.000 = 1 punto |
| Gs. 200.000 | Gs. 499.999 | Gs. 30.000 = 1 punto |
| Gs. 500.000 | — | Gs. 20.000 = 1 punto |

Ejemplo: una compra de Gs. 600.000 = 12 puntos (500.000 / 20.000 + 100.000 / 30.000 segun reglas).

### Uso FIFO

Al usar puntos, se descuentan siempre de las bolsas mas antiguas primero (FIFO). El detalle del uso registra exactamente que bolsas se consumieron y cuanto de cada una.

### Como se accede desde el frontend

1. Iniciar sesion con `admin` / `admin` o `recepcion` / `recepcion`.
2. Hacer clic en la pestana `Fidelizacion` en la barra de navegacion.
3. Navegar entre las secciones: Clientes, Reglas, Conceptos, Vencimientos, Bolsas, Usos, Consultas.

### Demo rapido

1. Ir a Clientes y dar de alta uno nuevo.
2. Ir a Reglas y ajustar una regla de puntos.
3. Volver a Clientes, seleccionar el cliente y usar "Cargar puntos" con un monto.
4. Ir a Usos y usar "Usar puntos" para consumir saldo.
5. Ir a Bolsas para ver el saldo restante.
6. Ir a Consultas para ver "Puntos a vencer" en un rango de fechas.

## Datos de semilla

Al ejecutar `python manage.py seed_fidelizacion` se cargan:

- 3 clientes demo (Ana Gomez, Luis Benitez, Maria Fernandez)
- 3 conceptos de uso (Vale descuento, Vale premio, Vale consumicion)
- 3 reglas de asignacion (tramos de monto)
- 2 periodos de vencimiento
- 2 bolsas de puntos con saldo
- 1 uso de puntos con detalle FIFO
- 1 registro de proceso de fidelizacion
- 2 usuarios demo (recepcion, cocinero) con sus grupos

## Despliegue en Render

### Archivo de referencia

`render.yaml` en la raiz del repositorio define dos servicios:

```
cafeteria-be (Web Service)
  rootDir: cafeteria_be
  build: docker build
  env: APP_ENV=production

cafeteria-fe (Static Site)
  rootDir: cafeteria_fe
  build: npm ci && npm run build
  publish: dist
```

### Configuracion manual en Render

#### Backend (Web Service)

1. Crear Web Service desde el repo.
2. `Root Directory`: `cafeteria_be`
3. `Build Command`: (usar Dockerfile)
4. `Start Command`: `./start.sh`
5. Variables de entorno requeridas:

| Variable | Valor |
|---|---|
| `APP_ENV` | `production` |
| `SECRET_KEY` | (clave unica) |
| `JWT_SECRET` | (clave unica) |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | `admin` |
| `CORS_ALLOWED_ORIGINS` | `https://cafeteria-frontend-yxjk.onrender.com` |
| `CSRF_TRUSTED_ORIGINS` | `https://cafeteria-frontend-yxjk.onrender.com` |

6. `DB_HOST` esta hardcodeado en settings.py apuntando a MongoDB Atlas. No es necesario definirlo como env var.

#### Frontend (Static Site)

1. Crear Static Site desde el repo.
2. `Root Directory`: `cafeteria_fe`
3. `Build Command`: `npm ci && npm run build`
4. `Publish Directory`: `dist`
5. Variable de entorno:

| Variable | Valor |
|---|---|
| `APP_API_BASE_URL` | `https://cafeteria-backend-aicu.onrender.com` |

#### Base de datos (MongoDB Atlas)

1. Crear cluster free tier M0 en MongoDB Atlas.
2. En Network Access, permitir acceso desde cualquier IP (`0.0.0.0/0`) o desde las IPs de Render.
3. Crear usuario de base de datos con password.
4. La URI de conexion se hardcodea en `settings.py` en produccion:

```
mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?appName=<name>
```

### URLs de produccion actuales

| Servicio | URL |
|---|---|
| Backend API | https://cafeteria-backend-aicu.onrender.com |
| Frontend | https://cafeteria-frontend-yxjk.onrender.com |
| Admin Django | https://cafeteria-backend-aicu.onrender.com/admin/ |

## Estructura del repositorio

```text
cafeteria/
├── cafeteria_be/                  # Backend Django + DRF
│   ├── cafeteria_be/
│   │   ├── __init__.py
│   │   ├── settings.py            # Configuracion Django (dev/prod)
│   │   ├── urls.py                # Rutas principales
│   │   ├── wsgi.py                # Entry point WSGI
│   │   └── permissions.py         # Clases de permiso personalizadas
│   ├── productos/                 # Modulo productos (modelo, views, serializer, urls)
│   ├── pedidos/                   # Modulo pedidos
│   ├── usuarios/                  # Modulo usuarios
│   ├── fidelizacion/              # Modulo fidelizacion
│   │   ├── models.py              # Modelos (Cliente, Concepto, Regla, Vencimiento, Bolsa, Uso, Proceso)
│   │   ├── serializers.py         # Serializers
│   │   ├── views.py               # ViewSets con permisos
│   │   ├── urls.py                # Rutas del modulo
│   │   ├── services.py            # Logica de negocio (cargar, usar, vencimiento, consultas)
│   │   └── management/commands/
│   │       └── seed_fidelizacion.py  # Carga de datos demo
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── start.sh                   # Script de inicio
│   └── .env.example
├── cafeteria_fe/                  # Frontend React + Vite
│   ├── src/
│   │   ├── App.jsx                # App principal con routing
│   │   ├── FidelizacionApp.jsx    # Modulo fidelizacion (entrada)
│   │   ├── fidelizacion/          # Componentes del modulo
│   │   ├── components/            # Componentes compartidos
│   │   ├── config.js              # Configuracion (URL base de API)
│   │   ├── api.js                 # Cliente API con JWT
│   │   └── main.jsx               # Entry point
│   ├── package.json
│   ├── vite.config.js
│   ├── start.sh
│   └── .env.example
├── .env.example                   # Variables de entorno raiz
├── docker-compose.yml             # Orquestacion local
├── render.yaml                    # Configuracion Render
└── README.md
```

## Problemas comunes

### 401 Unauthorized

- El token JWT esta vencido o es invalido.
- Falta el header `Authorization: Bearer <token>`.
- Solucion: renovar token en `/api/token/refresh/` o volver a iniciar sesion.

### 403 Forbidden

- El usuario no pertenece al grupo requerido para esa accion.
- Verificar el grupo del usuario en `/api/usuarios/{id}/grupos/`.
- Asignar el grupo correcto desde el admin de Django.

### Error de CORS

- El frontend no puede alcanzar el backend por politicas de CORS.
- Revisar `CORS_ALLOWED_ORIGINS` en el backend.
- Revisar `APP_API_BASE_URL` en el frontend (debe coincidir con la URL real del backend).
- En produccion, ambos deben apuntar a las URLs de Render.

### Backend no conecta a MongoDB

- Verificar que MongoDB este corriendo: `docker compose ps` (local) o revisar estado en Atlas (produccion).
- Validar `DB_HOST` (local) o la cadena hardcodeada en `settings.py` (produccion).
- Si es MongoDB Atlas, verificar Network Access (whitelist de IPs).
- Si hay error SSL/TLS, verificar `DB_SSL_ALLOW_INVALID_CERTS=true`.

### El contenedor backend no arranca

- Revisar logs: `docker compose logs backend`.
- Causas comunes: MongoDB no esta listo aun (el backend intenta conectar antes de que Mongo termine de iniciar).
- Solucion: esperar unos segundos y ejecutar `docker compose restart backend`.

### El seed de fidelizacion falla

- Ejecutar manualmente: `docker compose exec backend python manage.py seed_fidelizacion`.
- Verificar que las migraciones esten al dia: `docker compose exec backend python manage.py migrate`.

### No aparece el modulo de fidelizacion en el frontend

- Iniciar sesion con un usuario que tenga grupo `recepcion` o sea `admin` (staff).
- La pestana "Fidelizacion" solo se muestra a usuarios con esos roles.
