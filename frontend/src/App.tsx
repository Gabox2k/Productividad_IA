import { Navigate, Route, Routes } from "react-router-dom"
import { AppLayout } from "./components/AppLayout"
import { AuthProvider } from "./context/AuthContext"
import { Login } from "./pages/Login"
import { Mapa } from "./pages/Mapa"
import { MisReportes } from "./pages/MisReportes"
import { NuevoReporte } from "./pages/NuevoReporte"
import { Registro } from "./pages/Registro"

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        <Route element={<AppLayout />}>
          <Route path="/reportar" element={<NuevoReporte />} />
          <Route path="/mis-reportes" element={<MisReportes />} />
          <Route path="/mapa" element={<Mapa />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
