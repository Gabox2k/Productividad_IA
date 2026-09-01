import L from "leaflet"
import { useEffect, useMemo, useRef, type ReactNode } from "react"
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet"
import type { Coordenadas } from "../utils/distancia"

export interface MapPoint {
  id: string | number
  lat: number
  lon: number
  color?: string
  popup?: ReactNode
}

const ASUNCION: [number, number] = [-25.2637, -57.5759]
const COLOR_DEFAULT = "#f59e0b"
const COLOR_MI_UBICACION = "#2563eb"

function AjustarVista({
  puntos,
  miUbicacion,
  centrarEnMiUbicacion,
}: {
  puntos: [number, number][]
  miUbicacion?: Coordenadas | null
  centrarEnMiUbicacion?: boolean
}) {
  const mapa = useMap()
  const yaAjustado = useRef(false)

  useEffect(() => {
    if (yaAjustado.current) return

    if (centrarEnMiUbicacion && miUbicacion) {
      mapa.setView([miUbicacion.lat, miUbicacion.lon], 16)
      yaAjustado.current = true
      return
    }

    const todos: [number, number][] = miUbicacion ? [...puntos, [miUbicacion.lat, miUbicacion.lon]] : puntos
    if (todos.length === 0) return

    if (todos.length === 1) {
      mapa.setView(todos[0], 15)
    } else {
      mapa.fitBounds(L.latLngBounds(todos), { padding: [30, 30], maxZoom: 15 })
    }
    yaAjustado.current = true
    // El ajuste solo debe ocurrir una vez, al llegar los primeros datos: si
    // corriera en cada actualización (polling, GPS en vivo), el mapa
    // saltaría solo mientras el usuario lo está mirando o navegando.
  }, [mapa, puntos, miUbicacion, centrarEnMiUbicacion])

  return null
}

export function ReportMap({
  puntos,
  miUbicacion,
  centrarEnMiUbicacion,
}: {
  puntos: MapPoint[]
  miUbicacion?: Coordenadas | null
  centrarEnMiUbicacion?: boolean
}) {
  const coords = useMemo<[number, number][]>(() => puntos.map((p) => [p.lat, p.lon]), [puntos])

  return (
    <MapContainer center={ASUNCION} zoom={12} className="h-full w-full">
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <AjustarVista puntos={coords} miUbicacion={miUbicacion} centrarEnMiUbicacion={centrarEnMiUbicacion} />
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
      {miUbicacion && (
        <CircleMarker
          center={[miUbicacion.lat, miUbicacion.lon]}
          radius={8}
          pathOptions={{ color: "#ffffff", fillColor: COLOR_MI_UBICACION, fillOpacity: 1, weight: 3 }}
        >
          <Popup minWidth={120}>Tu ubicación</Popup>
        </CircleMarker>
      )}
    </MapContainer>
  )
}
