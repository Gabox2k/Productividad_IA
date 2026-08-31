import type { Estado, Reporte, Usuario } from "../types"

const TOKEN_KEY = "token"

export function obtenerToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function guardarToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function borrarToken() {
  localStorage.removeItem(TOKEN_KEY)
}

class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

// Rutas relativas: en dev, el proxy de Vite las reenvía a localhost:5000;
// en producción, Express sirve el frontend y la API desde el mismo origen.
async function pedido<T>(url: string, opciones: RequestInit = {}): Promise<T> {
  const token = obtenerToken()
  const headers = new Headers(opciones.headers)
  if (token) headers.set("Authorization", `Bearer ${token}`)

  const res = await fetch(url, { ...opciones, headers })

  if (res.status === 401) {
    borrarToken()
  }

  let data: unknown = null
  try {
    data = await res.json()
  } catch {
    // respuesta sin cuerpo JSON
  }

  if (!res.ok) {
    const mensaje = (data as { error?: string } | null)?.error || "Ocurrió un error inesperado."
    throw new ApiError(mensaje, res.status)
  }

  return data as T
}

export const api = {
  login(email: string, password: string) {
    return pedido<{ token: string; usuario: Usuario }>("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
  },

  registro(nombre: string, email: string, password: string) {
    return pedido<Usuario>("/api/auth/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password }),
    })
  },

  me() {
    return pedido<Usuario>("/api/auth/me")
  },

  crearReporte(direccion: string, archivo: File, ubicacionGPS?: { lat: number; lon: number }) {
    const formData = new FormData()
    formData.append("direccion", direccion)
    formData.append("archivo", archivo)
    if (ubicacionGPS) {
      formData.append("latitud", String(ubicacionGPS.lat))
      formData.append("longitud", String(ubicacionGPS.lon))
    }

    return pedido<Reporte>("/api/baches", {
      method: "POST",
      body: formData,
    })
  },

  direccionActual(lat: number, lon: number) {
    return pedido<{ direccion: string | null }>(`/api/baches/direccion-actual?lat=${lat}&lon=${lon}`)
  },

  misReportes() {
    return pedido<Reporte[]>("/api/baches/mis-reportes")
  },

  todosLosReportes() {
    return pedido<Reporte[]>("/api/baches/todos")
  },

  marcarReparado(id: number) {
    return pedido<{ id: number; estado: Estado; reparado_en: string }>(`/api/baches/${id}/reparado`, {
      method: "PATCH",
    })
  },
}
