import { useState } from "react"
import { api } from "../services/api"

const STORAGE_KEY = "baches_confirmados"

function leerConfirmados(): Set<number> {
  try {
    const crudo = localStorage.getItem(STORAGE_KEY)
    return new Set(crudo ? (JSON.parse(crudo) as number[]) : [])
  } catch {
    return new Set()
  }
}

// Solo evita repreguntarle al mismo usuario en el mismo navegador una vez
// que confirmó; no requiere backend porque "sí, está reparado" no cambia
// ningún estado, a diferencia de "sigue roto".
export function estaConfirmadoLocalmente(id: number): boolean {
  return leerConfirmados().has(id)
}

function marcarConfirmadoLocalmente(id: number) {
  try {
    const confirmados = leerConfirmados()
    confirmados.add(id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...confirmados]))
  } catch {
    // localStorage no disponible: en el peor caso se repite la pregunta
  }
}

export function ConfirmarReparacion({ id, onCambio }: { id: number; onCambio: () => void }) {
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function confirmar() {
    marcarConfirmadoLocalmente(id)
    onCambio()
  }

  async function rechazar() {
    setProcesando(true)
    setError(null)
    try {
      await api.rechazarReparacion(id)
      onCambio()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar tu respuesta.")
      setProcesando(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-amber-200 bg-amber-50 p-3">
      <p className="text-xs font-medium text-amber-900">¿Confirmás que este bache ya fue reparado?</p>
      <div className="flex gap-2">
        <button
          onClick={confirmar}
          disabled={procesando}
          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
        >
          ✅ Sí, está reparado
        </button>
        <button
          onClick={rechazar}
          disabled={procesando}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
        >
          {procesando ? "Enviando…" : "❌ Sigue roto"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
