// Importar módulos necesarios
require("dotenv").config()
const crypto = require("crypto")
const express = require("express")
const cors = require("cors")
const path = require("path")

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = crypto.randomBytes(32).toString("hex")
  console.warn("JWT_SECRET no definido en .env: se generó uno temporal. Las sesiones se invalidarán al reiniciar el servidor. Definí JWT_SECRET en backend/.env para que persistan.")
}

const authRouter = require("./routes/auth")
const bachesRouter = require("./routes/baches")

const app = express()

// Middleware para permitir CORS, JSON y datos de formularios
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Servir el frontend (html, css, js) de forma estática, incluyendo index.html en "/"
app.use(express.static(path.join(__dirname, "../frontend")))

// Servir las fotos/videos persistidos de los reportes de baches
app.use("/archivos-baches", express.static(path.join(__dirname, "uploads_baches")))

// Usar las rutas de la API bajo /api
app.use("/api", authRouter)
app.use("/api", bachesRouter)

// Puerto del servidor
const PORT = 5000
// Iniciar el servidor
app.listen(PORT, () => console.log(`Servidor iniciado en http://localhost:${PORT}`))

// Manejar excepciones no capturadas
process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err)
})

// Manejar promesas rechazadas no manejadas
process.on('unhandledRejection', (reason) => {
  console.error('Promise rechazada:', reason)
})
