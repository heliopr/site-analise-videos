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
    proxBotao: document.querySelector("#prox"),
    antBotao: document.querySelector("#ant"),

    painel: document.querySelector("#painel"),
    tituloVideo: document.querySelector("#titulo-video"),
    salvarBotao: document.querySelector("#salvar"),
    frame: document.querySelector("#frame"),
    frameOriginal: document.querySelector("#frame-original"),
    editarMarcacaoBotao: document.querySelector("#editar-marcacao"),
    confirmarEdicaoBotao: document.querySelector("#confirmar-edicao"),
    criarMarcacaoBotao: document.querySelector("#criar-marcacao"),
    deletarMarcacaoBotao: document.querySelector("#deletar-marcacao"),
    semInterpreteBotao: document.querySelector("#sem-interprete"),
    statusSele: document.querySelector("#status-sele")
}

const context = elementos.canvas.getContext('2d')

let frameAtual = 0
let infoVideo = null, infoMarc = null
let marcacoes = null
let estaSegurandoMouse = false, mousePos = [0, 0]
let selecaoPos1 = [0, 0], selecaoPos2 = [0, 0], selecionando = false, selecaoFrame = 0
let editando = false
let salvando = false

function aguardarEvento(item, evento) {
    return new Promise((resolve) => {
        const l = () => {
            item.removeEventListener(evento, l)
            resolve()
        }
        item.addEventListener(evento, l)
    })
}

function editar() {
    editando = true
    renderizarBotoes()
}

function uneditar() {
    editando = false
    selecionando = false
    renderizarCanva()
    renderizarBotoes()
}

function calcFrameOriginal(frame, fps) {
    if (frame < 3) return frame
    return Math.round((frame-2) * fps) - 2
}

function calcFrameCompr(frameOrig, fps) {
    if (frameOrig < 3) return frameOrig
    return Math.round((frameOrig+2)/fps)+2
}

function getMarcacaoAtual(frame) {
    if (!marcacoes) return null
    let marcacao = null
    let j = -1

    for (let i = 0; i < marcacoes.length; i++) {
        const marc = marcacoes[i]
        if (marc["frame"] <= frame && (!marcacao || marc["frame"] > marcacao["frame"])) {
            //console.log("achei")
            marcacao = marc
            j = i
        }
    }

    return [ marcacao, j ]
}

function renderizarBotoes() {
    //console.log("renderizarBotoes")
    const frameOrig = calcFrameOriginal(frameAtual, infoVideo["video"]["fps"])
    const [ marcacao, i ] = getMarcacaoAtual(frameOrig)

    elementos.criarMarcacaoBotao.hidden = true
    elementos.confirmarEdicaoBotao.hidden = true
    elementos.deletarMarcacaoBotao.hidden = true
    elementos.editarMarcacaoBotao.hidden = true
    elementos.semInterpreteBotao.hidden = true

    if (marcacao && marcacao["frame"] == frameOrig) {
        elementos.semInterpreteBotao.hidden = false
        elementos.deletarMarcacaoBotao.hidden = false
        if (marcacao["contemInterprete"]) {
            elementos.semInterpreteBotao.textContent = "Sem Intérprete"
            elementos.semInterpreteBotao.style.backgroundColor = "#e68d29"

            elementos.editarMarcacaoBotao.hidden = false
            elementos.deletarMarcacaoBotao.hidden = false
            if (editando) {
                elementos.confirmarEdicaoBotao.hidden = false
                elementos.semInterpreteBotao.hidden = true
                elementos.editarMarcacaoBotao.textContent = "Cancelar Edição"
                elementos.editarMarcacaoBotao.style.backgroundColor = "#c62828"
            }
            else {
                elementos.confirmarEdicaoBotao.hidden = true
                elementos.editarMarcacaoBotao.style.backgroundColor = "#2e7d32"
                elementos.editarMarcacaoBotao.textContent = "Editar Marcação"
            }
        }
        else {
            elementos.semInterpreteBotao.textContent = "Contém Intérprete"
            elementos.semInterpreteBotao.style.backgroundColor = "#3ea543"
        }
    }
    else {
        elementos.criarMarcacaoBotao.hidden = false
    }
}

function renderizarCursor() {
    const barraRect = elementos.barra.getBoundingClientRect()
    const playerRect = elementos.player.getBoundingClientRect()
    //console.log((frameAtual/infoVideo["video"]["frames"]))
    //const posy = (barraRect.y+(barraRect.height/2)-(elementos.posicaoCursor.clientHeight/2)-playerRect.top)
    const posx = ((frameAtual/(infoVideo["video"]["frames"]-1))*barraRect.width) - (elementos.posicaoCursor.clientWidth/2)
    elementos.posicaoCursor.style.left = posx+"px"
}

