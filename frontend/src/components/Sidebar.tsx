import { NavLink } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const iconos = {
  nuevo: "M12 4.5v15m7.5-7.5h-15",
  mis: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z",
  mapa: "M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.372 2.185a1.125 1.125 0 0 0 1.006 0Z",
  usuarios: "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
  cerrar: "M6 18 18 6M6 6l12 12",
}

function Icon({ path, className = "h-5 w-5 shrink-0" }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

export function Sidebar({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const { usuario, logout } = useAuth()
  const esAdmin = usuario?.rol === "admin"
  const esTrabajador = usuario?.rol === "trabajador"
  const esCiudadano = !esAdmin && !esTrabajador

  const linkClase = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
      isActive ? "bg-amber-400 text-neutral-900" : "text-neutral-700 hover:bg-neutral-100"
    }`

  return (
    <>
      {/* Fondo oscuro para cerrar el drawer al tocar afuera (solo mobile) */}
      {abierto && (
        <div
          onClick={onCerrar}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-neutral-900/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-72 shrink-0 flex-col justify-between border-r border-neutral-200 bg-white p-5 transition-transform duration-200 ease-out lg:static lg:z-auto lg:translate-x-0 ${
          abierto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="min-h-0 overflow-y-auto">
          <div className="mb-8 flex items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-lg">🚧</div>
              <div>
                <p className="text-lg font-bold leading-tight text-neutral-900">Analizador</p>
                <p className="text-lg font-bold leading-tight text-neutral-900">de Baches</p>
              </div>
            </div>
            <button
              onClick={onCerrar}
              aria-label="Cerrar menú"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 lg:hidden"
            >
              <Icon path={iconos.cerrar} className="h-5 w-5" />
            </button>
          </div>

          {esCiudadano && (
            <NavLink
              to="/reportar"
              onClick={onCerrar}
              className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-neutral-900 shadow-sm transition-colors hover:bg-amber-300"
            >
              <Icon path={iconos.nuevo} />
              Nuevo Reporte
            </NavLink>
          )}

          <nav className="flex flex-col gap-1">
            {esCiudadano && (
              <>
                <NavLink to="/mapa-en-vivo" onClick={onCerrar} className={linkClase}>
                  <Icon path={iconos.mapa} />
                  Mapa en Vivo
                </NavLink>
                <NavLink to="/mis-reportes" onClick={onCerrar} className={linkClase}>
                  <Icon path={iconos.mis} />
                  Mis Reportes
                </NavLink>
              </>
            )}
            {(esAdmin || esTrabajador) && (
              <NavLink to="/mapa" onClick={onCerrar} className={linkClase}>
                <Icon path={iconos.mapa} />
                {esTrabajador ? "Reportes a Reparar" : "Mapa de Reportes"}
              </NavLink>
            )}
            {esAdmin && (
              <NavLink to="/usuarios" onClick={onCerrar} className={linkClase}>
                <Icon path={iconos.usuarios} />
                Usuarios
              </NavLink>
            )}
          </nav>
        </div>

        <div className="border-t border-neutral-200 pt-4">
          <div className="mb-3 flex items-center gap-3 px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white">
              {usuario?.nombre?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-900">{usuario?.nombre}</p>
              <p className="truncate text-xs capitalize text-neutral-500">{usuario?.rol}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full rounded-xl px-4 py-2 text-left text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
