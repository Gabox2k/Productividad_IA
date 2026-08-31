import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Sidebar } from "./Sidebar"

export function AppLayout() {
  const { usuario, cargando } = useAuth()

  if (cargando) {
    return <div className="flex h-screen items-center justify-center text-neutral-500">Cargando…</div>
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen bg-[#faf7f2]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
