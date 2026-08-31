import { createContext, use, useEffect, useState, type ReactNode } from "react"
import { api, borrarToken, guardarToken, obtenerToken } from "../services/api"
import type { Usuario } from "../types"

interface AuthContextValue {
  usuario: Usuario | null
  cargando: boolean
  login: (email: string, password: string) => Promise<Usuario>
  registro: (nombre: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!obtenerToken()) {
      setCargando(false)
      return
    }
    api
      .me()
      .then(setUsuario)
      .catch(() => borrarToken())
      .finally(() => setCargando(false))
  }, [])

  async function login(email: string, password: string) {
    const { token, usuario: usuarioLogueado } = await api.login(email, password)
    guardarToken(token)
    setUsuario(usuarioLogueado)
    return usuarioLogueado
  }

  async function registro(nombre: string, email: string, password: string) {
    await api.registro(nombre, email, password)
  }

  function logout() {
    borrarToken()
    setUsuario(null)
  }

  return <AuthContext value={{ usuario, cargando, login, registro, logout }}>{children}</AuthContext>
}

export function useAuth() {
  const ctx = use(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>")
  return ctx
}
