const videos = document.getElementById("videos")
const listaVideos = document.getElementById("lista-videos")

const painelVideo = document.getElementById("painel-video")
const tituloVideo = painelVideo.querySelector("#titulo")
const informacoes = document.getElementById("informacoes")
const editarMarcacoes = document.getElementById("editar-marcacoes")
const fechar = document.getElementById("fechar")
const duracaoVideo = informacoes.querySelector("#duracao")
const framesVideo = informacoes.querySelector("#frames")
const tamanhoVideo = informacoes.querySelector("#tamanho")
const marcadoVideo = informacoes.querySelector("#marcado")

let videoSelecionado = null
let painelCarregado = true

function criarVideo(nome, duracao, marcado) {
    const li = document.createElement("li")
    li.className = "video"
    
    const titulo = document.createElement("p")
    titulo.className = "video-titulo"
    
    const strong = document.createElement("strong")
    strong.textContent = nome

    titulo.appendChild(strong)
    titulo.append(" - " + duracao)
    
    const status = document.createElement("p")
    status.className = "status"
    status.textContent = marcado ? "Marcado" : "Não Marcado"
    status.style.color = marcado ? "#216925" : "#b62828"

    li.appendChild(titulo)
    li.appendChild(status)

    listaVideos.appendChild(li)
    return li
}

function formatarTamanho(bytes, k) {
    const t = ["KB", "MB", "GB"]
    let c = `${bytes}B`

    for (let i = 0; i < t.length; i++) {
        const p = Math.pow(k, i+1)
        if (bytes >= p) {
            c = `${(bytes/p).toFixed(1)}${t[i]}`
        }
    }

    return c
}

function formatarDuracao(duracao) {
    let h = Math.floor(duracao/3600)
    duracao -= h*3600
    let m = Math.floor(duracao/60)
    duracao -= m*60
    let s = Math.floor(duracao)

    // necessário para não ocorrer "0h 0m 30s", só "30s" já é o suficiente
    let formatado
    if (h > 0) formatado = `${h}h ${m}m ${s}s`
    else if (m > 0) formatado = `${m}m ${s}s`
    else formatado = `${s}s`

    return formatado
}

async function getInfoVideo(video) {
    let json
    try {
        const r = await fetch(`/videos/${video}`, {
            method: "GET",
            headers: {'Accept': 'application/json'},
        })
        json = await r.json()
    }
    catch (e) {
        return null
    }

    if (!json || !json.sucesso) return null

    return json.video
}

async function atualizarPainel(video) {
    painelCarregado = false

    tituloVideo.textContent = "Carregando..."
    marcadoVideo.textContent = "Carregando..."
    framesVideo.textContent = "Carregando..."
    duracaoVideo.textContent = "Carregando..."
    tamanhoVideo.textContent = "Carregando..."

    const info = await getInfoVideo(video)
    painelCarregado = true
    if (!info) {
        tituloVideo.textContent = "Erro"
        marcadoVideo.textContent = "Erro"
        framesVideo.textContent = "Erro"
        duracaoVideo.textContent = "Erro"
        tamanhoVideo.textContent = "Erro"
        return
    }

    tituloVideo.textContent = video
    marcadoVideo.textContent = `Marcado: ${info.marcado ? "Sim" : "Não"}`
    framesVideo.textContent = `Frames: ${info.frames}`
    duracaoVideo.textContent = `Duração: ${info.duracaoOriginal}`
    tamanhoVideo.textContent = `Tamanho da Prévia: ${formatarTamanho(info.tamanho, 1024)} (${formatarTamanho(info.tamanho, 1000)})`
}

function desselecionarVideo() {
    if (!videoSelecionado) return

    painelVideo.style.visibility = "hidden"

    videoSelecionado.style.backgroundColor = "#ffffff"
    videoSelecionado = null
}

function selecionarVideo(li, video) {
    videoSelecionado = li
    li.style.backgroundColor = "#e0e0e0"

    painelVideo.style.visibility = "visible"
    atualizarPainel(video)
}


fechar.addEventListener("click", () => {
    if (videoSelecionado) {
        desselecionarVideo()
    }
})


const f = async () => {
    let resVideos
    try {
        const r = await fetch("/videos/", {
            method: "GET",
            headers: {'Accept': 'application/json'},
        })
        resVideos = await r.json()
    }
    catch (e) {
        console.log(e)
        alert("Ocorreu um erro ao requisitar a lista dos vídeos aos servidor, cheque o console")
        return
    }

    if (!resVideos.sucesso) {
        alert("Um erro desconhecido ocorreu ao tentar requisitar a lista dos vídeos")
        return
    }

    for (const video of resVideos.videos) {
        const li = criarVideo(video.nome, formatarDuracao(video.duracaoOriginal), video.marcado)
        li.addEventListener("click", () => {
            if (!painelCarregado) return

            if (videoSelecionado != li) {
                desselecionarVideo()
                selecionarVideo(li, video.nome)
            }
            else {
                desselecionarVideo()
            }
        })
    }
}

f()