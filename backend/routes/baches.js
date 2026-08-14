const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const crypto = require("crypto")
const { analizarBache } = require("../services/bacheService")
const { geocodificarDireccion } = require("../services/geoService")
const reportesRepo = require("../db/reportesRepo")
const { requireAuth, requireAdmin } = require("../middleware/auth")

const router = express.Router()

const VIDEO_EXTS = /\.(mp4|mov|mkv|webm|avi|flv|wmv)$/i
const IMAGE_EXTS = /\.(jpe?g|png|webp|gif|bmp)$/i
const UPLOADS_DIR = path.resolve(__dirname, "../uploads_baches")

const upload = multer({
  dest: "actualizar/",
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname || "")
    if (IMAGE_EXTS.test(ext) || VIDEO_EXTS.test(ext)) {
      cb(null, true)
    } else {
      cb(new Error("Formato de archivo no soportado. Subí una imagen o video."))
    }
  },
})
const uploadArchivo = upload.single("archivo")

function borrarSiExiste(rutaArchivo) {
  try {
    if (rutaArchivo && fs.existsSync(rutaArchivo)) fs.unlinkSync(rutaArchivo)
  } catch (err) {
    console.error("No se pudo borrar el archivo temporal:", err)
  }
}

function shapeReporte(row) {
  return {
    id: row.id,
    direccion: row.direccion,
    latitud: row.latitud,
    longitud: row.longitud,
    nivel_peligro: row.nivel_peligro,
    categoria: row.categoria,
    dimension_estimada: row.dimension_estimada,
    profundidad_estimada: row.profundidad_estimada,
    ubicacion_en_via: row.ubicacion_en_via,
    descripcion: row.descripcion,
    riesgos: row.riesgos,
    recomendacion: row.recomendacion,
    estado: row.estado,
    archivo_url: `/archivos-baches/${row.archivo_path}`,
    archivo_tipo: row.archivo_tipo,
    creado_en: row.creado_en,
    reparado_en: row.reparado_en,
    ...(row.usuario_nombre ? { usuario_nombre: row.usuario_nombre, usuario_email: row.usuario_email } : {}),
  }
}

router.post("/baches", requireAuth, (req, res) => {
  uploadArchivo(req, res, async (uploadErr) => {
    if (uploadErr) {
      const mensaje = uploadErr.code === "LIMIT_FILE_SIZE"
        ? "El archivo es demasiado grande (máximo 50MB)."
        : uploadErr.message || "No se pudo subir el archivo."
      return res.status(400).json({ error: mensaje })
    }

    const archivo = req.file
    try {
      if (!archivo) {
        return res.status(400).json({ error: "Debes subir una imagen o video del bache." })
      }

      await procesarReporte(req, res, archivo)
    } catch (err) {
      console.error("Error en /api/baches:", err)
      borrarSiExiste(archivo?.path)
      res.status(500).json({ error: "Error al analizar el bache: " + (err.message || "error desconocido") })
    }
  })
})

async function procesarReporte(req, res, archivo) {
  const direccion = (req.body.direccion || "").trim()
  if (!direccion) {
    borrarSiExiste(archivo.path)
    return res.status(400).json({ error: "La dirección es obligatoria." })
  }

  const ubicacion = await geocodificarDireccion(direccion)
  if (!ubicacion) {
    borrarSiExiste(archivo.path)
    return res.status(422).json({ error: "No se pudo ubicar esa dirección en el mapa. Verificala e intentá de nuevo." })
  }

  const nombreOriginal = archivo.originalname || ""
  const esVideo = VIDEO_EXTS.test(nombreOriginal) || archivo.mimetype.startsWith("video/")
  const rutaArchivo = path.resolve(archivo.path)

  console.log(`=== ANÁLISIS DE BACHE === archivo: ${nombreOriginal}, esVideo: ${esVideo}, direccion: ${direccion}`)

  const analisis = await analizarBache(rutaArchivo, esVideo)

  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  const nombrePersistido = `${crypto.randomUUID()}${path.extname(nombreOriginal)}`
  // OneDrive sincroniza esta carpeta y a veces bloquea el archivo apenas se
  // crea; copiar + borrar es más tolerante a eso que un rename atómico.
  fs.copyFileSync(rutaArchivo, path.join(UPLOADS_DIR, nombrePersistido))
  borrarSiExiste(rutaArchivo)

  const reporte = reportesRepo.crear({
    usuario_id: req.usuario.id,
    archivo_path: nombrePersistido,
    archivo_tipo: esVideo ? "video" : "imagen",
    direccion,
    latitud: ubicacion.lat,
    longitud: ubicacion.lon,
    nivel_peligro: analisis.nivel_peligro ?? null,
    categoria: analisis.categoria ?? null,
    dimension_estimada: analisis.dimension_estimada ?? null,
    profundidad_estimada: analisis.profundidad_estimada ?? null,
    ubicacion_en_via: analisis.ubicacion_en_via ?? null,
    descripcion: analisis.descripcion ?? null,
    riesgos: analisis.riesgos ?? null,
    recomendacion: analisis.recomendacion ?? null,
  })

  res.status(201).json(shapeReporte(reporte))
}

router.get("/baches/mis-reportes", requireAuth, (req, res) => {
  const reportes = reportesRepo.listarPorUsuario(req.usuario.id)
  res.json(reportes.map(shapeReporte))
})

router.get("/baches/todos", requireAdmin, (req, res) => {
  const reportes = reportesRepo.listarTodos()
  res.json(reportes.map(shapeReporte))
})

router.patch("/baches/:id/reparado", requireAdmin, (req, res) => {
  const reporte = reportesRepo.marcarReparado(req.params.id)
  if (!reporte) {
    return res.status(404).json({ error: "Reporte no encontrado." })
  }
  res.json({ id: reporte.id, estado: reporte.estado, reparado_en: reporte.reparado_en })
})

module.exports = router
