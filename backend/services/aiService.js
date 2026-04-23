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

    const contenido = respuesta.data?.message?.content || "";

    let veracidad = null;
    let motivo = contenido;
    let fuentes = [];

    try {
      const limpio = contenido
        .replace(/\\n/g, " ")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\")
        .trim();

      const parsed = JSON.parse(limpio);

      if (typeof parsed === "object" && parsed !== null) {
        veracidad = parsed.veracidad ?? parsed.veracity ?? null;
        motivo = parsed.motivo ?? parsed.reason ?? parsed.motivation ?? contenido;
        fuentes = parsed.fuentes ?? parsed.sources ?? parsed.fuente ?? [];
      }
    } catch (e) {
      motivo = contenido
        .replace(/\\n/g, " ")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\")
        .replace(/\s+/g, " ")
        .trim();
    }

    if (!Array.isArray(fuentes)) {
      fuentes = fuentes ? [fuentes] : [];
    }

    return {
      veracidad,
      motivo,
      fuentes
    };

  } catch (err) {

    console.error("ERROR REAL:", err.response?.data || err.message);

    return {
      error: "Error al procesar con Ollama"
    };
  }
}

module.exports = { analizar };