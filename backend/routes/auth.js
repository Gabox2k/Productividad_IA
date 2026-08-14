const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const usuariosRepo = require("../db/usuariosRepo")
const { requireAuth } = require("../middleware/auth")

const router = express.Router()

function firmarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  )
}

router.post("/auth/registro", async (req, res) => {
  try {
    const nombre = (req.body.nombre || "").trim()
    const email = (req.body.email || "").trim().toLowerCase()
    const password = req.body.password || ""

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Nombre, email y contraseña son obligatorios." })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." })
    }
    if (usuariosRepo.buscarPorEmail(email)) {
      return res.status(409).json({ error: "Ya existe una cuenta con ese email." })
    }

    const password_hash = await bcrypt.hash(password, 10)
    const usuario = usuariosRepo.crear({ nombre, email, password_hash })

    res.status(201).json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol })
  } catch (err) {
    console.error("Error en /api/auth/registro:", err)
    res.status(500).json({ error: "Error al registrar el usuario." })
  }
})

router.post("/auth/login", async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase()
    const password = req.body.password || ""

    const usuario = usuariosRepo.buscarPorEmail(email)
    if (!usuario) {
      return res.status(401).json({ error: "Credenciales inválidas." })
    }

    const passwordOk = await bcrypt.compare(password, usuario.password_hash)
    if (!passwordOk) {
      return res.status(401).json({ error: "Credenciales inválidas." })
    }

    const token = firmarToken(usuario)
    res.json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    })
  } catch (err) {
    console.error("Error en /api/auth/login:", err)
    res.status(500).json({ error: "Error al iniciar sesión." })
  }
})

router.get("/auth/me", requireAuth, (req, res) => {
  const usuario = usuariosRepo.buscarPorId(req.usuario.id)
  if (!usuario) {
    return res.status(401).json({ error: "Sesión inválida." })
  }
  res.json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol })
})

module.exports = router
