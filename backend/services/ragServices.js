function construirContexto(pregunta, fuentes) {

    const fuentesTexto = Array.isArray(fuentes)
        ? fuentes.map((f, i) => `Fuente ${i + 1}: ${f}`).join("\n")
        : String(fuentes);

    return `
Eres un sistema de verificación de información.

Tu tarea es analizar si la afirmación es verdadera o falsa usando SOLO la información proporcionada.

AFIRMACIÓN:
${pregunta}

INFORMACIÓN DISPONIBLE:
${fuentesTexto}

RESPONDE SOLO en JSON con este formato exacto:

{
  "veracidad": 0-100,
  "motivo": "explicación clara basada en las fuentes",
  "fuentes": ["fuente1", "fuente2"]
}

REGLAS:
- No inventes información
- No uses texto fuera del JSON
- Si no hay suficiente información, baja la veracidad
`;
}

module.exports = { construirContexto }