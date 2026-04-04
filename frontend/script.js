async function verificar() {
    console.log("Boton presionado")

    const texto = document.getElementById("texto").value

    try {
        const res = await fetch("http://localhost:3000/api/verificar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ texto })
        })

        if (!res.ok) {
            const errorText = await res.text()
            console.error("Error backend:", errorText)
            throw new Error(`Error en la solicitud: ${res.status}`)
        }

        const data = await res.json()
        document.getElementById("resultado").innerText =
            data.choices ? data.choices[0].message.content : JSON.stringify(data)
    } catch (err) {
        console.error(err)
        document.getElementById("resultado").innerText = "❌ Error al procesar la solicitud"
    }
}