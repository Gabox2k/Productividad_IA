const axios = require("axios")

const Api =  "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"

async function analizar(prompt) {


    const respuesta = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
        model: "meta-llama/llama-3.3-70b-instruct:free",
        messages: [{role: "user", content: prompt}]

    },{Headers: {Authorization: `Bearer ${Api}`, "Content-Type" : "application/json"}})

    return respuesta.data
}

module.exports = {analizar}
