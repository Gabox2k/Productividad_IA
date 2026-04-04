require("dotenv").config()

const express = require("express")

const cors = require("cors")

const verificarRuta = require("./routes/verificar")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api", verificarRuta)

app.get("/", (req, res) =>{
    res.send("Servidor RAG funcionando")
})

app.listen(3000, () => {
    console.log("Servidor iniciado en el puerto http://localhost:3000")
})

