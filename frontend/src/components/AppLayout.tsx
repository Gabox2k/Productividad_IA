import { useState } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Sidebar } from "./Sidebar"

export function AppLayout() {
  const { usuario, cargando } = useAuth()
  const [sidebarAbierto, setSidebarAbierto] = useState(false)

  if (cargando) {
    return <div className="flex h-screen items-center justify-center text-neutral-500">Cargando…</div>
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen bg-[#faf7f2]">
      <Sidebar abierto={sidebarAbierto} onCerrar={() => setSidebarAbierto(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarAbierto(true)}
            aria-label="Abrir menú"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
          </button>
          <span className="text-base font-bold text-neutral-900">Analizador de Baches</span>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
