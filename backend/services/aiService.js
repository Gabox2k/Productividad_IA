const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

const API_KEY = process.env.ApiKey;

const MODELO = "google/gemma-4-31b-it:free";

async function analizar(prompt, imagen = null) {

  try {

    let messages;

    // 📸 SI HAY IMAGEN
    if (imagen) {

      const buffer = fs.readFileSync(imagen.path);
      const base64Image = buffer.toString("base64");

      messages = [{
        role: "user",
        content: [
          {
            type: "text",
            text: prompt
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }
        ]
      }];

    } else {
      messages = [{
        role: "user",
        content: prompt
      }];
    }

    const respuesta = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: MODELO,
        messages
      },
      {
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const contenido =
      respuesta.data?.choices?.[0]?.message?.content || "";

    try {
      return JSON.parse(contenido);
    } catch (e) {
      return {
        veracidad: null,
        motivo: contenido,
        fuentes: []
      };
    }

  } catch (err) {

    const status = err.response?.status;

    if (status === 401) {
      return { error: "Problema con la API Key" };
    }

    console.error("Error IA:", err.response?.data || err.message);

    return {
      error: "Error al procesar con OpenRouter"
    };
  }
}

module.exports = { analizar };