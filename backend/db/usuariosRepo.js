const db = require("./database")

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

module.exports = { crear, buscarPorEmail, buscarPorId, promoverAdmin }
