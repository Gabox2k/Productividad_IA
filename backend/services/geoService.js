const axios = require("axios")

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

// Nominatim (OpenStreetMap) es gratuito y no requiere API key, pero exige un
// User-Agent identificable y un máximo de 1 solicitud por segundo.
async function geocodificarDireccion(direccion) {
  const respuesta = await axios.get(NOMINATIM_URL, {
    // countrycodes acota los resultados a Paraguay: sin esto, direcciones
    // ambiguas o cortas ("España") pueden geocodificarse en otro país.
    params: { q: direccion, format: "json", limit: 1, countrycodes: "py" },
    headers: { "User-Agent": "AnalizadorDeBaches/1.0 (uso local)" },
    timeout: 15000,
  })

  const resultado = respuesta.data?.[0]
  if (!resultado) return null

  return { lat: parseFloat(resultado.lat), lon: parseFloat(resultado.lon) }
}

module.exports = { geocodificarDireccion }
