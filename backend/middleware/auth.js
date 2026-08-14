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

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.usuario.rol !== "admin") {
      return res.status(403).json({ error: "Requiere rol de administrador." })
    }
    next()
  })
}

module.exports = { requireAuth, requireAdmin }
