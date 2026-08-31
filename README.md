# Analizador de Baches

Sistema web para el reporte ciudadano de baches en la vía pública. El vecino sube una foto o video del bache junto con la dirección; una IA de visión (Ollama + LLaVA) analiza la imagen y estima tamaño, profundidad, ubicación en la calzada y nivel de peligrosidad (1-10). El reporte queda geolocalizado (Nominatim/OpenStreetMap) y visible para los administradores en un mapa, donde pueden marcarlo como reparado.

## Arquitectura / Stack

- **Backend:** Node.js + Express 5, SQLite (better-sqlite3), JWT para autenticación.
- **Frontend:** React + TypeScript + Vite + Tailwind CSS, React Router, Leaflet/React-Leaflet para el mapa.
- **IA de visión:** [Ollama](https://ollama.com) local (modelo `llava`) para analizar fotos de baches.
- **Geocodificación:** [Nominatim](https://nominatim.openstreetmap.org) (OpenStreetMap), sin necesidad de API key.
- **Procesamiento de video:** [ffmpeg](https://ffmpeg.org) (extracción de frames para análisis de videos).

## Estructura del proyecto

```
backend/
  db/
    database.js        # Esquema SQLite (usuarios, reportes_baches)
    usuariosRepo.js
    reportesRepo.js
  middleware/auth.js    # requireAuth / requireAdmin (JWT)
  routes/
    auth.js             # /api/auth/registro, /login, /me
    baches.js            # /api/baches (crear, mis-reportes, todos, :id/reparado)
  services/
    bacheService.js     # Análisis con Ollama/LLaVA + extracción de frames de video
    geoService.js        # Geocodificación de direcciones (Nominatim)
  scripts/
    crear-admin.js       # Promueve una cuenta existente a rol admin
  uploads_baches/         # Fotos/videos persistidos de los reportes
  server.js

frontend/
  src/
    components/          # Sidebar, mapa, dropzone de fotos, badges, etc.
    context/AuthContext.tsx
    pages/
      Login.tsx, Registro.tsx
      NuevoReporte.tsx    # Formulario de reporte (ciudadano)
      MisReportes.tsx     # Historial y stats (ciudadano)
      Mapa.tsx            # Mapa + listado + marcar reparado (admin)
    services/api.ts        # Cliente HTTP tipado hacia la API
    types/index.ts
  vite.config.ts            # Proxy /api y /archivos-baches hacia el backend en dev
```

## Roles

- **usuario** (ciudadano): reporta baches y consulta su propio historial.
- **admin**: ve todos los reportes en el mapa y puede marcarlos como reparados. No hay ninguna ruta HTTP para autoasignarse el rol admin; se promueve manualmente con `node backend/scripts/crear-admin.js <email>`.

## Requisitos previos

- Node.js 18+
- [Ollama](https://ollama.com) corriendo localmente con el modelo `llava` descargado:
  ```bash
  ollama pull llava
  ollama serve
  ```
- [ffmpeg](https://ffmpeg.org) instalado (solo necesario para reportes en video). La ruta al ejecutable está hardcodeada en `backend/services/bacheService.js` (constante `FFMPEG`); hay que actualizarla a la ruta local.

## Instalación y uso en desarrollo

```bash
# Backend (puerto 5000)
cd backend
npm install
npm start

# Frontend (puerto 5173, con proxy hacia el backend)
cd frontend
npm install
npm run dev
```

Abrí `http://localhost:5173` en el navegador.

## Build de producción

```bash
cd frontend
npm run build
```

Esto genera `frontend/dist`, que el propio servidor Express sirve como archivos estáticos (junto con el fallback de rutas para React Router) al correr `npm start` en `backend/`. En producción alcanza con levantar el backend en el puerto 5000.

## API

Todas las rutas autenticadas requieren `Authorization: Bearer <token>` (obtenido en `/api/auth/login`).

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/api/auth/registro` | público | Crear cuenta (rol `usuario` por defecto) |
| POST | `/api/auth/login` | público | Login, devuelve `{ token, usuario }` |
| GET | `/api/auth/me` | autenticado | Datos de la sesión actual |
| POST | `/api/baches` | autenticado | Crear reporte (`multipart/form-data`: `direccion`, `archivo`) |
| GET | `/api/baches/mis-reportes` | autenticado | Reportes propios |
| GET | `/api/baches/todos` | admin | Todos los reportes, con datos del usuario |
| PATCH | `/api/baches/:id/reparado` | admin | Marca un reporte como reparado |

## Notas y limitaciones conocidas

- El análisis de video solo evalúa hasta 3 frames distribuidos, no el video completo.
- La geocodificación usa Nominatim acotado a Paraguay (`countrycodes=py`), pero direcciones muy ambiguas o incompletas pueden ubicarse de forma incorrecta.
- `backend/config/openrouter.js` está sin implementar (posible integración futura como alternativa a Ollama).

## Licencia

No especificada.
