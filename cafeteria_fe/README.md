# Cafetería App - Frontend

## Descripción
El frontend de la aplicación de cafetería es una interfaz de usuario desarrollada en React que permite a los trabajadores de la cafetería interactuar con el sistema. Proporciona funcionalidades según los roles definidos: recepcionistas, cocineros y administradores. Se conecta al backend mediante una API REST para gestionar productos, pedidos y usuarios.

Además incluye un modulo nuevo de fidelizacion de clientes desarrollado para el segundo parcial, resuelto completamente del lado frontend.

## Características principales
- **Recepcionista**: Puede añadir nuevos pedidos al sistema.
- **Cocineros**: Visualizan los pedidos, marcan pedidos como listos para entregar o entregados.
- **Administradores**: Gestionan productos, precios y cuentas de usuarios.
- **Fidelización**: Incluye un modulo frontend del segundo parcial con CRUDs, consultas, servicios y proceso planificado simulado.

## Modulo de fidelizacion

El modulo de fidelizacion fue agregado dentro de la misma app React para cumplir el punto 5 del segundo parcial.

### Alcance

- No requiere backend nuevo.
- Usa datos de ejemplo con persistencia en `localStorage`.
- Se accede desde la pestaña `Fidelizacion` despues del login.
- Esta pensado para demostracion funcional y defensa oral.

### Secciones incluidas

- Clientes
- Conceptos
- Reglas
- Vencimientos
- Bolsa de puntos
- Uso de puntos
- Consultas
- Servicios
- Proceso planificado

### Operaciones simuladas

- Carga de puntos segun reglas configuradas.
- Uso de puntos con esquema FIFO.
- Consulta de equivalencia de monto a puntos.
- Comprobante de uso con mensaje de envio de correo simulado.
- Vencimiento manual de bolsas desde el proceso planificado.

### Archivos principales

- `src/FidelizacionApp.jsx`
- `src/fidelizacion/Clientes.jsx`
- `src/fidelizacion/Conceptos.jsx`
- `src/fidelizacion/Reglas.jsx`
- `src/fidelizacion/Vencimientos.jsx`
- `src/fidelizacion/BolsaPuntos.jsx`
- `src/fidelizacion/UsoPuntos.jsx`
- `src/fidelizacion/Consultas.jsx`
- `src/fidelizacion/Servicios.jsx`
- `src/fidelizacion/ProcesoPlanificado.jsx`
- `src/fidelizacion/storage.js`
- `src/fidelizacion/mockData.js`

## Live Demo
[Frontend](https://cafeteria-fe.onrender.com/)

[Backend](https://cafeteria-be.onrender.com/)

### Usuarios
```
    admin:admin
    recepcion:recepcion
    cocinero:cocinero
```
## Requisitos previos
- Node.js y npm instalados.
- El backend de la aplicación debe estar corriendo.
- Docker (Recomendado).

## Instrucciones de ejecución
1. Clona el repositorio del frontend:

    ```bash
    git clone https://github.com/hezqiel7/cafeteria_fe
    ```

2. Navega al directorio del proyecto:

    ```bash
    cd cafeteria_fe
    ```

3. Instala las dependencias del proyecto:

    ```bash
    npm install
    ```

4. Configura las variables de entorno:
   - Crea un archivo `.env` en la raíz del proyecto (puedes copiar `.env.example`).
   - Define `APP_ENV=development` para local o `APP_ENV=production` para Render.
   - (Opcional) Define `APP_API_BASE_URL` si quieres apuntar a un backend distinto al default del entorno.

5. Inicia el servidor de desarrollo:

    ```bash
    npm run dev
    ```

6. Accede a la aplicación desde tu navegador en:

    ```
    http://localhost:5173
    ```

7. Inicia sesion con:

    ```text
    admin / admin
    ```

8. Abre la pestaña `Fidelizacion` para probar el segundo parcial.

## Ejecución con Docker (Opcional)
1. Construye la imagen de Docker:

    ```bash
    docker build -t cafeteria_fe .
    ```

2. Ejecuta el contenedor:

    ```bash
    docker run -p 5173:5173 --env-file .env cafeteria_fe
    ```

## Render

- Configura `APP_ENV=production`.
- Si tu backend no usa `https://cafeteria-be.onrender.com`, define `APP_API_BASE_URL` con la URL publica de tu servicio backend en Render.
