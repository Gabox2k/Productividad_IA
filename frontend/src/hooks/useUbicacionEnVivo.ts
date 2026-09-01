import { useEffect, useRef, useState } from "react"
import type { Coordenadas } from "../utils/distancia"

function mensajeError(err: GeolocationPositionError): string {
  if (err.code === err.PERMISSION_DENIED) {
    return "Activá el permiso de ubicación para ver tu posición en el mapa."
  }
  if (err.code === err.POSITION_UNAVAILABLE) {
    return "No se pudo determinar tu ubicación actual."
  }
  return "Se agotó el tiempo de espera para obtener tu ubicación."
}

// Sigue la posición del dispositivo mientras el componente esté montado
// (a diferencia de un pedido puntual con getCurrentPosition).
export function useUbicacionEnVivo() {
  const [ubicacion, setUbicacion] = useState<Coordenadas | null>(null)
  const [error, setError] = useState<string | null>(null)
  const watchIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.")
      return
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (posicion) => {
        setError(null)
        setUbicacion({ lat: posicion.coords.latitude, lon: posicion.coords.longitude })
      },
      (err) => setError(mensajeError(err)),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    )

    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current)
    }
  }, [])

  return { ubicacion, error }
}
