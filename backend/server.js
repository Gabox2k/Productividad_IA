const express = require("express")
const cors = require("cors")
const path = require("path")

const verificarRouter = require("./routes/verificar")
const bachesRouter = require("./routes/baches")

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => {
  console.log("GET / - Sirviendo index.html")
  res.sendFile(path.join(__dirname, "../frontend/index.html"))
})

// Servir archivos estáticos específicos (CSS, JS, etc.) pero NO reemplazar rutas GET
app.get(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/i, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", req.url))
})

app.use("/api", verificarRouter)
app.use("/api", bachesRouter)

const PORT = 5000
app.listen(PORT, () => console.log(`Servidor iniciado en http://localhost:${PORT}`))

process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err)
})

process.on('unhandledRejection', (reason) => {
  console.error('Promise rechazada:', reason)
})