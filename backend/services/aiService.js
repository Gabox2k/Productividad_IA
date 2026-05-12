const axios = require("axios")
const { promisify } = require("util")
const { exec: execCb } = require("child_process")
const fs = require("fs")
const path = require("path")

const exec = promisify(execCb)
const FRAMES_DIR = path.resolve(__dirname, "../frames")
const TEMP_DIR = path.resolve(__dirname, "../actualizar")
const OLLAMA_URL = "http://localhost:11434/api/chat"
const MODEL_NAME = "llava"
const FFMPEG = "C:\\Users\\sforz\\OneDrive\\Escritorio\\ffmpeg-8.1.1\\ffmpeg-8.1.1\\ffmpeg-8.1.1-essentials_build\\bin\\ffmpeg.exe"

async function descargarVideo(url) {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true })
  }

  // Limpiar archivos anteriores
  fs.readdirSync(TEMP_DIR).forEach((file) => {
    fs.unlinkSync(path.join(TEMP_DIR, file))
  })

  const outputTemplate = path.join(TEMP_DIR, "video.%(ext)s")
  const command = `yt-dlp --no-playlist -f "best[ext=mp4]/best" -o "${outputTemplate}" "${url}"`

  console.log("Ejecutando:", command)
  const { stdout, stderr } = await exec(command, { timeout: 300000})
  console.log("stdout:", stdout)
  console.log("stderr:", stderr)

  const archivos = fs.readdirSync(TEMP_DIR)
  console.log("Archivos en TEMP_DIR:", archivos)

  const videoArchivo = archivos.find(f => /^video\.(mp4|mkv|webm|mov)$/i.test(f))
  if (!videoArchivo) {
    throw new Error(`yt-dlp no generó archivo de video. Archivos encontrados: ${archivos.join(", ")}`)
  }

  return path.join(TEMP_DIR, videoArchivo)
}

async function extraerFrames(videoPath) {
  if (!fs.existsSync(FRAMES_DIR)) {
    fs.mkdirSync(FRAMES_DIR, { recursive: true })
  }

  fs.readdirSync(FRAMES_DIR).forEach((file) => {
    fs.unlinkSync(path.join(FRAMES_DIR, file))
  })

  const outputPattern = path.join(FRAMES_DIR, "frame_%03d.jpg")
  
  //Reducion de resolución y calidad para que Ollama no se cuelgue
  const command = `"${FFMPEG}" -y -hide_banner -loglevel error -i "${videoPath}" -vf "fps=1/5,scale=320:-1" -q:v 5 "${outputPattern}"`
  
  console.log("Extrayendo frames:", command)
  await exec(command, { timeout: 180000 })

  return fs
    .readdirSync(FRAMES_DIR)
    .filter((file) => /\.(jpe?g|png)$/i.test(file))
    .sort()
    .map((file) => path.join(FRAMES_DIR, file))
}

function imageToBase64(filePath) {
  const buffer = fs.readFileSync(filePath)
  return buffer.toString("base64")
}

async function analizarImagen(contexto, imagen) {
  try {
    const imagenBase64 = imageToBase64(imagen.path)
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

    const content = respuesta?.data?.message?.content || respuesta?.data?.output?.[0]?.content || JSON.stringify(respuesta.data)
    return { resultado: content }
  } catch (error) {
    console.error("Error al analizar imagen:", error)
    return { error: error?.response?.data || error?.message || "Error al procesar imagen con Ollama" }
  }
}

async function analizarVideo(videoUrl, contexto, fuentes) {
  try {
    console.log("Iniciando análisis de video:", videoUrl)
    const videoPath = await descargarVideo(videoUrl)
    console.log("Video descargado en:", videoPath, "Existe:", fs.existsSync(videoPath))
    const frames = await extraerFrames(videoPath)
    console.log("Frames extraídos:", frames.length)

    if (!frames.length) {
      return { error: "No se pudieron extraer frames del video" }
    }

    const imagenes = frames.slice(0, 1).map(imageToBase64)
    const promptText = `Eres un experto en verificación de noticias falsas. Analiza esta imagen y responde en español:
        1. ¿Qué muestra la imagen?
        2. ¿Hay señales de manipulación, edición o engaño?
        3. ¿Es probable que sea contenido falso o misleading?
        4. Veredicto final: VERDADERO, FALSO o DUDOSO`
    const prompt = contexto
      ? `${promptText} Contexto adicional: ${contexto}`
      : promptText

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

    const content = respuesta?.data?.message?.content || respuesta?.data?.output?.[0]?.content || JSON.stringify(respuesta.data)
    return { resultado: content }
  } catch (error) {
    console.error("Error al procesar video:", error)
    return { error: error?.response?.data || error?.message || "Error al procesar video con Ollama" }
  }
}

async function analizar(contexto, imagen, fuentes, videoUrl) {
  if (videoUrl) {
    return analizarVideo(videoUrl, contexto, fuentes)
  }

  if (imagen) {
    return analizarImagen(contexto, imagen)
  }

  return { error: "No se envió video ni imagen para analizar." }
}

module.exports = { analizar }