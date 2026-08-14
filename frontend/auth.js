const API_BASE = "http://localhost:5000"

function guardarSesion(token, usuario) {
    localStorage.setItem("token", token)
    localStorage.setItem("usuario", JSON.stringify(usuario))
}

function obtenerToken() {
    return localStorage.getItem("token")
}

function obtenerUsuario() {
    const raw = localStorage.getItem("usuario")
    return raw ? JSON.parse(raw) : null
}

function cerrarSesion() {
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
    window.location.href = "index.html"
}

// Wrapper de fetch que agrega el token y redirige al login si la sesión ya no es válida
async function fetchConAuth(url, opciones = {}) {
    const token = obtenerToken()
    const headers = { ...(opciones.headers || {}) }
    if (token) headers["Authorization"] = `Bearer ${token}`

    const res = await fetch(url, { ...opciones, headers })
    if (res.status === 401) {
        cerrarSesion()
        throw new Error("Sesión expirada")
    }
    return res
}

// Guard de UX para las páginas protegidas: el filtro real es del lado del servidor
function exigirRol(rolRequerido) {
    const usuario = obtenerUsuario()
    if (!usuario || !obtenerToken()) {
        window.location.href = "index.html"
        return null
    }
    if (rolRequerido && usuario.rol !== rolRequerido) {
        window.location.href = usuario.rol === "admin" ? "admin.html" : "reportar.html"
        return null
    }
    return usuario
}

function redirigirSiYaHaySesion() {
    const usuario = obtenerUsuario()
    if (usuario && obtenerToken()) {
        window.location.href = usuario.rol === "admin" ? "admin.html" : "reportar.html"
    }
}

function pintarTopbar(usuario) {
    const nombreEl = document.getElementById("topbarNombre")
    if (nombreEl) nombreEl.textContent = `Hola, ${usuario.nombre}`
}

// Escapa texto de origen del usuario (nombre, dirección, etc.) antes de insertarlo
// en innerHTML, para evitar XSS persistente.
function escaparHtml(texto) {
    const div = document.createElement("div")
    div.textContent = texto ?? ""
    return div.innerHTML
}
