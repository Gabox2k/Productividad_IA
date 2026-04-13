function construirContexto(pregunta, fuentes){

    return `
    Eres un verificador profesional de informacion.

    Analiza la siguiente informacion: 

    "${pregunta}"

    Informacion encontrada:

    ${fuentes}  

    Analiza la afirmacion usando la informacion proporcionada.

    Responde siempre en este formato exacto:

    Veracidad: (porcentaje del 0 al 1000)

    Motivo: 
    Explicacion clara basada en la informacion encontrada

    Fuentes:
    -Fuente 1:
    -Fuente 2:
    -Fuente 3: 
    `
}

module.exports = { construirContexto }
