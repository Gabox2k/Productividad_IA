async function buscarInformacion(texto) {
    try {
        // Limitar el texto para las busquedas 
        const palabrasClaves = extraerPalabrasClaves(texto);
        const query = palabrasClaves.join(" ");

        // Fuentes confiables basados en el tema 
        const fuentes = [
            // Google Scholar
            `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`,
            
            // Wikipedia
            `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json`,
            
            // PubMed para temas científicos
            `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query)}`,
            
            // Snopes para verificación de hechos
            `https://www.snopes.com/search/?q=${encodeURIComponent(query)}`,
            
            // BBC News Mundo
            `https://www.bbc.com/mundo/search?q=${encodeURIComponent(query)}`,
            
            // Reuters Fact Check
            `https://www.reuters.com/fact-check`,
            
            // AP Fact Check
            `https://apnews.com/hub/ap-fact-check`
        ];

        return fuentes;
    } catch (error) {
        console.error("Error buscando información:", error);
        return [];
    }
}

function extraerPalabrasClaves(texto) {
    // Remover palabras comunes y extraer palabras clave
    const palabrasComunes = ['el', 'la', 'de', 'que', 'y', 'es', 'en', 'a', 'un', 'una', 'los', 'las', 'del', 'al', 'por', 'con', 'este', 'ese', 'aquello'];
    
    const palabras = texto
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(p => p.length > 3 && !palabrasComunes.includes(p))
        .slice(0, 5); // toma las primeras 5 palabras clave
    
    return palabras.length > 0 ? palabras : [texto.split(/\s+/)[0]];
}

module.exports = { buscarInformacion }