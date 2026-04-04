const axios = require("axios")

const Api =  process.env.Api

async function analizar(prompt) {

    try{
         const respuesta = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
        model: "meta-llama/llama-3.3-70b-instruct:free",
        messages: [{role: "user", content: prompt}]

    },{headers: {Authorization: `Bearer ${Api}`, "Content-Type" : "application/json"}})
        return respuesta.data,choices[0].messages.content

    } catch (err) {
        if (err.response && err.response.status === 429) {
            return "Limite de solicitudes alcanzado"
        }
    }
   

    
}

module.exports = {analizar}
