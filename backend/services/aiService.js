const axios = require("axios")
require("dotenv").config()

const Key = process.env.ApiKey

async function analizar(prompt) {
    try {
        const respuesta = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "meta-llama/llama-3.3-70b-instruct:free",
                messages: [{ role: "user", content: prompt }]
            },
            {
                headers: {
                    "Authorization": `Bearer ${Key}`,
                    "Content-Type": "application/json"
                }
            }
        )

        return respuesta.data
    } catch (err) {
        console.error("Error llamando a OpenRouter:", err.response?.data || err.message)
        throw new Error("No se pudo obtener respuesta de la IA")
    }
}

module.exports = { analizar }