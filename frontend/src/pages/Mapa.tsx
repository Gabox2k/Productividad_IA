import { useEffect, useState } from "react"
import { AlertaProximidad } from "../components/AlertaProximidad"
import { EstadoBadge, SeverityBadge } from "../components/SeverityBadge"
import { ReportMap, type MapPoint } from "../components/ReportMap"
import { useAuth } from "../context/AuthContext"
import { useUbicacionEnVivo } from "../hooks/useUbicacionEnVivo"
import { api } from "../services/api"
import type { Reporte } from "../types"

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

export function Mapa() {
  const { usuario } = useAuth()
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actualizandoId, setActualizandoId] = useState<number | null>(null)
  const { ubicacion, error: errorUbicacion } = useUbicacionEnVivo()

  function cargar() {
    api
      .todosLosReportes()
      .then(setReportes)
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudieron cargar los reportes."))
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargar()
    const intervalo = setInterval(cargar, INTERVALO_ACTUALIZACION_MS)
    return () => clearInterval(intervalo)
  }, [])

  async function marcarReparado(id: number) {
    setActualizandoId(id)
    try {
      await api.marcarReparado(id)
      cargar()
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo marcar como reparado.")
    } finally {
      setActualizandoId(null)
    }
  }

  const pendientes = reportes.filter((r) => r.estado === "pendiente").length

  const puntos: MapPoint[] = reportes.map((r) => ({
    id: r.id,
    lat: r.latitud,
    lon: r.longitud,
    color: colorDe(r),
    popup: (
      <div className="flex flex-col gap-1.5 text-sm">
        <strong className="text-neutral-900">{r.direccion}</strong>
        <span className="text-neutral-500">Reportado por {r.usuario_nombre}</span>
        <SeverityBadge categoria={r.categoria} nivel={r.nivel_peligro} />
        {r.descripcion && <p className="text-neutral-600">{r.descripcion}</p>}
        {r.archivo_tipo === "video" ? (
          <video src={r.archivo_url} controls className="mt-1 max-w-[220px] rounded-lg" />
        ) : (
          <img src={r.archivo_url} alt="Bache" className="mt-1 max-w-[220px] rounded-lg" />
        )}
        {r.estado === "reparado" ? (
          <EstadoBadge estado="reparado" />
        ) : (
          <button
            onClick={() => marcarReparado(r.id)}
            disabled={actualizandoId === r.id}
            className="mt-1 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {actualizandoId === r.id ? "Actualizando…" : "Marcar como reparado"}
          </button>
        )}
      </div>
    ),
  }))

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            {usuario?.rol === "trabajador" ? "Reportes a Reparar" : "Mapa de Reportes"}
          </h1>
          <p className="mt-1 text-neutral-500">{pendientes} bache(s) pendiente(s) de {reportes.length} reportados en total.</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-2">
        <AlertaProximidad ubicacion={ubicacion} reportes={reportes} />
        {errorUbicacion && <p className="text-sm text-neutral-500">📍 {errorUbicacion}</p>}
      </div>

      <div className="grid flex-1 grid-cols-1 gap-6 overflow-hidden lg:grid-cols-[1fr_360px]">
        <div className="min-h-[420px] overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {!cargando && <ReportMap puntos={puntos} miUbicacion={ubicacion} />}
        </div>

        <div className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-neutral-900">Reportes recientes</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {cargando ? (
              <p className="p-5 text-sm text-neutral-500">Cargando…</p>
            ) : error ? (
              <p className="p-5 text-sm text-red-600">{error}</p>
            ) : reportes.length === 0 ? (
              <p className="p-5 text-sm text-neutral-500">Todavía no hay baches reportados.</p>
            ) : (
              reportes.map((r) => (
                <div key={r.id} className="border-b border-neutral-100 p-4 last:border-0">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <strong className="text-sm text-neutral-900">{r.direccion}</strong>
                    <EstadoBadge estado={r.estado} />
                  </div>
                  <p className="mb-2 text-xs text-neutral-500">
                    {r.usuario_nombre} · {new Date(r.creado_en).toLocaleDateString("es-PY")}
                  </p>
                  <div className="mb-2">
                    <SeverityBadge categoria={r.categoria} nivel={r.nivel_peligro} />
                  </div>
                  {r.estado === "pendiente" && (
                    <button
                      onClick={() => marcarReparado(r.id)}
                      disabled={actualizandoId === r.id}
                      className="text-xs font-semibold text-neutral-700 underline hover:text-neutral-900 disabled:opacity-60"
                    >
                      {actualizandoId === r.id ? "Actualizando…" : "Marcar como reparado"}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
