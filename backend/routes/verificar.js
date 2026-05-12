const express = require("express")
const multer = require("multer")

const { buscarInformacion } = require("../services/SearchServices")
const { construirContexto } = require("../services/ragServices")
const { analizar } = require("../services/aiService")

const router = express.Router()
const upload = multer({ dest: "actualizar/" })

function isValidUrl(value) {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

function isVideoUrl(value) {
  if (!value || !isValidUrl(value)) return false
  return /\.(mp4|mov|mkv|webm|avi|flv|wmv)(\?|$)/i.test(value) || /youtube\.com|youtu\.be|vimeo\.com|tiktok\.com/i.test(value)
}

router.post("/verificar", upload.single("imagen"), async (req, res) => {
  try {
    console.log("=== NUEVA SOLICITUD ===")
    console.log("Body recibido:", req.body)
    console.log("Archivo recibido:", req.file ? req.file.filename : "ninguno")
    
    const texto = (req.body.texto || "").trim()
    const videoUrlFromField = (req.body.videoUrl || "").trim()
    const videoUrl = videoUrlFromField || (isVideoUrl(texto) ? texto : "")
    const imagen = req.file

    console.log("Texto:", texto)
    console.log("Video URL:", videoUrl)
    console.log("Es video URL:", isVideoUrl(videoUrl))

    if (!texto && !imagen && !videoUrl) {
      return res.status(400).json({ error: "No se envió texto, imagen ni enlace de video" })
    }

    const textoParaBusqueda = videoUrl ? "" : texto
    const fuentes = textoParaBusqueda ? await buscarInformacion(textoParaBusqueda) : []
    const contexto = textoParaBusqueda ? construirContexto(textoParaBusqueda, fuentes) : ""
    const resultado = await analizar(contexto, imagen, fuentes, videoUrl)

    if (resultado.error) {
      return res.json({ mensaje: resultado.error })
    }

    res.json(resultado)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Hubo un problema procesando la solicitud" })
  }
})

module.exports = router