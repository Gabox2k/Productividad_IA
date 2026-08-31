export type Rol = "usuario" | "admin"

export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: Rol
}

export type Categoria = "BAJO" | "MEDIO" | "ALTO" | "CRÍTICO" | "CRITICO"
export type Estado = "pendiente" | "reparado"

export interface Reporte {
  id: number
  direccion: string
  latitud: number
  longitud: number
  nivel_peligro: number | null
  categoria: Categoria | null
  dimension_estimada: string | null
  profundidad_estimada: string | null
  ubicacion_en_via: string | null
  descripcion: string | null
  riesgos: string | null
  recomendacion: string | null
  estado: Estado
  archivo_url: string
  archivo_tipo: "imagen" | "video"
  creado_en: string
  reparado_en: string | null
  usuario_nombre?: string
  usuario_email?: string
}
