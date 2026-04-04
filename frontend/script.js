async function verificar(){

console.log("Boton presionado")

const texto = document.getElementById("texto").value

const res = await fetch("http://localhost:3000/api/verificar",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({texto})

})

const data = await res.json()

document.getElementById("resultado").innerText =
data.choices[0].message.content
}