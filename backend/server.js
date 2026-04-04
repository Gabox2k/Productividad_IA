const express = require("express")
const verificarRouter = require("./routes/verificar")
const cors = require("cors")

const app = express()
app.use(cors()) // permite que tu frontend en otro puerto acceda
app.use(express.json())

app.use("/api", verificarRouter)

const PORT = 3000
app.listen(PORT, () => console.log(`Servidor iniciado en http://localhost:${PORT}`))