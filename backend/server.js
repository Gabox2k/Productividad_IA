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

app.post("/api/verificar", actualizar.single("imagen"), async (req, res) => {
    
    const texto = req.body.texto || ""
    const imagen = req.file || null

    console.log("texto:", texto)
    console.log("imagen:", imagen)

    try {
        const resultado = imagen
            ? await analizar(texto, imagen)
            : await analizar(texto)
        
        return res.json({
            resultado
        })
    } catch(err){
        console.error(err)
        res.json({resultado: "Error en la Ia "})
    }
 

  
})

app.use("/api", verificarRouter)

const PORT = 3000
app.listen(PORT, () => console.log(`Servidor iniciado en http://localhost:${PORT}`))