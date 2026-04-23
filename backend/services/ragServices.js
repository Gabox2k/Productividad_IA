function construirContexto(pregunta, fuentes) {

    const fuentesTexto = Array.isArray(fuentes)
        ? fuentes.map((f, i) => `Fuente ${i + 1}: ${f}`).join("\n")
        : String(fuentes);

    return `
Eres un sistema de verificación de información.

Analiza la afirmación usando SOLO la información proporcionada.

AFIRMACIÓN:
${pregunta}

INFORMACIÓN DISPONIBLE:
${fuentesTexto}

⚠️ IMPORTANTE:
- Responde ÚNICAMENTE con un JSON válido
- NO incluyas texto antes ni después
- NO pongas el JSON dentro de comillas
- NO uses saltos de línea innecesarios
- NO devuelvas texto como string JSON dentro de otro campo

FORMATO OBLIGATORIO:

{
  "veracidad": numero entre 0 y 100,
  "motivo": "explicación clara basada en las fuentes",
  "fuentes": ["fuente1", "fuente2"]
}

REGLAS:
- No inventes información
- Usa solo las fuentes dadas
- Si no hay suficiente información, reduce la veracidad
`;
}

module.exports = { construirContexto };