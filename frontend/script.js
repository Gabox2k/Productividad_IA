const usuarioActual = exigirRol()

if (usuarioActual) {
    pintarTopbar(usuarioActual)
    if (usuarioActual.rol === "admin") {
        document.getElementById("linkAdmin").style.display = "inline"
    }
    cargarMisReportes()
}

async function analizarBache() {
    const archivo = document.getElementById("archivoBache").files[0]
    const direccion = document.getElementById("direccionBache").value.trim()
    const estado = document.getElementById("estadoBache")
    const contenedor = document.getElementById("resultadoBache")

    if (!direccion) {
        estado.innerHTML = "⚠️ Indicá la dirección del bache."
        return
    }
    if (!archivo) {
        estado.innerHTML = "⚠️ Seleccioná una foto o video del bache primero."
        return
    }

    contenedor.innerHTML = ""
    estado.innerHTML = "⏳ Analizando bache... (puede tardar un momento)"

    const boton = document.querySelectorAll("button")[0]
    boton.disabled = true
    boton.innerText = "Analizando..."

    const formData = new FormData()
    formData.append("archivo", archivo)
    formData.append("direccion", direccion)

    try {
        const res = await fetchConAuth(`${API_BASE}/api/baches`, {
            method: "POST",
            body: formData,
            signal: AbortSignal.timeout(600000)
        })

        const data = await res.json()

        if (!res.ok) {
            estado.innerHTML = "❌ Error"
            contenedor.innerHTML = `<p>${data.error || "Error al analizar el bache."}</p>`
            return
        }

        estado.innerHTML = "✅ Análisis completado:"
        contenedor.innerHTML = renderizarResultadoBache(data)
        document.getElementById("direccionBache").value = ""
        document.getElementById("archivoBache").value = ""
        cargarMisReportes()

    } catch (err) {
        console.error(err)
        estado.innerHTML = "❌ Error"
        contenedor.innerHTML = `<p>${err.name === "TimeoutError" ? "La IA tardó demasiado. Intentá de nuevo." : "Error al analizar el bache."}</p>`
    } finally {
        boton.disabled = false
        boton.innerText = "Analizar Bache"
    }
}

function renderizarResultadoBache(data) {
    if (data.error) {
        return `<p style="color:red;">${data.error}</p>`
    }

    const nivel = data.nivel_peligro || "?"
    const categoria = (data.categoria || "DESCONOCIDO").toUpperCase()
    const claseCSS = {
        "BAJO": "bajo", "MEDIO": "medio", "ALTO": "alto", "CRÍTICO": "critico", "CRITICO": "critico"
    }[categoria] || "medio"

    const filas = [
        ["Dirección", escaparHtml(data.direccion)],
        ["Nivel de peligro", `${nivel}/10`],
        ["Tamaño estimado", data.dimension_estimada],
        ["Profundidad estimada", data.profundidad_estimada],
        ["Ubicación en la vía", data.ubicacion_en_via],
        ["Descripción", data.descripcion],
        ["Riesgos", data.riesgos],
        ["Recomendación", data.recomendacion],
    ].filter(([, v]) => v)

    const filasHTML = filas.map(([label, valor]) =>
        `<div class="bache-fila"><strong>${label}:</strong> ${valor}</div>`
    ).join("")

    return `
    <div class="bache-card ${claseCSS}">
      <span class="nivel-badge">⚠️ ${categoria} (${nivel}/10)</span>
      ${filasHTML}
    </div>`
}

async function cargarMisReportes() {
    const contenedor = document.getElementById("misReportes")
    try {
        const res = await fetchConAuth(`${API_BASE}/api/baches/mis-reportes`)
        const reportes = await res.json()

        if (!res.ok) {
            contenedor.innerHTML = `<p>${reportes.error || "No se pudieron cargar tus reportes."}</p>`
            return
        }
        if (!reportes.length) {
            contenedor.innerHTML = "<p>Todavía no reportaste ningún bache.</p>"
            return
        }

        contenedor.innerHTML = reportes.map(renderizarReporteItem).join("")
    } catch (err) {
        console.error(err)
        contenedor.innerHTML = "<p>No se pudieron cargar tus reportes.</p>"
    }
}

function renderizarReporteItem(r) {
    const nivel = r.nivel_peligro || "?"
    const categoria = (r.categoria || "DESCONOCIDO").toUpperCase()
    const claseCSS = {
        "BAJO": "bajo", "MEDIO": "medio", "ALTO": "alto", "CRÍTICO": "critico", "CRITICO": "critico"
    }[categoria] || "medio"

    const urlArchivo = `${API_BASE}${escaparHtml(r.archivo_url)}`
    const media = r.archivo_tipo === "video"
        ? `<video class="bache-thumb" src="${urlArchivo}" controls></video>`
        : `<img class="bache-thumb" src="${urlArchivo}" alt="Foto del bache">`

    return `
    <div class="bache-card ${claseCSS}">
      <span class="nivel-badge">⚠️ ${categoria} (${nivel}/10)</span>
      <span class="estado-badge ${r.estado}">${r.estado === "reparado" ? "Reparado" : "Pendiente"}</span>
      <div class="bache-fila"><strong>Dirección:</strong> ${escaparHtml(r.direccion)}</div>
      <div class="bache-fila"><strong>Descripción:</strong> ${r.descripcion || "-"}</div>
      ${media}
    </div>`
}
