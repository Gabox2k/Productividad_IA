# Verificador de Contenido con IA

Aplicación web para verificar la veracidad de afirmaciones de texto, imágenes y videos usando IA. El usuario ingresa un texto, un enlace de video o sube una imagen, y la app devuelve un análisis generado a partir de fuentes de referencia y/o un modelo de visión por IA.

## Características

- Verificación de afirmaciones de texto contra fuentes de referencia (Wikipedia, Google Scholar, PubMed, Snopes, BBC, Reuters, AP Fact Check).
- Análisis de imágenes con un modelo de visión (Ollama + LLaVA).
- Análisis de video: descarga con `yt-dlp`, extracción de frames con `ffmpeg` y análisis del frame con LLaVA.
- Interfaz web simple en HTML/CSS/JS servida por el propio backend.

## Arquitectura / Stack

- **Backend:** Node.js + Express 5
- **Frontend:** HTML/CSS/JS vanilla, servido de forma estática por el backend
- **IA de visión:** [Ollama](https://ollama.com) local (modelo `llava`)
- **Descarga de video:** [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- **Procesamiento de video:** [ffmpeg](https://ffmpeg.org) (extracción de frames)

## Estructura del proyecto

```
backend/
  config/openrouter.js     # Placeholder, sin implementar aún
  routes/verificar.js      # Endpoint POST /api/verificar
  services/
    SearchServices.js      # Genera URLs de fuentes según palabras clave del texto
    ragServices.js         # Construye el prompt/contexto para el análisis
    aiService.js           # Descarga video, extrae frames y llama a Ollama
  utils/prompt.js          # Placeholder, sin implementar aún
  server.js                # Servidor Express: sirve el frontend y monta /api
frontend/
  index.html
  script.js
  style.css                # Sin estilos definidos aún
test_video.js               # Script manual para probar el endpoint con un video
```

## Requisitos previos

- Node.js 18+
- [Ollama](https://ollama.com) corriendo localmente con el modelo `llava` descargado:
  ```bash
  ollama pull llava
  ```
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) instalado y disponible en el PATH (necesario solo para verificar videos)
- [ffmpeg](https://ffmpeg.org) instalado (necesario solo para verificar videos)

> ⚠️ La ruta al ejecutable de ffmpeg está hardcodeada en `backend/services/aiService.js` (constante `FFMPEG`). Hay que actualizarla a la ruta local antes de ejecutar el proyecto.

## Instalación

```bash
cd backend
npm install
```

## Uso

1. Iniciá Ollama (`ollama serve`) con el modelo `llava` ya descargado.
2. Iniciá el servidor backend:
   ```bash
   cd backend
   npm start
   ```
3. Abrí `http://localhost:5000` en el navegador.
4. Ingresá una afirmación de texto, pegá un link de video, o subí una imagen, y presioná **Verificar**.

## API

### `POST /api/verificar`

Request `multipart/form-data` con al menos uno de estos campos:

| Campo      | Tipo   | Descripción                                                        |
|------------|--------|---------------------------------------------------------------------|
| `texto`    | string | Afirmación a verificar (o un link de video pegado en este campo)   |
| `videoUrl` | string | Enlace de video (YouTube, Vimeo, TikTok o archivo de video directo) |
| `imagen`   | file   | Imagen a analizar                                                    |

Respuesta exitosa:
```json
{ "resultado": "análisis generado por la IA" }
```

Respuesta con error:
```json
{ "mensaje": "descripción del error" }
```

## Notas y limitaciones conocidas

- El análisis de video solo evalúa el primer frame extraído, no el video completo.
- `backend/config/openrouter.js` y `backend/utils/prompt.js` están vacíos: parecen ser trabajo en progreso para integrar la API de OpenRouter como alternativa o complemento a Ollama.
- `frontend/style.css` está vacío; la interfaz todavía no tiene estilos aplicados.
- El proyecto depende de `dotenv`, pero actualmente no hay ningún archivo `.env` ni variables de entorno en uso.

## Licencia

No especificada.
