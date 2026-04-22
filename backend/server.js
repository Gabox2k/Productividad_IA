import express from "express"
import multer from "multer"
import fetch from "node-fetch"
import cors from "cors"

import verificarRouter from "./routes/verificar.js"
import { analizar } from "./services/aiService.js"


const app = express()

const actualizar = multer({ dest: "actualizar/"})

app.use(cors()) // El frontend accede 
app.use(express.json())

app.get("/", (req,res) =>{
    res.send("Servidor funcionando")
})

app.use("/api", verificarRouter)

const PORT = 5000
app.listen(PORT, () => console.log(`Servidor iniciado en http://localhost:${PORT}`))