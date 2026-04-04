const express = require("express")

const {buscarInformacion} = require("../services/SearchServices")
const {construirContexto} = require("../services/ragServices")
const {analizar} = require("../services/aiService")

const router = express.Router()

router.post("/verificar", async (req, res) =>{

    const texto = req.body.texto
    const fuentes = await buscarInformacion(texto)
    const contexto = construirContexto(texto, fuentes)
    const resultado = await analizar(contexto)

    res.json(resultado)
})

module.exports = router