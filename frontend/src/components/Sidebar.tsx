import { NavLink } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const iconos = {
  nuevo: "M12 4.5v15m7.5-7.5h-15",
  mis: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z",
  mapa: "M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.372 2.185a1.125 1.125 0 0 0 1.006 0Z",
}

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

export function Sidebar() {
  const { usuario, logout } = useAuth()
  const esAdmin = usuario?.rol === "admin"

  const linkClase = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
      isActive ? "bg-amber-400 text-neutral-900" : "text-neutral-700 hover:bg-neutral-100"
    }`

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col justify-between border-r border-neutral-200 bg-white p-5">
      <div>
        <div className="mb-8 flex items-center gap-3 px-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-lg">🚧</div>
          <div>
            <p className="text-lg font-bold leading-tight text-neutral-900">Analizador</p>
            <p className="text-lg font-bold leading-tight text-neutral-900">de Baches</p>
          </div>
        </div>

        {!esAdmin && (
          <NavLink
            to="/reportar"
            className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-neutral-900 shadow-sm transition-colors hover:bg-amber-300"
          >
            <Icon path={iconos.nuevo} />
            Nuevo Reporte
          </NavLink>
        )}

        <nav className="flex flex-col gap-1">
          {!esAdmin && (
            <NavLink to="/mis-reportes" className={linkClase}>
              <Icon path={iconos.mis} />
              Mis Reportes
            </NavLink>
          )}
          {esAdmin && (
            <NavLink to="/mapa" className={linkClase}>
              <Icon path={iconos.mapa} />
              Mapa de Reportes
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
  )
}
