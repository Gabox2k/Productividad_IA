import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import type { Rol } from "../types"

export const INICIO_POR_ROL: Record<Rol, string> = {
  usuario: "/reportar",
  trabajador: "/mapa",
  admin: "/mapa",
}

// Se usa anidado dentro de <AppLayout>, que ya garantiza que hay un usuario
// autenticado; acá solo se filtra por rol y se manda a cada uno a su propia
// pantalla de inicio si intenta entrar a una ruta que no le corresponde.
export function RequireRole({ roles }: { roles: Rol[] }) {
  const { usuario } = useAuth()
  if (!usuario) return null
  if (!roles.includes(usuario.rol)) {
    return <Navigate to={INICIO_POR_ROL[usuario.rol]} replace />
  }
  return <Outlet />
}
