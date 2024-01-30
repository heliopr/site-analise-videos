const elementos = {
    aguarde: document.querySelector("#aguarde"),
    conteudo: document.querySelector("#conteudo"),

    player: document.querySelector("#player"),
    canvas: document.querySelector("#player #canvas"),
    videoPlayer: document.querySelector("#video-player"),
    barra: document.querySelector("#barra"),
    posicaoCursor: document.querySelector("#posicao-cursor"),
    playBotao: document.querySelector("#play"),
    velocidadeBotao: document.querySelector("#velocidade"),

    painel: document.querySelector("#painel"),
    tituloVideo: document.querySelector("#titulo-video"),
    frame: document.querySelector("#frame"),
    frameOriginal: document.querySelector("#frame-original")
}

const context = elementos.canvas.getContext('2d')

let frameAtual = 0
let infoVideo = null
let marcacoes = null

function aguardarEvento(item, evento) {
    return new Promise((resolve) => {
        const l = () => {
            item.removeEventListener(evento, l)
            resolve()
        }
        item.addEventListener(evento, l)
    })
}

function calcFrameOriginal(frame, fps) {
    if (frame < 3) return frame
    return Math.round((frame-2) * fps) - 2
}

function getMarcacaoAtual(frame) {
    if (!marcacoes) return null
    let marcacao = null
    for (const marc of marcacoes) {
        if (marc["frame"] <= frame && (!marcacao || marc["frame"] > marcacao["frame"]))
            marcacao = marc
    }
    return marcacao
}

function renderizarCursor() {
    const barraRect = elementos.barra.getBoundingClientRect()
    const playerRect = elementos.player.getBoundingClientRect()
    //console.log((frameAtual/infoVideo["video"]["frames"]))
    //const posy = (barraRect.y+(barraRect.height/2)-(elementos.posicaoCursor.clientHeight/2)-playerRect.top)
    const posx = ((frameAtual/(infoVideo["video"]["frames"]-1))*barraRect.width) - (elementos.posicaoCursor.clientWidth/2)
    elementos.posicaoCursor.style.left = posx+"px"
}

function renderizarCanva(metadata) {
    frameAtual = Math.round(metadata.mediaTime  * infoVideo["video"]["fps"])

    const w = window.innerWidth-200
    const h = window.innerHeight
    const size = Math.min(w,h)
    canvas.width = size*1.2
    canvas.height = size*0.7
    context.drawImage(elementos.videoPlayer, 0, 0, canvas.width, canvas.height)

    renderizarSelecao()
}

function renderizarPainel() {
    elementos.frame.textContent = "Frame: " + frameAtual
    elementos.frameOriginal.textContent = "Frame original: " + calcFrameOriginal(frameAtual, infoVideo["video"]["fps"])
}

function renderizarSelecao() {
    const marcacaoAtual = getMarcacaoAtual(calcFrameOriginal(frameAtual, infoVideo["video"]["fps"]))
    if (marcacaoAtual && marcacaoAtual["contemInterprete"]) {
        context.fillStyle = "rgba(255,255,0,0.5)"
        const pos1 = marcacaoAtual["pos1"]
        const pos2 = marcacaoAtual["pos2"]
        context.fillRect(pos1[0], pos1[1], pos2[0]-pos1[0], pos2[1]-pos1[1]);
    }
}

function renderizar(now, metadata) {
    renderizarCanva(metadata)
    renderizarPainel()
    if (infoVideo) renderizarCursor()
    elementos.videoPlayer.requestVideoFrameCallback(renderizar)
}

const f = async () => {
    elementos.aguarde.style.visibility = "visible"

    if (document.readyState === "loading") {
        document.addEventListener('DOMContentLoaded', function() {
            elementos.videoPlayer.requestVideoFrameCallback(renderizar)
        })
    }
    else {
        new Promise((resolve) => {
            elementos.videoPlayer.requestVideoFrameCallback(renderizar)
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

    marcacoes = infoVideo["video"]["marcado"] ? infoVideo["video"]["marcacoes"] : null /*[{
        "frame": 0,
        "contemInterprete": true,
        pos1: [50, 50],
        pos2: [300, 100]
    },
    {
        "frame": 1018,
        "contemInterprete": false
    },
    {
        "frame": 1678,
        "contemInterprete": true,
        pos1: [500, 500],
        pos2: [300, 300]
    }]*/

    elementos.videoPlayer.src = `/videos/${videoNome}/video`
    if (elementos.videoPlayer.readyState < 3) await aguardarEvento(elementos.videoPlayer, 'loadeddata')


    elementos.conteudo.style.visibility = "visible"
    elementos.aguarde.style.visibility = "hidden"

    elementos.playBotao.addEventListener("click", () => {
        if (elementos.videoPlayer.paused) {
            elementos.videoPlayer.play()
            elementos.playBotao.textContent = "Pausar"
        }
        else {
            elementos.videoPlayer.pause()
            elementos.playBotao.textContent = "Play"
        }
    })

    var vel = 1
    elementos.velocidadeBotao.addEventListener("click", () => {
        switch (vel) {
            case 1:
                vel = 2
                break
            case 2:
                vel = 4
                break
            default:
                vel = 1
                break
        }

        elementos.velocidadeBotao.textContent = vel + "x"
        elementos.videoPlayer.playbackRate = vel
    })

    document.addEventListener("keypress", (e) => {
        if (elementos.videoPlayer.paused) {
            let d = 0
    
            switch (e.key) {
                case ".":
                    d = 1
                    break
                case ",":
                    d = -1
                    break
                case "k":
                    d = 5
                    break
                case "j":
                    d = -5
                    break
                case "d":
                    d = 30
                    break
                case "a":
                    d = -30
                    break
            }
    
            elementos.videoPlayer.currentTime += d * (1 / infoVideo["video"]["fps"])
        }
    })
}

f()