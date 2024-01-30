const elementos = {
    aguarde: document.querySelector("#aguarde"),
    conteudo: document.querySelector("#conteudo"),
    barra: document.querySelector("#barra"),
    posicaoCursor: document.querySelector("#posicao-cursor"),

    player: document.querySelector("#player"),
    canvas: document.querySelector("#player #canvas"),
    videoPlayer: document.querySelector("#video-player")
}

const context = elementos.canvas.getContext('2d')

let frameAtual = 0
let infoVideo = null

function aguardarEvento(item, evento) {
    return new Promise((resolve) => {
        const l = () => {
            item.removeEventListener(evento, l)
            resolve()
        }
        item.addEventListener(evento, l)
    })
}

function renderizarCursor() {
    const barraRect = elementos.barra.getBoundingClientRect()
    const playerRect = elementos.player.getBoundingClientRect()
    const posy = (barraRect.y+(barraRect.height/2)-(elementos.posicaoCursor.clientHeight/2)-playerRect.top)
    const posx = ((frameAtual/infoVideo["video"]["frames"])*barraRect.width) - (elementos.posicaoCursor.clientWidth/2)
    elementos.posicaoCursor.style.top = posy+"px"
    elementos.posicaoCursor.style.left = posx+"px"
}

function renderizarCanva() {
    const w = window.innerWidth-200
    const h = window.innerHeight
    const size = Math.min(w,h)
    canvas.width = size*1.2
    canvas.height = size*0.7
    pchange = 1-((((window.innerHeight)*0.7) - canvas.height) / ((window.innerHeight)*0.7))
    
    context.fillStyle = 'rgba(255,255,0,0.5)'
    context.drawImage(elementos.videoPlayer, 0, 0, canvas.width, canvas.height)
}

function renderizar() {
    renderizarCanva()
    if (infoVideo) renderizarCursor()
    requestAnimationFrame(renderizar)
}

const f = async () => {
    elementos.aguarde.style.visibility = "visible"

    if (document.readyState === "loading") {
        document.addEventListener('DOMContentLoaded', function() {
            requestAnimationFrame(renderizar)
        })
    }
    else {
        new Promise((resolve) => {
            requestAnimationFrame(renderizar)
            resolve()
        })
    }

    const videoNome = location.pathname.substring(8)

    try {
        const r = await fetch(`/videos/${videoNome}/`, {
            method: "GET",
            headers: {'Accept': 'application/json'},
        })
        infoVideo = await r.json()
    }
    catch (e) {
        elementos.aguarde.textContent = "ERRO"
        console.log(e)
        alert("Um erro ocorreu ao requisitar informações sobre o vídeo, tente recarregar a página")
        return
    }

    if (!infoVideo || !infoVideo.sucesso) {
        elementos.aguarde.textContent = "ERRO"
        alert("Um erro ocorreu ao tentar requisitar informações sobre o vídeo, tente recarregar a página")
        return
    }

    elementos.videoPlayer.src = `/videos/${videoNome}/video`
    if (elementos.videoPlayer.readyState < 3) await aguardarEvento(elementos.videoPlayer, 'loadeddata')


    elementos.conteudo.style.visibility = "visible"
    elementos.aguarde.style.visibility = "hidden"



    console.log(infoVideo)
}

f()