// Importar módulos necesarios
const express = require("express")
const cors = require("cors")
const path = require("path")

const verificarRouter = require("./routes/verificar")
const bachesRouter = require("./routes/baches")

const app = express()

// Middleware para permitir CORS, JSON y datos de formularios
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Ruta principal: servir el archivo index.html del frontend
app.get("/", (req, res) => {
  console.log("GET / - Sirviendo index.html")
  res.sendFile(path.join(__dirname, "../frontend/index.html"))
})

// Servir archivos estaticos especificos (CSS, JS, imágenes, etc.) desde el frontend
app.get(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/i, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", req.url))
})

// Usar las rutas de la API bajo /api
app.use("/api", verificarRouter)
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