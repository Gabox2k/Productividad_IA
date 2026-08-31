import L from "leaflet"
import { useEffect, useMemo, type ReactNode } from "react"
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet"

export interface MapPoint {
  id: string | number
  lat: number
  lon: number
  color?: string
  popup?: ReactNode
}

const ASUNCION: [number, number] = [-25.2637, -57.5759]
const COLOR_DEFAULT = "#f59e0b"

function AjustarVista({ puntos }: { puntos: [number, number][] }) {
  const mapa = useMap()
  useEffect(() => {
    if (puntos.length === 0) return
    if (puntos.length === 1) {
      mapa.setView(puntos[0], 15)
    } else {
      mapa.fitBounds(L.latLngBounds(puntos), { padding: [30, 30], maxZoom: 15 })
    }
  }, [mapa, puntos])
  return null
}

export function ReportMap({ puntos }: { puntos: MapPoint[] }) {
  const coords = useMemo<[number, number][]>(() => puntos.map((p) => [p.lat, p.lon]), [puntos])

  return (
    <MapContainer center={ASUNCION} zoom={12} className="h-full w-full">
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <AjustarVista puntos={coords} />
      {puntos.map((p) => (
        <CircleMarker
          key={p.id}
          center={[p.lat, p.lon]}
          radius={9}
          pathOptions={{ color: p.color || COLOR_DEFAULT, fillColor: p.color || COLOR_DEFAULT, fillOpacity: 0.8, weight: 2 }}
        >
          {p.popup && <Popup minWidth={220}>{p.popup}</Popup>}
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
