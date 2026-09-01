import { Navigate, Route, Routes } from "react-router-dom"
import { AppLayout } from "./components/AppLayout"
import { RequireRole } from "./components/RequireRole"
import { AuthProvider } from "./context/AuthContext"
import { Login } from "./pages/Login"
import { Mapa } from "./pages/Mapa"
import { MapaEnVivo } from "./pages/MapaEnVivo"
import { MisReportes } from "./pages/MisReportes"
import { NuevoReporte } from "./pages/NuevoReporte"
import { Registro } from "./pages/Registro"
import { Usuarios } from "./pages/Usuarios"

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        <Route element={<AppLayout />}>
          <Route element={<RequireRole roles={["usuario"]} />}>
            <Route path="/reportar" element={<NuevoReporte />} />
            <Route path="/mapa-en-vivo" element={<MapaEnVivo />} />
            <Route path="/mis-reportes" element={<MisReportes />} />
          </Route>

          <Route element={<RequireRole roles={["admin", "trabajador"]} />}>
            <Route path="/mapa" element={<Mapa />} />
          </Route>

          <Route element={<RequireRole roles={["admin"]} />}>
            <Route path="/usuarios" element={<Usuarios />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
