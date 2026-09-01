import { useEffect, useState } from "react"
import type { Reporte } from "../types"
import { distanciaMetros, type Coordenadas } from "../utils/distancia"

const RADIO_ALERTA_METROS = 300

export function AlertaProximidad({ ubicacion, reportes }: { ubicacion: Coordenadas | null; reportes: Reporte[] }) {
  const [descartadoId, setDescartadoId] = useState<number | null>(null)

  const cercano = ubicacion
    ? reportes
        .filter((r) => r.estado === "pendiente")
        .map((r) => ({ reporte: r, distancia: distanciaMetros(ubicacion, { lat: r.latitud, lon: r.longitud }) }))
        .filter((x) => x.distancia <= RADIO_ALERTA_METROS)
        .sort((a, b) => a.distancia - b.distancia)[0]
    : undefined

  useEffect(() => {
    // Si ya no hay ningún bache pendiente cerca, se olvida el descarte para
    // poder volver a alertar la próxima vez que el usuario se acerque a uno.
    if (!cercano) setDescartadoId(null)
  }, [cercano])

  if (!cercano || cercano.reporte.id === descartadoId) return null

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
      <span>
        ⚠️ Bache a {Math.round(cercano.distancia)} m — {cercano.reporte.direccion}
      </span>
      <button
        onClick={() => setDescartadoId(cercano.reporte.id)}
        className="shrink-0 font-semibold underline hover:text-amber-950"
      >
        Descartar
      </button>
    </div>
  )
}
