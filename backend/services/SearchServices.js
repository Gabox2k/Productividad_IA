// Función asíncrona para buscar información relacionada con el texto
async function buscarInformacion(texto) {
    try {
        // Extraer palabras clave del texto para optimizar la búsqueda
        const palabrasClaves = extraerPalabrasClaves(texto);
        const query = palabrasClaves.join(" ");

        // Lista de fuentes confiables para búsqueda de información
        const fuentes = [
            // Google Scholar para articulos academicos
            `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`,
            
            // Wikipedia para informacion general
            `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json`,
            
            // PubMed para temas cientificos y medicos
            `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query)}`,
            
            // Snopes para verificacion de hechos y mitos urbanos
            `https://www.snopes.com/search/?q=${encodeURIComponent(query)}`,
            
            // BBC News Mundo para noticias en español
            `https://www.bbc.com/mundo/search?q=${encodeURIComponent(query)}`,
            
            // Reuters Fact Check para verificacion de hechos
            `https://www.reuters.com/fact-check`,
            
            // AP Fact Check para verificacion de Associated Press
            `https://apnews.com/hub/ap-fact-check`
        ];

        // Devolver la lista de URLs de fuentes
        return fuentes;
    } catch (error) {
        console.error("Error buscando información:", error);
        // Devolver lista vacía en caso de error
        return [];
    }
}

// Funcion para extraer palabras clave del texto
function extraerPalabrasClaves(texto) {
    // Lista de palabras comunes en español a remover
    const palabrasComunes = ['el', 'la', 'de', 'que', 'y', 'es', 'en', 'a', 'un', 'una', 'los', 'las', 'del', 'al', 'por', 'con', 'este', 'ese', 'aquello'];
    
    // Procesar el texto: convertir a minusculas, remover puntuacion, dividir en palabras
    const palabras = texto
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Remover caracteres no alfanumericos
        .split(/\s+/) // Dividir por espacios
        .filter(p => p.length > 3 && !palabrasComunes.includes(p)) // Filtrar palabras relevantes
        .slice(0, 5); // Tomar las primeras 5 palabras clave
    
    // Devolver palabras clave o la primera palabra si no hay
    return palabras.length > 0 ? palabras : [texto.split(/\s+/)[0]];
}

module.exports = { buscarInformacion }