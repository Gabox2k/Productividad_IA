const express = require("express")

const {buscaInformacion} = require("../services/SearchServices")
const {construirContexto} = require("../services/ragServices")
const {analizar} = require("../services/aiService")

const router = express.Router()

router.post("/verficar", async (req, res) =>{

    const texto = req.body.texto
    const fuentes = await buscaInformacion(texto)
    const contexto = construirContexto(texto, fuentes)
    const resultado = await analizar(contexto)

    res.json(resultado)
})

module.exports = router