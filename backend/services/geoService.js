const axios = require("axios")

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

// Nominatim (OpenStreetMap) es gratuito y no requiere API key, pero exige un
// User-Agent identificable y un máximo de 1 solicitud por segundo.
async function geocodificarDireccion(direccion) {
  const respuesta = await axios.get(NOMINATIM_URL, {
    params: { q: direccion, format: "json", limit: 1 },
    headers: { "User-Agent": "AnalizadorDeBaches/1.0 (uso local)" },
    timeout: 15000,
  })

  const resultado = respuesta.data?.[0]
  if (!resultado) return null

  return { lat: parseFloat(resultado.lat), lon: parseFloat(resultado.lon) }
}

module.exports = { geocodificarDireccion }
