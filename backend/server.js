const express = ("express")

const cors = require("cors")

const verificarRuta = require("./routes/verificar")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api", verificarRuta)

app.listen(3000, () => {
    console.log("Servidor iniciadoJ")
})

