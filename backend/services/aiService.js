// aiService.js
const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.ApiKey;

// Lista de modelos 
const MODELOS = [
  "google/gemma-3-4b:free",                
  "meta-llama/llama-3.2-3b-instruct:free", 
  "google/gemma-3-27b:free",               
  "meta-llama/hermes-3-405b-instruct:free" 
];

// Funcion para llamar a la IA
async function analizar(prompt) {
  for (let i = 0; i < MODELOS.length; i++) {
    try {
      const respuesta = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: MODELOS[i],
          messages: [{ role: "user", content: prompt }]
        },
        {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const contenido = respuesta.data.choices?.[0]?.message?.content || "";
      return parsearRespuesta(contenido);

    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;

      // Rate limit, espera y probar siguiente modelo
      if (status === 429) {
        console.warn(`Modelo ocupado: ${MODELOS[i]}, probando siguiente...`);
        await esperar(2000); // 2 segundos antes de probar siguiente modelo
        continue;
      }

      // API key invalida
      if (status === 401) {
        return { error: "Problema con la API Key" };
      }

      // Modelo invalido o error general
      console.error("Error en la API con modelo", MODELOS[i], ":", data || err.message);
      continue;
    }
  }

  return { error: "Todos los modelos estan ocupados o fallaron" };
}

// Función para parsear respuesta de la IA
function parsearRespuesta(texto) {
  const veracidadMatch = texto.match(/Veracidad[:|-]\s*(\d+%)/i);
  const motivoMatch = texto.match(/Motivo[:|-]\s*([\s\S]*?)Fuentes[:|-]/i);
  const fuentesMatch = texto.match(/Fuentes[:|-]\s*([\s\S]*)/i);

  return {
    veracidad: veracidadMatch ? veracidadMatch[1] : null,
    motivo: motivoMatch ? motivoMatch[1].trim() : null,
    fuentes: fuentesMatch
      ? fuentesMatch[1].split(/\n|,|;/).map(f => f.trim()).filter(Boolean)
      : []
  };
}

// Funcion auxiliar para delay
function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { analizar };