const Database = require("better-sqlite3")
const fs = require("fs")
const path = require("path")

const DATA_DIR = path.resolve(__dirname, "../data")
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

const db = new Database(path.join(DATA_DIR, "app.db"))
db.pragma("journal_mode = WAL")
db.pragma("foreign_keys = ON")

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre        TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    rol           TEXT NOT NULL DEFAULT 'usuario' CHECK (rol IN ('usuario','admin')),
    creado_en     TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reportes_baches (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id            INTEGER NOT NULL REFERENCES usuarios(id),
    archivo_path          TEXT NOT NULL,
    archivo_tipo          TEXT NOT NULL,
    direccion             TEXT NOT NULL,
    latitud               REAL NOT NULL,
    longitud              REAL NOT NULL,
    nivel_peligro         INTEGER,
    categoria             TEXT,
    dimension_estimada    TEXT,
    profundidad_estimada  TEXT,
    ubicacion_en_via      TEXT,
    descripcion           TEXT,
    riesgos               TEXT,
    recomendacion         TEXT,
    estado                TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','reparado')),
    creado_en             TEXT NOT NULL DEFAULT (datetime('now')),
    reparado_en           TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_reportes_usuario ON reportes_baches(usuario_id);
  CREATE INDEX IF NOT EXISTS idx_reportes_estado  ON reportes_baches(estado);
`)

module.exports = db
