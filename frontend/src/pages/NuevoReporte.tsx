import { useState, type FormEvent } from "react"
import { Dropzone } from "../components/Dropzone"
import { ReportMap, type MapPoint } from "../components/ReportMap"
import { SeverityBadge } from "../components/SeverityBadge"
import { api } from "../services/api"
import type { Reporte } from "../types"

interface Coordenadas {
  lat: number
  lon: number
}

function mensajeErrorGeo(err: GeolocationPositionError): string {
  if (err.code === err.PERMISSION_DENIED) {
    return "Denegaste el permiso de ubicación. Habilitalo en tu navegador para usar esta opción."
  }
  if (err.code === err.POSITION_UNAVAILABLE) {
    return "No se pudo determinar tu ubicación actual."
  }
  return "Se agotó el tiempo de espera para obtener tu ubicación. Intentá de nuevo."
}

export function NuevoReporte() {
  const [direccion, setDireccion] = useState("")
  const [archivo, setArchivo] = useState<File | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<Reporte | null>(null)

  const [ubicacionGPS, setUbicacionGPS] = useState<Coordenadas | null>(null)
  const [geoCargando, setGeoCargando] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  function usarMiUbicacion() {
    setGeoError(null)

    if (!navigator.geolocation) {
      setGeoError("Tu navegador no soporta geolocalización.")
      return
    }

    setGeoCargando(true)
    navigator.geolocation.getCurrentPosition(
      async (posicion) => {
        const coords = { lat: posicion.coords.latitude, lon: posicion.coords.longitude }
        setUbicacionGPS(coords)
        // Si Nominatim no devuelve una dirección legible (límite de tasa,
        // corte de red), no debe bloquear el envío: ya tenemos coordenadas
        // GPS precisas, así que se usa un texto de respaldo editable.
        let direccionDetectada: string | null = null
        try {
          const respuesta = await api.direccionActual(coords.lat, coords.lon)
          direccionDetectada = respuesta.direccion
        } catch {
          // no bloqueante
        }
        setDireccion(direccionDetectada || `Ubicación actual (${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)})`)
        setGeoCargando(false)
      },
      (err) => {
        setGeoCargando(false)
        setGeoError(mensajeErrorGeo(err))
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  async function manejarSubmit(e: FormEvent) {
    e.preventDefault()
    if (!direccion.trim()) {
      setError("Indicá la dirección del bache, o usá tu ubicación actual.")
      return
    }
    if (!archivo) {
      setError("Seleccioná una foto o video del bache.")
      return
    }

    setError(null)
    setResultado(null)
    setCargando(true)
    try {
      const reporte = await api.crearReporte(direccion.trim(), archivo, ubicacionGPS ?? undefined)
      setResultado(reporte)
      setDireccion("")
      setArchivo(null)
      setUbicacionGPS(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo analizar el bache.")
    } finally {
      setCargando(false)
    }
  }

  const puntoMapa: MapPoint[] = resultado
    ? [{ id: "resultado", lat: resultado.latitud, lon: resultado.longitud, color: "#111827" }]
    : ubicacionGPS
      ? [{ id: "gps", lat: ubicacionGPS.lat, lon: ubicacionGPS.lon, color: "#f59e0b" }]
      : []

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold text-neutral-900">Reportar un Bache</h1>
      <p className="mt-1 text-neutral-500">
        Subí una foto o video del bache y su dirección. La IA analiza la imagen y estima su nivel de peligrosidad.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form onSubmit={manejarSubmit} className="flex flex-col gap-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-neutral-900">Dirección</h2>
              <button
                type="button"
                onClick={usarMiUbicacion}
                disabled={geoCargando}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-60"
              >
                📍 {geoCargando ? "Buscando ubicación…" : "Usar mi ubicación actual"}
              </button>
            </div>
            <input
              type="text"
              value={direccion}
              onChange={(e) => {
                setDireccion(e.target.value)
                setUbicacionGPS(null)
              }}
              placeholder="Calle, número, ciudad"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
            />
            {ubicacionGPS && (
              <p className="mt-2 text-xs font-medium text-amber-700">
                📍 Se va a usar tu ubicación GPS exacta para este reporte.
              </p>
            )}
            {geoError && <p className="mt-2 text-xs text-red-600">{geoError}</p>}
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-3 text-sm font-semibold text-neutral-900">Foto o video del bache</h2>
            <Dropzone archivo={archivo} onArchivo={setArchivo} />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="rounded-lg bg-amber-400 px-4 py-3 text-sm font-bold text-neutral-900 transition-colors hover:bg-amber-300 disabled:opacity-60"
          >
            {cargando ? "Analizando bache… (puede tardar un momento)" : "Analizar y Reportar"}
          </button>
        </form>

        <div className="flex flex-col gap-6">
          <div className="h-64 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <ReportMap puntos={puntoMapa} />
          </div>

          {resultado && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-neutral-900">Resultado del análisis</h2>
                <SeverityBadge categoria={resultado.categoria} nivel={resultado.nivel_peligro} />
              </div>
              <dl className="flex flex-col gap-2 text-sm">
                <Fila etiqueta="Dirección" valor={resultado.direccion} />
                <Fila etiqueta="Tamaño estimado" valor={resultado.dimension_estimada} />
                <Fila etiqueta="Profundidad estimada" valor={resultado.profundidad_estimada} />
                <Fila etiqueta="Ubicación en la vía" valor={resultado.ubicacion_en_via} />
                <Fila etiqueta="Descripción" valor={resultado.descripcion} />
                <Fila etiqueta="Riesgos" valor={resultado.riesgos} />
                <Fila etiqueta="Recomendación" valor={resultado.recomendacion} />
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string | null }) {
  if (!valor) return null
  return (
    <div className="flex flex-col gap-0.5 border-t border-neutral-100 pt-2 first:border-t-0 first:pt-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-neutral-400">{etiqueta}</dt>
      <dd className="text-neutral-700">{valor}</dd>
    </div>
  )
}
