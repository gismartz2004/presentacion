# Furniture Showcase - Premium Design

Este proyecto es una vitrina de muebles premium con integración de Three.js y animaciones avanzadas.

## Requisitos Previos

- **Node.js**: Versión 18 o superior.
- **PostgreSQL**: Una base de datos local o remota.

## Configuración Paso a Paso

1. **Instalar Dependencias**:
   ```bash
   npm install
   ```

2. **Variables de Entorno**:
   - Copia el archivo `.env.example` a `.env`:
     ```bash
     cp .env.example .env
     ```
   - Abre el archivo `.env` y añade tu URL de base de datos de PostgreSQL:
     ```env
     DATABASE_URL=postgresql://TU_USUARIO:TU_PASSWORD@localhost:5432/TU_DATABASE
     ```

3. **Preparar la Base de Datos**:
   - Ejecuta las migraciones para crear las tablas necesarias:
     ```bash
     npm run db:push
     ```

4. **Iniciar el Proyecto**:
   - Para desarrollo con recarga en vivo:
     ```bash
     npm run dev
     ```
   - El proyecto estará disponible en `http://localhost:5000`.

## Despliegue con Docker y Cloud Run

Este proyecto está listo para ser desplegado en Google Cloud Run.

### 1. Construir la Imagen Localmente (Opcional)
```bash
docker build -t furniture-showcase .
```

### 2. Despliegue en Cloud Run (vía Git)
La forma más fácil de conectar con **Cloud Run** es a través de GitHub/GitLab:
1. Sube este código a tu repositorio de Git.
2. En Google Cloud Console, ve a **Cloud Run** > **Crear servicio**.
3. Selecciona "Continuous deployment from a repository".
4. Sigue los pasos para conectar tu repo y selecciona el ramal (branch) principal.
5. Cloud Run detectará automáticamente el `Dockerfile`.

### 3. Configuración en la Nube
Asegúrate de configurar estas variables en el servicio de Cloud Run:
- `DATABASE_URL`: Tu conexión a PostgreSQL (puedes usar Cloud SQL).
- `NODE_ENV`: production
- `PORT`: 5000 (o el que prefieras, la app lo detectará).

---

## Características Principales

- **Diseño Premium**: Paleta de colores Cafe, Beige y Azul Marino.
- **Experiencia 3D**: Visualizador interactivo de colores en tiempo real usando Three.js.
- **Catálogo Dinámico**: Gestión de productos con base de datos.
- **Animaciones Cinematográficas**: Transiciones fluidas con Framer Motion.

## Comandos Útiles

- `npm run build`: Genera la versión de producción.
- `npm start`: Inicia el servidor en producción (después de compilar).
- `npm run check`: Verifica errores de TypeScript.


Levantar el Backend (Puerto 4001):
cd admin-floreria/api
npm install
Configurar .env (DATABASE_URL, JWT_SECRET).
npx prisma generate
npm run dev
Levantar el Panel Admin (Puerto 3000):
cd admin-floreria/client
npm install
npm run dev -- --port 3000
Levantar la Boutique DIFIORI (Puerto 5000):
Desde la raíz: npm install
npm run dev:client