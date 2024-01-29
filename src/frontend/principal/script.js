const elementos = {
    videos: document.getElementById("videos"),
    videosTitulo: document.querySelector("#videos #titulo"),
    listaVideos: document.getElementById("lista-videos"),
    filtros: document.querySelector("#filtros"),
    limparFiltros: document.querySelector("#filtros #limpar-filtros"),
    aplicarFiltros: document.querySelector("#filtros #aplicar-filtros"),
    filtroSomente: document.querySelector("#filtros #filtro-somente"),

    painelVideo: document.getElementById("painel-video"),
    tituloVideo: document.querySelector("#painel-video #titulo"),
    informacoes: document.getElementById("informacoes"),
    editarMarcacoes: document.getElementById("editar-marcacoes"),
    fechar: document.getElementById("fechar"),
    duracaoVideo: document.querySelector("#informacoes #duracao"),
    framesVideo: document.querySelector("#informacoes #frames"),
    tamanhoVideo: document.querySelector("#informacoes #tamanho"),
    marcadoVideo: document.querySelector("#informacoes #marcado")
}

const videosLista = []
let videoSelecionado = null
let videoSelecionadoNome = null
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
    elementos.listaVideos.appendChild(li)
    return li
}

function filtrarVideos(nome, status) {
    for (const video of videosLista) {
        if ((!nome || video.nome.startsWith(nome)) && ((status==undefined || status==null) || video.info.marcado == status)) {
            video.e.style.display = "block"
        }
        else {
            video.e.style.display = "none"
        }
    }
}

function formatarTamanho(bytes, k) {
    const t = ["KB", "MB", "GB", "TB"]
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

    // para retornar "30s" ao invés de "0h 0m 30s"
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

    elementos.tituloVideo.textContent = "Carregando..."
    elementos.marcadoVideo.textContent = "Carregando..."
    elementos.framesVideo.textContent = "Carregando..."
    elementos.duracaoVideo.textContent = "Carregando..."
    elementos.tamanhoVideo.textContent = "Carregando..."

    const info = await getInfoVideo(video)
    painelCarregado = true
    if (!info) {
        elementos.tituloVideo.textContent = "Erro"
        elementos.marcadoVideo.textContent = "Erro"
        elementos.framesVideo.textContent = "Erro"
        elementos.duracaoVideo.textContent = "Erro"
        elementos.tamanhoVideo.textContent = "Erro"
        return
    }

    elementos.tituloVideo.textContent = video
    elementos.marcadoVideo.textContent = `Marcado: ${info.marcado ? "Sim" : "Não"}`
    elementos.framesVideo.textContent = `Frames: ${info.frames}`
    elementos.duracaoVideo.textContent = `Duração: ${formatarDuracao(info.duracaoOriginal)}`
    elementos.tamanhoVideo.textContent = `Tamanho da Prévia: ${formatarTamanho(info.tamanho, 1024)} (${formatarTamanho(info.tamanho, 1000)})`
}

function desselecionarVideo() {
    if (!videoSelecionado) return

    elementos.painelVideo.style.visibility = "hidden"

    videoSelecionado.style.backgroundColor = "#ffffff"
    videoSelecionado = null
    videoSelecionadoNome = null
}

function selecionarVideo(li, video) {
    videoSelecionado = li
    videoSelecionadoNome = video
    li.style.backgroundColor = "#e0e0e0"

    elementos.painelVideo.style.visibility = "visible"
    atualizarPainel(video)
}



const f = async () => {
    elementos.videosTitulo.textContent = "Vídeos - CARREGANDO..."

    let resVideos
    try {
        const r = await fetch("/videos/", {
            method: "GET",
            headers: {'Accept': 'application/json'},
        })
        resVideos = await r.json()
    }
    catch (e) {
        elementos.videosTitulo.textContent = "Vídeos - ERRO"
        console.log(e)
        alert("Ocorreu um erro ao requisitar a lista dos vídeos aos servidor, cheque o console ou tente recarregar a página")
        return
    }

    if (!resVideos.sucesso) {
        elementos.videosTitulo.textContent = "Vídeos - ERRO"
        alert("Um erro desconhecido ocorreu ao tentar requisitar a lista dos vídeos, tente recarregar a página")
        return
    }

    elementos.videosTitulo.textContent = "Vídeos"

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

        li.addEventListener("mouseenter", () => {
            if (videoSelecionado != li) {
                li.style.backgroundColor = "#f1f1f1"
            }
        })

        li.addEventListener("mouseleave", () => {
            if (videoSelecionado != li) {
                li.style.backgroundColor = "#ffffff"
            }
        })
        videosLista.push({nome: video.nome, info: video, e: li})
    }

    elementos.fechar.addEventListener("click", () => {
        if (videoSelecionado) {
            desselecionarVideo()
        }
    })

    elementos.editarMarcacoes.addEventListener("click", () => {
        location.pathname = `/editar/${videoSelecionadoNome}`
    })

    elementos.limparFiltros.addEventListener("click", () => {
        elementos.filtroSomente.value = "ambos"
        filtrarVideos()
    })

    elementos.aplicarFiltros.addEventListener("click", () => {
        let status = null
        console.log(elementos.filtroSomente.value)
        if (elementos.filtroSomente.value == "nao-marcado") {
            status = false
        }
        else if (elementos.filtroSomente.value == "marcado") {
            status = true
        }

        filtrarVideos(null, status)
    })
}

f()