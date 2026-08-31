import type { Categoria } from "../types"

const ESTILOS: Record<string, string> = {
  BAJO: "bg-green-100 text-green-800 ring-green-600/20",
  MEDIO: "bg-amber-100 text-amber-800 ring-amber-600/20",
  ALTO: "bg-red-100 text-red-800 ring-red-600/20",
  "CRÍTICO": "bg-purple-100 text-purple-800 ring-purple-600/20",
  CRITICO: "bg-purple-100 text-purple-800 ring-purple-600/20",
}

export function SeverityBadge({ categoria, nivel }: { categoria: Categoria | null; nivel: number | null }) {
  const clave = (categoria || "").toUpperCase()
  const estilo = ESTILOS[clave] || "bg-neutral-100 text-neutral-700 ring-neutral-500/20"

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${estilo}`}>
      {categoria || "Sin evaluar"} {nivel != null && `(${nivel}/10)`}
    </span>
  )
}

const ESTADO_ESTILOS: Record<string, string> = {
  pendiente: "bg-neutral-900 text-white",
  reparado: "bg-neutral-200 text-neutral-600",
}

export function EstadoBadge({ estado }: { estado: "pendiente" | "reparado" }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${ESTADO_ESTILOS[estado]}`}>
      {estado === "reparado" ? "Reparado" : "Pendiente"}
    </span>
  )
}
