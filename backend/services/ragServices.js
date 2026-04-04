function construirContexto(pregunta, fuentes){

    return `
    Analiza la siguiente afirmación:

    "${pregunta}"

    Informacion encontrada:

    ${fuentes}  

    Determina:

    1 porcentaje de veracidad
    2 explicación
    3 fuentes recomendadas
    `
}

module.exports = { construirContexto }
