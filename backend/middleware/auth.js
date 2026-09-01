const jwt = require("jsonwebtoken")

function requireAuth(req, res, next) {
  const header = req.headers.authorization || ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: "No autenticado." })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = { id: payload.id, email: payload.email, rol: payload.rol }
    next()
  } catch {
    return res.status(401).json({ error: "Sesión inválida o expirada." })
  }
}

// Middleware genérico: solo deja pasar a los roles indicados.
function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    requireAuth(req, res, () => {
      if (!rolesPermitidos.includes(req.usuario.rol)) {
        return res.status(403).json({ error: "No tenés permisos para realizar esta acción." })
      }
      next()
    })
  }
}

const requireAdmin = requireRole("admin")
// El personal de mantenimiento (trabajador) también gestiona el estado de
// los reportes, igual que el admin.
const requireStaff = requireRole("admin", "trabajador")

module.exports = { requireAuth, requireRole, requireAdmin, requireStaff }
