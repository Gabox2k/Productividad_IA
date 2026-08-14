// Promueve una cuenta ya registrada al rol 'admin'. No hay ninguna ruta HTTP
// que haga esto: es intencional, para que nadie se autoasigne el rol desde
// la web. Uso: node scripts/crear-admin.js correo@ejemplo.com

const usuariosRepo = require("../db/usuariosRepo")

const email = process.argv[2]

if (!email) {
  console.error("Uso: node scripts/crear-admin.js <email>")
  process.exit(1)
}

const usuario = usuariosRepo.buscarPorEmail(email)
if (!usuario) {
  console.error(`No existe ninguna cuenta con el email "${email}". El usuario debe registrarse primero.`)
  process.exit(1)
}

usuariosRepo.promoverAdmin(email)
console.log(`Listo: "${email}" ahora es admin.`)
console.log("Si esa cuenta ya tenía una sesión iniciada, debe cerrar sesión y volver a entrar para que se aplique.")
