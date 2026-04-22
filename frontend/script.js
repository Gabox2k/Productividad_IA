async function verificar() {

    const texto = document.getElementById("texto").value
    const imagen = document.getElementById("imagen").files[0]

    const estado = document.getElementById("estado")
    const resultado = document.getElementById("resultado")

    // ⏳ Mostrar mensaje mientras procesa
    estado.innerHTML = "⏳ La IA está pensando..."
    resultado.innerText = ""

    const formData = new FormData()
    formData.append("texto", texto)

    if (imagen) {
        formData.append("imagen", imagen)
    }

    try {
        const res = await fetch("http://localhost:5000/api/verificar", {
            method: "POST",
            body: formData
        })

        if (!res.ok) {
            const errorText = await res.text()
            console.error("Error backend:", errorText)
            throw new Error(`Error en la solicitud: ${res.status}`)
        }

        const data = await res.json()

        estado.innerHTML = "Resultado:"
        resultado.innerText = JSON.stringify(data, null, 2)

    } catch (err) {
        console.error(err)

        estado.innerHTML = "❌ Error"
        resultado.innerText = "Error al procesar la solicitud"
    }
}