function renderizarCanva() {
    /*const w = window.innerWidth-200
    const h = window.innerHeight
    const size = Math.min(w,h)
    canvas.width = size*1.2
    canvas.height = size*0.7*/
    elementos.canvas.width = infoVideo["video"]["resolucao"][0]
    elementos.canvas.height = infoVideo["video"]["resolucao"][1]

    context.drawImage(elementos.videoPlayer, 0, 0, canvas.width, canvas.height)

    renderizarSelecao()
}

function renderizarPainel() {
    const frameOrig = calcFrameOriginal(frameAtual, infoVideo["video"]["fps"])
    elementos.frame.textContent = "Frame: " + frameAtual
    elementos.frameOriginal.textContent = "Frame original: " + frameOrig
    //console.log(calcFrameCompr(frameOrig, infoVideo["video"]["fps"]))

    renderizarBotoes()
}

function renderizarSelecao() {
    let pos1 = null, pos2 = null

    if (selecionando && editando) {
        pos1 = selecaoPos1
        pos2 = selecaoPos2
    }
    else { 
        const frameOrig = calcFrameOriginal(frameAtual, infoVideo["video"]["fps"])
        const [ marcacaoAtual, i ] = getMarcacaoAtual(frameOrig)
        if (marcacaoAtual && marcacaoAtual["contemInterprete"]) {
            pos1 = marcacaoAtual["pos1"]
            pos2 = marcacaoAtual["pos2"]
        }
    }

    if (pos1 && pos2) {
        context.fillStyle = "rgba(255,255,0, 0.3)"
        context.fillRect(pos1[0], pos1[1], pos2[0]-pos1[0], pos2[1]-pos1[1])
    }
}

