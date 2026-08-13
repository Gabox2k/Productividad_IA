// Importacion de modulos
const axios = require("axios")
const { promisify } = require("util")
const { exec: execCb, execFile: execFileCb } = require("child_process")
const fs = require("fs")
const path = require("path")

const exec = promisify(execCb)
const execFile = promisify(execFileCb)
const FRAMES_DIR = path.resolve(__dirname, "../frames")
const TEMP_DIR = path.resolve(__dirname, "../actualizar")
// URL y modelo de Ollama
const OLLAMA_URL = "http://localhost:11434/api/chat"
const MODEL_NAME = "llava"
const FFMPEG = "C:\\Users\\sforz\\OneDrive\\Escritorio\\Tesis\\ffmpeg-8.1.1\\ffmpeg-8.1.1\\ffmpeg-8.1.1-essentials_build\\bin\\ffmpeg.exe"


// Funcion para descargar video usando yt-dlp
async function descargarVideo(url) {
  // Creacion del directorio temporal si no existe
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true })
  }

  // Limpiar archivos anteriores en el directorio temporal
  fs.readdirSync(TEMP_DIR).forEach((file) => {
    fs.unlinkSync(path.join(TEMP_DIR, file))
  })

  // Plantilla de salida para yt-dlp
  const outputTemplate = path.join(TEMP_DIR, "video.%(ext)s")
  // Comando para descargar el video
  const command = `yt-dlp --no-playlist -f "best[ext=mp4]/best" -o "${outputTemplate}" "${url}"`

  console.log("Ejecutando:", command)
  // Ejecutar yt-dlp con timeout
  const { stdout, stderr } = await exec(command, { timeout: 300000})
  console.log("stdout:", stdout)
  console.log("stderr:", stderr)

  // Listar archivos en el directorio temporal
  const archivos = fs.readdirSync(TEMP_DIR)
  console.log("Archivos en TEMP_DIR:", archivos)

  // Encontrar el archivo de video descargado
  const videoArchivo = archivos.find(f => /^video\.(mp4|mkv|webm|mov)$/i.test(f))
  if (!videoArchivo) {
    throw new Error(`yt-dlp no generó archivo de video. Archivos encontrados: ${archivos.join(", ")}`)
  }

  return path.join(TEMP_DIR, videoArchivo)
}

// Funcion para extraer frames del video usando FFmpeg
async function extraerFrames(videoPath) {
  // Crear directorio de frames si no existe
  if (!fs.existsSync(FRAMES_DIR)) {
    fs.mkdirSync(FRAMES_DIR, { recursive: true })
  }

  // Limpiar frames anteriores
  fs.readdirSync(FRAMES_DIR).forEach((file) => {
    fs.unlinkSync(path.join(FRAMES_DIR, file))
  })

  // Patron de salida para los frames
  const outputPattern = path.join(FRAMES_DIR, "frame_%03d.jpg")

  // Comando FFmpeg: reducir resolucion y calidad para evitar sobrecargar Ollama
  const ffmpegArgs = [
    "-y",
    "-hide_banner",
    "-loglevel", "error",
    "-i", videoPath,
    "-vf", "fps=1/5,scale=320:-1",
    "-q:v", "5",
    outputPattern
  ]

  console.log("Extrayendo frames con FFmpeg...")
  // Ejecutar FFmpeg con timeout
  await execFile(FFMPEG, ffmpegArgs, { timeout: 180000 })

  // Devolver lista de paths de frames ordenados
  return fs
    .readdirSync(FRAMES_DIR)
    .filter((file) => /\.(jpe?g|png)$/i.test(file))
    .sort()
    .map((file) => path.join(FRAMES_DIR, file))
}

// Funcion para convertir imagen a base64
function imageToBase64(filePath) {
  const buffer = fs.readFileSync(filePath)
  return buffer.toString("base64")
}

// Funcion para analizar imagen con Ollama
async function analizarImagen(contexto, imagen) {
  try {
    // Convertir imagen a base64
    const imagenBase64 = imageToBase64(imagen.path)
    // Enviar peticion a Ollama
    const respuesta = await axios.post(
      OLLAMA_URL,
      {
        model: MODEL_NAME,
        messages: [
          {
            role: "user",
            content: `Analiza esta imagen. ${contexto ? `Contexto: ${contexto}` : ""}`.trim(),
            images: [imagenBase64]
          }
        ],
        stream: false
      },
      { timeout: 300000 }
    )

    // Extraer contenido de la respuesta
    const content = respuesta?.data?.message?.content || respuesta?.data?.output?.[0]?.content || JSON.stringify(respuesta.data)
    return { resultado: content }
  } catch (error) {
    console.error("Error al analizar imagen:", error)
    return { error: error?.response?.data || error?.message || "Error al procesar imagen con Ollama" }
  }
}

// Funcion para analizar video: descargar, extraer frames, analizar con IA
async function analizarVideo(videoUrl, contexto, fuentes) {
  try {
    console.log("Iniciando análisis de video:", videoUrl)
    // Descargar el video
    const videoPath = await descargarVideo(videoUrl)
    console.log("Video descargado en:", videoPath, "Existe:", fs.existsSync(videoPath))
    // Extraer frames
    const frames = await extraerFrames(videoPath)
    console.log("Frames extraídos:", frames.length)

    // Verificar que se extrajeron frames
    if (!frames.length) {
      return { error: "No se pudieron extraer frames del video" }
    }

    // Convertir el primer frame a base64
    const imagenes = frames.slice(0, 1).map(imageToBase64)
    // Prompt para analisis de fake news
    const promptText = `Eres un experto en verificación de noticias falsas. Analiza esta imagen y responde en español:
        1. ¿Qué muestra la imagen?
        2. ¿Hay señales de manipulación, edición o engaño?
        3. ¿Es probable que sea contenido falso o misleading?
        4. Veredicto final: VERDADERO, FALSO o DUDOSO`
    // Agregar contexto si existe
    const prompt = contexto
      ? `${promptText} Contexto adicional: ${contexto}`
      : promptText

    // Enviar a Ollama
    const respuesta = await axios.post(
      OLLAMA_URL,
      {
        model: MODEL_NAME,
        messages: [
          {
            role: "user",
            content: prompt,
            images: imagenes
          }
        ],
        stream: false
      },
      { timeout: 300000 }
    )

    // Extraer contenido
    const content = respuesta?.data?.message?.content || respuesta?.data?.output?.[0]?.content || JSON.stringify(respuesta.data)
    return { resultado: content }
  } catch (error) {
    console.error("Error al procesar video:", error)
    return { error: error?.response?.data || error?.message || "Error al procesar video con Ollama" }
  }
}

// Funcion principal para analizar: decide entre video o imagen
async function analizar(contexto, imagen, fuentes, videoUrl) {
  if (videoUrl) {
    return analizarVideo(videoUrl, contexto, fuentes)
  }

  if (imagen) {
    return analizarImagen(contexto, imagen)
  }

  return { error: "No se envió video ni imagen para analizar." }
}

// Exportar la funcion principal
module.exports = { analizar }