import { useEffect, useState } from "react"
import { EstadoBadge, SeverityBadge } from "../components/SeverityBadge"
import { StatCard } from "../components/StatCard"
import { api } from "../services/api"
import type { Reporte } from "../types"

export function MisReportes() {
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .misReportes()
      .then(setReportes)
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudieron cargar tus reportes."))
      .finally(() => setCargando(false))
  }, [])

  const pendientes = reportes.filter((r) => r.estado === "pendiente").length
  const reparados = reportes.filter((r) => r.estado === "reparado").length

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold text-neutral-900">Mis Reportes</h1>
      <p className="mt-1 text-neutral-500">Historial de los baches que reportaste.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icono="📋" etiqueta="Total de reportes" valor={reportes.length} />
        <StatCard icono="⏳" etiqueta="Pendientes" valor={pendientes} />
        <StatCard icono="✅" etiqueta="Reparados" valor={reparados} />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {cargando ? (
          <p className="p-6 text-sm text-neutral-500">Cargando…</p>
        ) : error ? (
          <p className="p-6 text-sm text-red-600">{error}</p>
        ) : reportes.length === 0 ? (
          <p className="p-6 text-sm text-neutral-500">Todavía no reportaste ningún bache.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Foto</th>
                  <th className="px-5 py-3 font-medium">Fecha</th>
                  <th className="px-5 py-3 font-medium">Dirección</th>
                  <th className="px-5 py-3 font-medium">Nivel</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {reportes.map((r) => (
                  <tr key={r.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-5 py-3">
                      {r.archivo_tipo === "video" ? (
                        <video src={r.archivo_url} className="h-12 w-12 rounded-lg object-cover" />
                      ) : (
                        <img src={r.archivo_url} alt="Bache" className="h-12 w-12 rounded-lg object-cover" />
                      )}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-neutral-600">
                      {new Date(r.creado_en).toLocaleDateString("es-PY")}
                    </td>
                    <td className="px-5 py-3 text-neutral-900">{r.direccion}</td>
                    <td className="px-5 py-3">
                      <SeverityBadge categoria={r.categoria} nivel={r.nivel_peligro} />
                    </td>
                    <td className="px-5 py-3">
                      <EstadoBadge estado={r.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
