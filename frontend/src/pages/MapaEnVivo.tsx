import { useEffect, useState } from "react"
import { AlertaProximidad } from "../components/AlertaProximidad"
import { ConfirmarReparacion, estaConfirmadoLocalmente } from "../components/ConfirmarReparacion"
import { ReportMap, type MapPoint } from "../components/ReportMap"
import { EstadoBadge, SeverityBadge } from "../components/SeverityBadge"
import { useUbicacionEnVivo } from "../hooks/useUbicacionEnVivo"
import { api } from "../services/api"
import type { Reporte } from "../types"
import { distanciaMetros } from "../utils/distancia"

const INTERVALO_ACTUALIZACION_MS = 18000

const COLOR_CATEGORIA: Record<string, string> = {
  BAJO: "#16a34a",
  MEDIO: "#f59e0b",
  ALTO: "#dc2626",
  "CRÍTICO": "#9333ea",
  CRITICO: "#9333ea",
}
const COLOR_REPARADO = "#a3a3a3"

function colorDe(reporte: Reporte) {
  if (reporte.estado === "reparado") return COLOR_REPARADO
  return COLOR_CATEGORIA[(reporte.categoria || "").toUpperCase()] || "#4a90e2"
}

export function MapaEnVivo() {
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const { ubicacion, error: errorUbicacion } = useUbicacionEnVivo()

  function cargar() {
    api
      .reportesPublicos()
      .then(setReportes)
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudieron cargar los reportes."))
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargar()
    const intervalo = setInterval(cargar, INTERVALO_ACTUALIZACION_MS)
    return () => clearInterval(intervalo)
  }, [])

  function refrescarTrasConfirmacion() {
    setTick((t) => t + 1)
    cargar()
  }

  const pendientes = reportes.filter((r) => r.estado === "pendiente")
  const reparadosPorConfirmar = reportes.filter((r) => r.estado === "reparado" && !estaConfirmadoLocalmente(r.id))

  const reportesOrdenados = ubicacion
    ? [...pendientes].sort(
        (a, b) =>
          distanciaMetros(ubicacion, { lat: a.latitud, lon: a.longitud }) -
          distanciaMetros(ubicacion, { lat: b.latitud, lon: b.longitud })
      )
    : pendientes

  const puntos: MapPoint[] = reportes.map((r) => ({
    id: r.id,
    lat: r.latitud,
    lon: r.longitud,
    color: colorDe(r),
    popup: (
      <div className="flex flex-col gap-1.5 text-sm">
        <strong className="text-neutral-900">{r.direccion}</strong>
        <SeverityBadge categoria={r.categoria} nivel={r.nivel_peligro} />
        {r.descripcion && <p className="text-neutral-600">{r.descripcion}</p>}
        {r.archivo_tipo === "video" ? (
          <video src={r.archivo_url} controls className="mt-1 max-w-[220px] rounded-lg" />
        ) : (
          <img src={r.archivo_url} alt="Bache" className="mt-1 max-w-[220px] rounded-lg" />
        )}
        <EstadoBadge estado={r.estado} />
      </div>
    ),
  }))

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-neutral-900">Mapa en Vivo</h1>
        <p className="mt-1 text-neutral-500">
          {pendientes.length} bache(s) pendiente(s) reportados por la comunidad cerca tuyo.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-2">
        <AlertaProximidad ubicacion={ubicacion} reportes={reportes} />
        {errorUbicacion && <p className="text-sm text-neutral-500">📍 {errorUbicacion}</p>}
      </div>

      <div className="grid flex-1 grid-cols-1 gap-6 overflow-hidden lg:grid-cols-[1fr_360px]">
        <div className="min-h-[420px] overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {!cargando && <ReportMap puntos={puntos} miUbicacion={ubicacion} centrarEnMiUbicacion />}
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto">
          {reparadosPorConfirmar.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <div className="border-b border-neutral-200 px-5 py-4">
                <h2 className="text-sm font-semibold text-neutral-900">¿Se solucionaron estos baches?</h2>
              </div>
              <div className="flex flex-col gap-3 p-4">
                {reparadosPorConfirmar.map((r) => (
                  <div key={`${r.id}-${tick}`}>
                    <p className="mb-2 text-sm text-neutral-900">{r.direccion}</p>
                    <ConfirmarReparacion id={r.id} onCambio={refrescarTrasConfirmacion} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-5 py-4">
              <h2 className="text-sm font-semibold text-neutral-900">Baches cercanos</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {cargando ? (
                <p className="p-5 text-sm text-neutral-500">Cargando…</p>
              ) : error ? (
                <p className="p-5 text-sm text-red-600">{error}</p>
              ) : reportesOrdenados.length === 0 ? (
                <p className="p-5 text-sm text-neutral-500">No hay baches pendientes reportados todavía.</p>
              ) : (
                reportesOrdenados.map((r) => (
                  <div key={r.id} className="border-b border-neutral-100 p-4 last:border-0">
                    <strong className="text-sm text-neutral-900">{r.direccion}</strong>
                    <p className="my-2">
                      <SeverityBadge categoria={r.categoria} nivel={r.nivel_peligro} />
                    </p>
                    {ubicacion && (
                      <p className="text-xs text-neutral-500">
                        A {Math.round(distanciaMetros(ubicacion, { lat: r.latitud, lon: r.longitud }))} m de tu posición
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
