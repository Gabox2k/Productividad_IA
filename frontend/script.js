async function verificar() {
    const texto = document.getElementById("texto").value
    const videoUrl = document.getElementById("videoUrl").value
    const imagen = document.getElementById("imagen").files[0]

    const estado = document.getElementById("estado")
    const resultado = document.getElementById("resultado")

    resultado.innerText = ""
    estado.innerHTML = "⏳ La IA está pensando... (puede tardar varios minutos)"

    const boton = document.querySelectorAll("button")[0]
    boton.disabled = true
    boton.innerText = "Procesando..."

    const formData = new FormData()
    formData.append("texto", texto)
    formData.append("videoUrl", videoUrl)
    if (imagen) formData.append("imagen", imagen)

    try {
        const res = await fetch("http://localhost:5000/api/verificar", {
            method: "POST",
            body: formData,
            signal: AbortSignal.timeout(600000)
        })

        if (!res.ok) {
            const errorText = await res.text()
            console.error("Error backend:", errorText)
            throw new Error(`Error en la solicitud: ${res.status}`)
        }

        const data = await res.json()
        estado.innerHTML = "✅ Resultado:"
        resultado.innerText = data.resultado || data.mensaje || JSON.stringify(data, null, 2)

    } catch (err) {
        console.error(err)
        estado.innerHTML = "❌ Error"
        resultado.innerText = err.name === "TimeoutError"
            ? "La IA tardó demasiado. Intentá de nuevo."
            : "Error al procesar la solicitud"
    } finally {
        boton.disabled = false
        boton.innerText = "Verificar"
    }
}

async function analizarBache() {
    const archivo = document.getElementById("archivoBache").files[0]
    const estado = document.getElementById("estadoBache")
    const contenedor = document.getElementById("resultadoBache")

    if (!archivo) {
        estado.innerHTML = "⚠️ Seleccioná una foto o video del bache primero."
        return
    }

    contenedor.innerHTML = ""
    estado.innerHTML = "⏳ Analizando bache... (puede tardar un momento)"

    const boton = document.querySelectorAll("button")[1]
    boton.disabled = true
    boton.innerText = "Analizando..."

    const formData = new FormData()
    formData.append("archivo", archivo)

    try {
        const res = await fetch("http://localhost:5000/api/baches", {
            method: "POST",
            body: formData,
            signal: AbortSignal.timeout(600000)
        })

        if (!res.ok) {
            const errorText = await res.text()
            console.error("Error backend:", errorText)
            throw new Error(`Error del servidor: ${res.status}`)
        }

        const data = await res.json()
        estado.innerHTML = "✅ Análisis completado:"
        contenedor.innerHTML = renderizarResultadoBache(data)

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
