import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { api } from "../services/api"
import type { Rol, UsuarioAdmin } from "../types"

const ETIQUETA_ROL: Record<Rol, string> = {
  usuario: "Usuario",
  trabajador: "Trabajador",
  admin: "Admin",
}

export function Usuarios() {
  const { usuario: yo } = useAuth()
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actualizandoId, setActualizandoId] = useState<number | null>(null)

  function cargar() {
    api
      .usuarios()
      .then(setUsuarios)
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudieron cargar los usuarios."))
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [])

  async function cambiarRol(id: number, rol: Rol) {
    setActualizandoId(id)
    try {
      await api.cambiarRol(id, rol)
      cargar()
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo cambiar el rol.")
    } finally {
      setActualizandoId(null)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold text-neutral-900">Usuarios</h1>
      <p className="mt-1 text-neutral-500">
        Todas las cuentas registradas. Asigná quién es ciudadano, trabajador de mantenimiento o administrador.
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {cargando ? (
          <p className="p-6 text-sm text-neutral-500">Cargando…</p>
        ) : error ? (
          <p className="p-6 text-sm text-red-600">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Nombre</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Registrado</th>
                  <th className="px-5 py-3 font-medium">Rol</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => {
                  const esUnoMismo = u.id === yo?.id
                  return (
                    <tr key={u.id} className="border-b border-neutral-100 last:border-0">
                      <td className="px-5 py-3 text-neutral-900">
                        {u.nombre} {esUnoMismo && <span className="text-xs text-neutral-400">(vos)</span>}
                      </td>
                      <td className="px-5 py-3 text-neutral-600">{u.email}</td>
                      <td className="px-5 py-3 whitespace-nowrap text-neutral-600">
                        {new Date(u.creado_en).toLocaleDateString("es-PY")}
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={u.rol}
                          disabled={esUnoMismo || actualizandoId === u.id}
                          onChange={(e) => cambiarRol(u.id, e.target.value as Rol)}
                          className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-sm font-medium text-neutral-900 outline-none focus:border-neutral-900 disabled:opacity-50"
                        >
                          {Object.entries(ETIQUETA_ROL).map(([valor, etiqueta]) => (
                            <option key={valor} value={valor}>
                              {etiqueta}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
