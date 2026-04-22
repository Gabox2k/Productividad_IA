const express = require("express")
const multer = require("multer")

const { buscarInformacion } = require("../services/SearchServices")
const { construirContexto } = require("../services/ragServices")
const { analizar } = require("../services/aiService")

const router = express.Router()

const upload = multer({ dest: "actualizar/" })

router.post("/verificar", upload.single("imagen"), async (req, res) => {
    try {
        const texto = req.body.texto
        const imagen = req.file


        if (!texto && !imagen) return res.status(400).json({ error: "No se envió texto ni la imagen" })

        const fuentes = texto ? await buscarInformacion(texto) : []
        const contexto = texto ? construirContexto(texto, fuentes) : ""
        const resultado = await analizar(contexto, imagen)

        if (resultado.error){
            return res.json({ mensaje: resultado.error})
        }

        res.json(resultado) // devuelve JSON limpio al frontend
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Hubo un problema procesando la solicitud" })
    }
})

module.exports = router