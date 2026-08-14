const usuarioActual = exigirRol("admin")

let mapa
let marcadores = {}
let reportesCache = []

const COLORES_CATEGORIA = { BAJO: "#4caf50", MEDIO: "#ff9800", ALTO: "#f44336", "CRÍTICO": "#9c27b0", CRITICO: "#9c27b0" }
const COLOR_REPARADO = "#9e9e9e"

if (usuarioActual) {
    pintarTopbar(usuarioActual)
    inicializarMapa()
}

async function inicializarMapa() {
    mapa = L.map("mapa").setView([-25.2637, -57.5759], 12) // Asunción, Paraguay
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19
    }).addTo(mapa)

    await cargarReportes()
}

async function cargarReportes() {
    const lista = document.getElementById("listaReportes")
    try {
        const res = await fetchConAuth(`${API_BASE}/api/baches/todos`)
        const reportes = await res.json()

        if (!res.ok) {
            lista.innerHTML = `<p>${reportes.error || "No se pudieron cargar los reportes."}</p>`
            return
        }

        reportesCache = reportes
        pintarMarcadores(reportes)
        pintarLista(reportes)
    } catch (err) {
        console.error(err)
        lista.innerHTML = "<p>No se pudieron cargar los reportes.</p>"
    }
}

function pintarMarcadores(reportes) {
    Object.values(marcadores).forEach(m => mapa.removeLayer(m))
    marcadores = {}

    const puntos = []
    reportes.forEach(r => {
        const color = r.estado === "reparado"
            ? COLOR_REPARADO
            : (COLORES_CATEGORIA[(r.categoria || "").toUpperCase()] || "#4a90e2")

        const marker = L.circleMarker([r.latitud, r.longitud], {
            radius: 9, color, fillColor: color, fillOpacity: 0.8, weight: 2
        }).addTo(mapa)
        marker.bindPopup(popupHTML(r))
        marcadores[r.id] = marker
        puntos.push([r.latitud, r.longitud])
    })

    if (puntos.length) {
        mapa.fitBounds(puntos, { maxZoom: 15, padding: [30, 30] })
    }
}

function popupHTML(r) {
    const media = r.archivo_tipo === "video"
        ? `<video src="${API_BASE}${r.archivo_url}" controls style="max-width:220px;"></video>`
        : `<img src="${API_BASE}${r.archivo_url}" alt="Foto del bache" style="max-width:220px; border-radius:4px;">`

    const accion = r.estado === "reparado"
        ? `<span class="estado-badge reparado">Reparado</span>`
        : `<button class="btn-reparar" onclick="marcarReparado(${r.id})">Bache reparado</button>`

    return `
    <div style="font-size:13px; max-width:240px;">
      <strong>${r.direccion}</strong><br>
      Reportado por: ${r.usuario_nombre}<br>
      Nivel: ${r.nivel_peligro || "?"}/10 (${r.categoria || "?"})<br>
      ${r.descripcion ? r.descripcion + "<br>" : ""}
      ${media}
      <div style="margin-top:6px;">${accion}</div>
    </div>`
}

function pintarLista(reportes) {
    const lista = document.getElementById("listaReportes")
    if (!reportes.length) {
        lista.innerHTML = "<p>Todavía no hay baches reportados.</p>"
        return
    }

    lista.innerHTML = reportes.map(r => `
    <div class="reporte-lista-item">
      <strong>${r.direccion}</strong>
      <span class="estado-badge ${r.estado}">${r.estado === "reparado" ? "Reparado" : "Pendiente"}</span><br>
      Reportado por ${r.usuario_nombre} · Nivel ${r.nivel_peligro || "?"}/10 (${r.categoria || "?"})<br>
      ${r.estado === "reparado" ? "" : `<button class="btn-reparar" onclick="marcarReparado(${r.id})">Bache reparado</button>`}
    </div>
  `).join("")
}

async function marcarReparado(id) {
    try {
        const res = await fetchConAuth(`${API_BASE}/api/baches/${id}/reparado`, { method: "PATCH" })
        const data = await res.json()

        if (!res.ok) {
            alert(data.error || "No se pudo marcar como reparado.")
            return
        }

        await cargarReportes()
    } catch (err) {
        console.error(err)
        alert("No se pudo marcar como reparado.")
    }
}
