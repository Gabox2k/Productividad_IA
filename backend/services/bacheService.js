const axios = require("axios")
const { promisify } = require("util")
const { execFile: execFileCb } = require("child_process")
const fs = require("fs")
const path = require("path")

const execFile = promisify(execFileCb)
const FRAMES_DIR = path.resolve(__dirname, "../frames_baches")
const TEMP_DIR = path.resolve(__dirname, "../actualizar")
const OLLAMA_URL = "http://localhost:11434/api/chat"
const MODEL_NAME = "llava"
const FFMPEG = "C:\\Users\\sforz\\OneDrive\\Escritorio\\Tesis\\ffmpeg-8.1.1\\ffmpeg-8.1.1\\ffmpeg-8.1.1-essentials_build\\bin\\ffmpeg.exe"

function imageToBase64(filePath) {
  return fs.readFileSync(filePath).toString("base64")
}

async function extraerFramesBache(videoPath) {
  if (!fs.existsSync(FRAMES_DIR)) {
    fs.mkdirSync(FRAMES_DIR, { recursive: true })
  }
  fs.readdirSync(FRAMES_DIR).forEach(f => fs.unlinkSync(path.join(FRAMES_DIR, f)))

  const outputPattern = path.join(FRAMES_DIR, "frame_%03d.jpg")
  const ffmpegArgs = [
    "-y", "-hide_banner", "-loglevel", "error",
    "-i", videoPath,
    "-vf", "fps=1/3,scale=640:-1",
    "-q:v", "3",
    outputPattern
  ]

  await execFile(FFMPEG, ffmpegArgs, { timeout: 180000 })

  return fs.readdirSync(FRAMES_DIR)
    .filter(f => /\.(jpe?g|png)$/i.test(f))
    .sort()
    .map(f => path.join(FRAMES_DIR, f))
}

const PROMPT_DESCRIPCION = `You are analyzing a road pothole image. Answer ONLY these 4 questions using exactly the options listed:

SIZE: tiny (fits in a palm) / small (shoe-sized) / medium (backpack-sized) / large (bigger than a backpack)
DEPTH: barely visible / shallow (looks less than 3cm) / moderate (3-8cm deep) / deep (over 8cm, like a bowl)
LOCATION: road edge or shoulder / side lane / center of traffic lane
DAMAGE: isolated small crack / crumbled edges / large broken surface area

Reply strictly in this format (no extra text):
SIZE: [answer]
DEPTH: [answer]
LOCATION: [answer]
DAMAGE: [answer]
DESCRIPTION: [one sentence describing what you see in Spanish]`

function calcularPeligro(respuestaIA) {
  const t = respuestaIA.toLowerCase()

  let puntos = 0

  // SIZE (0-3)
  if (t.includes("large") || t.includes("bigger than a backpack")) puntos += 3
  else if (t.includes("medium") || t.includes("backpack-sized")) puntos += 2
  else if (t.includes("small") || t.includes("shoe-sized")) puntos += 1

  // DEPTH (0-3)
  if (t.includes("deep") || t.includes("like a bowl")) puntos += 3
  else if (t.includes("moderate")) puntos += 2
  else if (t.includes("shallow")) puntos += 1

  // LOCATION (0-3)
  if (t.includes("center of traffic")) puntos += 3
  else if (t.includes("side lane")) puntos += 2
  else if (t.includes("edge") || t.includes("shoulder")) puntos += 1

  // DAMAGE (0-2)
  if (t.includes("large broken")) puntos += 2
  else if (t.includes("crumbled")) puntos += 1

  // Normalizar a escala 1-10 (máximo posible = 11)
  const nivel = Math.max(1, Math.min(10, Math.round((puntos / 11) * 10)))

  let categoria
  if (nivel <= 3) categoria = "BAJO"
  else if (nivel <= 5) categoria = "MEDIO"
  else if (nivel <= 7) categoria = "ALTO"
  else categoria = "CRÍTICO"

  return { nivel_peligro: nivel, categoria }
}

function extraerCampo(texto, campo) {
  const match = texto.match(new RegExp(`${campo}:\\s*(.+)`, "i"))
  return match ? match[1].trim() : null
}

function mapearRiesgo(nivel) {
  if (nivel <= 3) return "Riesgo mínimo. Puede causar incomodidad al manejar."
  if (nivel <= 5) return "Riesgo moderado. Puede dañar neumáticos o suspensión en vehículos pequeños."
  if (nivel <= 7) return "Riesgo alto. Puede causar daños graves a vehículos y peligro para motos y ciclistas."
  return "Riesgo crítico. Peligro inminente de accidente grave, especialmente para motos."
}

function mapearRecomendacion(nivel) {
  if (nivel <= 3) return "Mantenimiento preventivo. Puede repararse en el próximo plan de obra vial."
  if (nivel <= 5) return "Reparación en los próximos 30 días. Señalizar el área mientras tanto."
  if (nivel <= 7) return "Reparación urgente en menos de 7 días. Señalizar de inmediato."
  return "Reparación inmediata. Señalizar y cerrar el carril hasta reparar."
}

async function analizarImagenBache(imagePath) {
  const imagenBase64 = imageToBase64(imagePath)

  const respuesta = await axios.post(
    OLLAMA_URL,
    {
      model: MODEL_NAME,
      messages: [{ role: "user", content: PROMPT_DESCRIPCION, images: [imagenBase64] }],
      stream: false
    },
    { timeout: 300000 }
  )

  const texto = respuesta?.data?.message?.content || ""
  console.log("Respuesta llava:", texto)

  const { nivel_peligro, categoria } = calcularPeligro(texto)

  return {
    nivel_peligro,
    categoria,
    dimension_estimada: extraerCampo(texto, "SIZE"),
    profundidad_estimada: extraerCampo(texto, "DEPTH"),
    ubicacion_en_via: extraerCampo(texto, "LOCATION"),
    descripcion: extraerCampo(texto, "DESCRIPTION") || texto.split("\n").pop()?.trim(),
    riesgos: mapearRiesgo(nivel_peligro),
    recomendacion: mapearRecomendacion(nivel_peligro),
  }
}

async function analizarVideoBache(videoPath) {
  const frames = await extraerFramesBache(videoPath)
  if (!frames.length) throw new Error("No se pudieron extraer frames del video")

  // Analizar hasta 3 frames distribuidos para tener mejor cobertura
  const indices = [0, Math.floor(frames.length / 2), frames.length - 1].filter(
    (i, pos, arr) => arr.indexOf(i) === pos && frames[i]
  )
  const framesMuestra = indices.map(i => frames[i])

  const resultados = []
  for (const frame of framesMuestra) {
    const r = await analizarImagenBache(frame)
    resultados.push(r)
  }

  // Retornar el análisis con el mayor nivel de peligro
  resultados.sort((a, b) => (b.nivel_peligro || 0) - (a.nivel_peligro || 0))
  return { ...resultados[0], total_frames_analizados: resultados.length }
}

async function analizarBache(archivo, esVideo) {
  try {
    if (esVideo) {
      return await analizarVideoBache(archivo)
    }
    return await analizarImagenBache(archivo)
  } catch (error) {
    console.error("Error en analizarBache:", error)
    throw error
  }
}

module.exports = { analizarBache }
