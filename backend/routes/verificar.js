// Importar módulos necesarios
const express = require("express")
const multer = require("multer")

// Importar servicios
const { buscarInformacion } = require("../services/SearchServices")
const { construirContexto } = require("../services/ragServices")
const { analizar } = require("../services/aiService")

// Crear router de Express
const router = express.Router()
// Configurar multer para subir archivos a la carpeta 'actualizar/'
const upload = multer({ dest: "actualizar/" })

// Función para validar si una cadena es una URL válida
function isValidUrl(value) {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

// Funcion para determinar si una URL es de un video
function isVideoUrl(value) {
  if (!value || !isValidUrl(value)) return false
  // Verificar extensiones de video o dominios conocidos
  return /\.(mp4|mov|mkv|webm|avi|flv|wmv)(\?|$)/i.test(value) || /youtube\.com|youtu\.be|vimeo\.com|tiktok\.com/i.test(value)
}

// Ruta POST para verificar contenido
router.post("/verificar", upload.single("imagen"), async (req, res) => {
  try {
    console.log("=== NUEVA SOLICITUD ===")
    console.log("Body recibido:", req.body)
    console.log("Archivo recibido:", req.file ? req.file.filename : "ninguno")
    
    // Extraer y limpiar los datos del request
    const texto = (req.body.texto || "").trim()
    const videoUrlFromField = (req.body.videoUrl || "").trim()
    // Determinar la URL del video: del campo especifico o del texto si es una URL de video
    const videoUrl = videoUrlFromField || (isVideoUrl(texto) ? texto : "")
    const imagen = req.file

    console.log("Texto:", texto)
    console.log("Video URL:", videoUrl)
    console.log("Es video URL:", isVideoUrl(videoUrl))

    // Validar que se haya enviado al menos un tipo de contenido
    if (!texto && !imagen && !videoUrl) {
      return res.status(400).json({ error: "No se envió texto, imagen ni enlace de video" })
    }

    // Preparar texto para busqueda: vacio si hay video URL
    const textoParaBusqueda = videoUrl ? "" : texto
    // Buscar informacion si hay texto
    const fuentes = textoParaBusqueda ? await buscarInformacion(textoParaBusqueda) : []
    // Construir contexto si hay texto
    const contexto = textoParaBusqueda ? construirContexto(textoParaBusqueda, fuentes) : ""
    // Analizar con IA
    const resultado = await analizar(contexto, imagen, fuentes, videoUrl)

    // Si hay error en el analisis, devolver mensaje de error
    if (resultado.error) {
      return res.json({ mensaje: resultado.error })
    }

    // Devolver el resultado exitoso
    res.json(resultado)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Hubo un problema procesando la solicitud" })
  }
})

// Exportar el router
module.exports = router