const db = require("./database")

function crear(reporte) {
  const stmt = db.prepare(`
    INSERT INTO reportes_baches (
      usuario_id, archivo_path, archivo_tipo, direccion, latitud, longitud,
      nivel_peligro, categoria, dimension_estimada, profundidad_estimada,
      ubicacion_en_via, descripcion, riesgos, recomendacion
    ) VALUES (
      @usuario_id, @archivo_path, @archivo_tipo, @direccion, @latitud, @longitud,
      @nivel_peligro, @categoria, @dimension_estimada, @profundidad_estimada,
      @ubicacion_en_via, @descripcion, @riesgos, @recomendacion
    )
  `)
  const info = stmt.run(reporte)
  return buscarPorId(info.lastInsertRowid)
}

function buscarPorId(id) {
  return db.prepare("SELECT * FROM reportes_baches WHERE id = ?").get(id)
}

function listarPorUsuario(usuario_id) {
  return db
    .prepare("SELECT * FROM reportes_baches WHERE usuario_id = ? ORDER BY creado_en DESC")
    .all(usuario_id)
}

function listarTodos() {
  return db
    .prepare(`
      SELECT r.*, u.nombre AS usuario_nombre, u.email AS usuario_email
      FROM reportes_baches r
      JOIN usuarios u ON u.id = r.usuario_id
      ORDER BY r.creado_en DESC
    `)
    .all()
}

// Para el mapa en vivo de cualquier usuario autenticado: mismos reportes,
// pero sin datos del vecino que los cargó (nombre/email quedan solo para
// la vista de administración).
function listarPublicos() {
  return db.prepare("SELECT * FROM reportes_baches ORDER BY creado_en DESC").all()
}

function marcarReparado(id) {
  const info = db
    .prepare("UPDATE reportes_baches SET estado = 'reparado', reparado_en = datetime('now') WHERE id = ?")
    .run(id)
  if (info.changes === 0) return null
  return buscarPorId(id)
}

// Un vecino desmiente la reparación: vuelve a la cola del admin. Solo tiene
// efecto sobre reportes que estén marcados como reparados (idempotente).
function rechazarReparacion(id) {
  const info = db
    .prepare("UPDATE reportes_baches SET estado = 'pendiente', reparado_en = NULL WHERE id = ? AND estado = 'reparado'")
    .run(id)
  if (info.changes === 0) return null
  return buscarPorId(id)
}

module.exports = { crear, buscarPorId, listarPorUsuario, listarTodos, listarPublicos, marcarReparado, rechazarReparacion }
