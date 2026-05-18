# Productividad_IA

Este proyecto es un verificador de contenido utilizando Inteligencia Artificial. Permite analizar texto, imágenes y videos para verificar su veracidad o contenido.

## Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalados los siguientes componentes:

1. **Node.js** (versión 14 o superior): Descárgalo desde [nodejs.org](https://nodejs.org/).
2. **Ollama**: Instala Ollama desde [ollama.ai](https://ollama.ai/). Una vez instalado, ejecuta el modelo `llava` con el comando:
   ```
   ollama run llava
   ```
3. **yt-dlp**: Herramienta para descargar videos. Instálala desde [github.com/yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp).
4. **FFmpeg**: Necesario para procesar videos. Descárgalo desde [ffmpeg.org](https://ffmpeg.org/download.html) y asegúrate de que esté en el PATH del sistema.

## Instalación

1. Clona o descarga este repositorio.
2. Navega al directorio `backend`:
   ```
   cd backend
   ```
3. Instala las dependencias:
   ```
   npm install
   ```

## Ejecución

1. Asegúrate de que Ollama esté ejecutándose con el modelo `llava`.
2. En el directorio `backend`, inicia el servidor:
   ```
   npm start
   ```
3. Abre tu navegador web y ve a `http://localhost:5000`.
4. Usa la interfaz para ingresar texto, URLs de video o subir imágenes/videos para verificar.

## Funcionalidades

- **Verificación de texto**: Ingresa una afirmación y el sistema buscará información relacionada para verificarla.
- **Análisis de imágenes**: Sube una imagen y la IA la analizará.
- **Procesamiento de videos**: Proporciona una URL de video (YouTube, Vimeo, etc.) y el sistema extraerá frames para analizarlos.

## Archivos Importantes

- `backend/server.js`: Servidor principal de Express.
- `backend/routes/verificar.js`: Ruta para manejar las solicitudes de verificación.
- `backend/services/aiService.js`: Servicio para interactuar con Ollama y procesar medios.
- `frontend/index.html`: Interfaz de usuario.
- `frontend/script.js`: Lógica del frontend.

## Notas

- El procesamiento de videos puede tomar varios minutos.
- Asegúrate de que todas las dependencias estén instaladas correctamente.
- Si encuentras errores, verifica que Ollama esté ejecutándose y que los paths de yt-dlp y FFmpeg sean correctos.

## Licencia

Este proyecto está bajo la licencia ISC.