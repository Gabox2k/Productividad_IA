const express = require("express")
const verificarRouter = require("./routes/verificar")
const cors = require("cors")

const app = express()
app.use(cors()) // El frontend accede 
app.use(express.json())

app.get("/", (req,res) =>{
    res.send("Servidor funcionando")
})

app.use("/api", verificarRouter)

const PORT = 3000
app.listen(PORT, () => console.log(`Servidor iniciado en http://localhost:${PORT}`))