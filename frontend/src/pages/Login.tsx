import { useState, type FormEvent } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export function Login() {
  const { usuario, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  if (usuario) {
    return <Navigate to={usuario.rol === "admin" ? "/mapa" : "/reportar"} replace />
  }

  async function manejarSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setCargando(true)
    try {
      const usuarioLogueado = await login(email, password)
      navigate(usuarioLogueado.rol === "admin" ? "/mapa" : "/reportar")
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.")
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf7f2] p-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-lg">🚧</div>
          <h1 className="text-lg font-bold text-neutral-900">Analizador de Baches</h1>
        </div>

        <h2 className="mb-4 text-xl font-semibold text-neutral-900">Iniciar sesión</h2>

        <form onSubmit={manejarSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="mt-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-bold text-neutral-900 transition-colors hover:bg-amber-300 disabled:opacity-60"
          >
            {cargando ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-neutral-500">
          ¿No tenés cuenta?{" "}
          <Link to="/registro" className="font-semibold text-neutral-900 underline">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  )
}
