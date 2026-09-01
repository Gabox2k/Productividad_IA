const express = require("express")
const usuariosRepo = require("../db/usuariosRepo")
const { requireAdmin } = require("../middleware/auth")

const router = express.Router()

router.get("/usuarios", requireAdmin, (req, res) => {
  res.json(usuariosRepo.listarTodos())
})

router.patch("/usuarios/:id/rol", requireAdmin, (req, res) => {
  const id = Number(req.params.id)
  const { rol } = req.body

  if (!usuariosRepo.ROLES_VALIDOS.includes(rol)) {
    return res.status(400).json({ error: "Rol inválido." })
  }
  if (id === req.usuario.id) {
    return res.status(400).json({ error: "No podés cambiar tu propio rol." })
  }

  const usuario = usuariosRepo.actualizarRol(id, rol)
  if (!usuario) {
    return res.status(404).json({ error: "Usuario no encontrado." })
  }

  res.json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol })
})

module.exports = router
