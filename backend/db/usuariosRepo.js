const db = require("./database")

const ROLES_VALIDOS = ["usuario", "trabajador", "admin"]

function crear({ nombre, email, password_hash }) {
  const stmt = db.prepare(
    "INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)"
  )
  const info = stmt.run(nombre, email.toLowerCase(), password_hash)
  return buscarPorId(info.lastInsertRowid)
}

function buscarPorEmail(email) {
  return db.prepare("SELECT * FROM usuarios WHERE email = ?").get(email.toLowerCase())
}

function buscarPorId(id) {
  return db.prepare("SELECT * FROM usuarios WHERE id = ?").get(id)
}

function promoverAdmin(email) {
  const info = db
    .prepare("UPDATE usuarios SET rol = 'admin' WHERE email = ?")
    .run(email.toLowerCase())
  return info.changes > 0
}

function listarTodos() {
  return db
    .prepare("SELECT id, nombre, email, rol, creado_en FROM usuarios ORDER BY creado_en DESC")
    .all()
}

function actualizarRol(id, rol) {
  if (!ROLES_VALIDOS.includes(rol)) return null
  const info = db.prepare("UPDATE usuarios SET rol = ? WHERE id = ?").run(rol, id)
  if (info.changes === 0) return null
  return buscarPorId(id)
}

module.exports = { crear, buscarPorEmail, buscarPorId, promoverAdmin, listarTodos, actualizarRol, ROLES_VALIDOS }
