async function verificar() {
    const texto = document.getElementById("texto").value
    const videoUrl = document.getElementById("videoUrl").value
    const imagen = document.getElementById("imagen").files[0]

    const estado = document.getElementById("estado")
    const resultado = document.getElementById("resultado")

    // Limpiar resultado anterior
    resultado.innerText = ""
    estado.innerHTML = "⏳ La IA está pensando... (puede tardar varios minutos)"

    // Deshabilitar botón para evitar doble click
    const boton = document.querySelector("button")
    boton.disabled = true
    boton.innerText = "Procesando..."

    const formData = new FormData()
    formData.append("texto", texto)
    formData.append("videoUrl", videoUrl)

    if (imagen) {
        formData.append("imagen", imagen)
    }

    try {
        const res = await fetch("http://localhost:5000/api/verificar", {
            method: "POST",
            body: formData,
            signal: AbortSignal.timeout(600000) // 10 minutos
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