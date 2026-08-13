async function verificar() {
    // Obtener valores de los inputs
    const texto = document.getElementById("texto").value
    const videoUrl = document.getElementById("videoUrl").value
    const imagen = document.getElementById("imagen").files[0]

    // Obtener elementos del DOM para mostrar estado y resultado
    const estado = document.getElementById("estado")
    const resultado = document.getElementById("resultado")

    // Limpiar resultado anterior
    resultado.innerText = ""
    // Mostrar mensaje de procesamiento
    estado.innerHTML = "⏳ La IA esta pensando..."

    // Deshabilitar boton para evitar envios multiples
    const boton = document.querySelector("button")
    boton.disabled = true
    boton.innerText = "Procesando..."

    // Crear FormData para enviar datos
    const formData = new FormData()
    formData.append("texto", texto)
    formData.append("videoUrl", videoUrl)

    // Agregar imagen si existe
    if (imagen) {
        formData.append("imagen", imagen)
    }

    try {
        // Enviar peticion POST al backend
        const res = await fetch("http://localhost:5000/api/verificar", {
            method: "POST",
            body: formData,
            signal: AbortSignal.timeout(600000) // 10 minutos
        })

        // Verificar si la respuesta es exitosa
        if (!res.ok) {
            const errorText = await res.text()
            console.error("Error backend:", errorText)
            throw new Error(`Error en la solicitud: ${res.status}`)
        }

        // Parsear respuesta JSON
        const data = await res.json()

        // Mostrar resultado exitoso
        estado.innerHTML = "✅ Resultado:"
        resultado.innerText = data.resultado || data.mensaje || JSON.stringify(data, null, 2)

    } catch (err) {
        console.error(err)
        // Mostrar error
        estado.innerHTML = "❌ Error"
        // Mensaje especifico para timeout
        resultado.innerText = err.name === "TimeoutError" 
            ? "La IA tardó demasiado. Intentá de nuevo." 
            : "Error al procesar la solicitud"
    } finally {
        // Rehabilitar boton y restaurar texto
        boton.disabled = false
        boton.innerText = "Verificar"
    }
}