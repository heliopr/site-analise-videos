const video = document.querySelector("#video")
const canvas = document.querySelector("#canvas")
const ctx = canvas.getContext("2d")

function renderizar() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    ctx.fillStyle = "rgba(0,0,255,0.5)"
    ctx.fillRect(sessionStorage.getItem("drawRectangleX"), sessionStorage.getItem("drawRectangleY"),
        sessionStorage.getItem("drawRectangleW"), sessionStorage.getItem("drawRectangleH"))

    setTimeout(renderizar, 0)
}


const f = async () => {
    document.addEventListener("DOMContentLoaded", function() {
        requestAnimationFrame(renderizar)
    })

    const videoNome = window.location.pathname.substring(6)
}

f()