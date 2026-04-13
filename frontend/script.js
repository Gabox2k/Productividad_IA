async function verificar() {
    console.log("Boton presionado")

    const texto = document.getElementById("texto").value
    const imagen = document.getElementById("imagen").files[0]

    const formData = new FormData()
    formData.append("texto", texto)
    formData.append("imagen", imagen) 


    try {
        const res = await fetch("http://localhost:3000/api/verificar", {
            method: "POST",
            body: formData
        })

        if (!res.ok) {
            const errorText = await res.text()
            console.error("Error backend:", errorText)
            throw new Error(`Error en la solicitud: ${res.status}`)
        }

        const data = await res.json()
        document.getElementById("resultado").innerText =
            JSON.stringify(data.resultado, null, 2)
    } catch (err) {
        console.error(err)
        document.getElementById("resultado").innerText = "❌ Error al procesar la solicitud"
    }
}