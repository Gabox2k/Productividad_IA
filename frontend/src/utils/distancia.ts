export interface Coordenadas {
  lat: number
  lon: number
}

// Fórmula del semiverseno (haversine): distancia en metros entre dos
// coordenadas GPS sobre la superficie terrestre.
export function distanciaMetros(a: Coordenadas, b: Coordenadas): number {
  const R = 6371000
  const rad = (grados: number) => (grados * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLon = rad(b.lon - a.lon)
  const lat1 = rad(a.lat)
  const lat2 = rad(b.lat)

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
