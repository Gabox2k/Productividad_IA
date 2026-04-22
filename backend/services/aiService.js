const axios = require("axios");
const fs = require("fs");

async function analizar(prompt, imagen = null) {

  try {

    const modelo = imagen ? "llava" : "llama3";

    let messages;

    if (imagen) {

      const buffer = fs.readFileSync(imagen.path);
      const base64Image = buffer.toString("base64");

      messages = [{
        role: "user",
        content: prompt,
        images: [base64Image]
      }];

    } else {

      messages = [{
        role: "user",
        content: prompt
      }];
    }

    const respuesta = await axios.post(
      "http://localhost:11434/api/chat",
      {
        model: modelo,
        messages,
        stream: false
      }
    );

    const contenido =
      respuesta.data?.message?.content || "";

    return {
      veracidad: null,
      motivo: contenido,
      fuentes: []
    };

  } catch (err) {

    console.error("ERROR REAL:", err.response?.data || err.message);

    return {
      error: "Error al procesar con Ollama"
    };
  }
}

module.exports = { analizar };