const express = require("express")
const multer = require("multer")
const path = require("path")
const { analizarBache } = require("../services/bacheService")

const router = express.Router()
const upload = multer({ dest: "actualizar/" })

const VIDEO_EXTS = /\.(mp4|mov|mkv|webm|avi|flv|wmv)$/i

router.post("/baches", upload.single("archivo"), async (req, res) => {
  try {
    const archivo = req.file
    if (!archivo) {
      return res.status(400).json({ error: "Debes subir una imagen o video del bache." })
    }

    const nombreOriginal = archivo.originalname || ""
    const esVideo = VIDEO_EXTS.test(nombreOriginal) || archivo.mimetype.startsWith("video/")
    const rutaArchivo = path.resolve(archivo.path)

    console.log(`=== ANÁLISIS DE BACHE === archivo: ${nombreOriginal}, esVideo: ${esVideo}`)

    const resultado = await analizarBache(rutaArchivo, esVideo)
    res.json(resultado)
  } catch (err) {
    console.error("Error en /api/baches:", err)
    res.status(500).json({ error: "Error al analizar el bache: " + (err.message || "error desconocido") })
  }
})

module.exports = router