function renderizar(now, metadata) {
    frameAtual = Math.round(metadata.mediaTime  * infoVideo["video"]["fps"])
    if (editando) uneditar()
    if (selecionando && frameAtual != selecaoFrame) selecionando = false

    renderizarCanva()
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


    try {
        const r = await fetch(`/videos/${videoNome}/marcacoes`, {
            method: "GET",
            headers: {'Accept': 'application/json'},
        })
        infoMarc = await r.json()
    }
    catch (e) {
        elementos.aguarde.textContent = "ERRO"
        console.log(e)
        alert("Um erro ocorreu ao requisitar informações sobre as marcações, tente recarregar a página")
        return
    }

    if (!infoMarc || !infoMarc.sucesso) {
        elementos.aguarde.textContent = "ERRO"
        alert("Um erro ocorreu ao tentar requisitar informações sobre as marcações, tente recarregar a página")
        return
    }

    marcacoes = infoMarc["marcacoes"] ? infoMarc["marcacoes"] : []

    elementos.videoPlayer.src = `/videos/${videoNome}/video`
    if (elementos.videoPlayer.readyState < 3) await aguardarEvento(elementos.videoPlayer, 'loadeddata')


    elementos.conteudo.style.visibility = "visible"
    elementos.aguarde.style.visibility = "hidden"

    elementos.tituloVideo.textContent = infoVideo["video"]["nome"]
    elementos.statusSele.value = infoVideo["video"]["marcado"] ? "marcado" : "nao-marcado"

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

    elementos.canvas.addEventListener("mousedown", (e) => {
        if (!editando) return

        selecionando = true
        selecaoFrame = frameAtual
        const res = infoVideo["video"]["resolucao"]
        const rect = elementos.canvas.getBoundingClientRect()
        selecaoPos1 = [((e.clientX - rect.left)/rect.width)*res[0], ((e.clientY - rect.top)/rect.height)*res[1]]
        //console.log(selecaoPos1)
    })

    elementos.editarMarcacaoBotao.addEventListener("click", () => {
        if (editando) {
            uneditar()
        }
        else if (elementos.videoPlayer.paused) {
            editar()
        }
    })

    elementos.confirmarEdicaoBotao.addEventListener("click", () => {
        if (editando && selecionando) {
            const frameOrig = calcFrameOriginal(frameAtual, infoVideo["video"]["fps"])
            const [ marcacao, i ] = getMarcacaoAtual(frameOrig)
            console.log("AEEE " + frameOrig)
            console.log(marcacao)
            console.log(marcacoes)
            if (marcacao && marcacao["frame"] == frameOrig) {
                marcacao["pos1"][0] = Math.floor(Math.min(selecaoPos1[0], selecaoPos2[0]))
                marcacao["pos1"][1] = Math.floor(Math.min(selecaoPos1[1], selecaoPos2[1]))
                marcacao["pos2"][0] = Math.floor(Math.max(selecaoPos1[0], selecaoPos2[0]))
                marcacao["pos2"][1] = Math.floor(Math.max(selecaoPos1[1], selecaoPos2[1]))
                marcacao["contemInterprete"] = true
            }
            uneditar()
        }
    })

    elementos.criarMarcacaoBotao.addEventListener("click", () => {
        const frameOrig = calcFrameOriginal(frameAtual, infoVideo["video"]["fps"])
        const [ marcacao, i ] = getMarcacaoAtual(frameOrig)

        if (marcacao && marcacao["frame"] == frameOrig) return

        const marc = {
            frame: frameOrig,
            contemInterprete: true,
            pos1: [0, 0],
            pos2: [0, 0]
        }

        if (i > 0) {
            for (let j = i; j >= 0; j--) {
                const m = marcacoes[j]
                if (m && m["contemInterprete"] && m["pos1"] && m["pos2"]) {
                    marc["pos1"] = [m["pos1"][0], m["pos1"][1]]
                    marc["pos2"] = [m["pos2"][0], m["pos2"][1]]
                }
            }
        }

        marcacoes.splice(i+1, 0, marc)

        renderizarCanva()
        renderizarBotoes()
    })

    elementos.deletarMarcacaoBotao.addEventListener("click", () => {
        const frameOrig = calcFrameOriginal(frameAtual, infoVideo["video"]["fps"])
        const [ marcacao, i ] = getMarcacaoAtual(frameOrig)

        if (marcacao && marcacao["frame"] == frameOrig) {
            marcacoes.splice(i, 1)
            renderizarCanva()
            renderizarBotoes()
        }
    })

    elementos.semInterpreteBotao.addEventListener("click", () => {
        const frameOrig = calcFrameOriginal(frameAtual, infoVideo["video"]["fps"])
        const [ marcacao, i ] = getMarcacaoAtual(frameOrig)

        if (marcacao && marcacao["frame"] == frameOrig) {
            if (marcacao["contemInterprete"]) {
                marcacao["contemInterprete"] = false
                marcacao["pos1"] = null
                marcacao["pos2"] = null
            }
            else {
                marcacao["contemInterprete"] = true
                marcacao["pos1"] = [0, 0]
                marcacao["pos2"] = [0, 0]
            }

            renderizarCanva()
            renderizarBotoes()
        }
    })

    document.addEventListener("mousedown", () => {
        estaSegurandoMouse = true
    })

    document.addEventListener("mouseup", () => {
        estaSegurandoMouse = false
    })

    document.addEventListener("mousemove", (e) => {
        mousePos = [e.clientX, e.clientY]
        if (selecionando && editando) {
            const rect = elementos.canvas.getBoundingClientRect()
            if (estaSegurandoMouse && mousePos[0] >= rect.left && mousePos[0] < rect.left+rect.width && mousePos[1] >= rect.top && mousePos[1] < rect.top+rect.height) {
                const res = infoVideo["video"]["resolucao"]
                selecaoPos2 = [((e.clientX - rect.left)/rect.width)*res[0], ((e.clientY - rect.top)/rect.height)*res[1]]
            }
            renderizarCanva()
        }
    })

    elementos.proxBotao.addEventListener("click", () => {
        const fp = infoVideo["video"]["fps"]
        const frameOrig = calcFrameOriginal(frameAtual, fp)
        const [ marcacao, i ] = getMarcacaoAtual(frameOrig)

        const m = marcacoes[marcacao ? i+1 : 0]
        if (m) {
            const f = calcFrameCompr(m["frame"], fp)
            elementos.videoPlayer.currentTime = (f+1)/fp
        }
    })

    elementos.antBotao.addEventListener("click", () => {
        const fp = infoVideo["video"]["fps"]
        const frameOrig = calcFrameOriginal(frameAtual, fp)
        const [ marcacao, i ] = getMarcacaoAtual(frameOrig)

        if (!marcacao) return

        let m = null

        if (marcacao["frame"] == frameOrig) {
            if (i > 0) {
                m = marcacoes[i-1]
            }
        }
        else {
            m = marcacao
        }

        if (m) {
            const f = calcFrameCompr(m["frame"], fp)
            elementos.videoPlayer.currentTime = (f+1)/fp
        }
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

    elementos.salvarBotao.addEventListener("click", async () => {
        if (salvando) return

        salvando = true
        let res = null
        try {
            const r = await fetch(`/videos/${videoNome}/marcacoes`, {
                method: "POST",
                body: JSON.stringify({marcacoes: marcacoes, marcado: elementos.statusSele.value == "marcado"? true : false}),
                headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
            })
            res = await r.json()
        }
        catch (e) {
            console.log("Erro ao salvar marcações:")
            console.log(e)
            alert("Um erro ocorreu ao tentar salvar marcações, acesse o console")
            salvando = false
            return
        }

        if (!res || !res.sucesso) {
            console.log("Erro ao salvar marcações, resposta do servidor:")
            console.log(res)
            alert("Servidor rejeitou o pedido: '" + res.mensagem + "'")
            salvando = false
            return
        }

        if (res.sucesso) {
            alert("Vídeo salvo com sucesso")
        }

        salvando = false
    })

    elementos.aguarde.remove()
}

f()