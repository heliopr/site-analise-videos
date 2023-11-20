const videos = document.getElementById("videos")
const listaVideos = document.getElementById("lista-videos")

const painelVideo = document.getElementById("painel-video")
const tituloVideo = painelVideo.querySelector("#titulo")
const informacoes = document.getElementById("informacoes")
const editarMarcacoes = document.getElementById("editar-marcacoes")
const fechar = document.getElementById("fechar")
const duracao = informacoes.querySelector("#duracao")
const frames = informacoes.querySelector("#frames")
const tamanho = informacoes.querySelector("#tamanho")
const marcado = informacoes.querySelector("#marcado")

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

function formatarDuracao(duracao) {
    let h = Math.floor(duracao/3600)
    duracao -= h*3600
    let m = Math.floor(duracao/60)
    duracao -= m*60
    let s = duracao

    return `${h}h ${m}m ${s}s`
}



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

    // não terminei ainda
    for (const video of resVideos.videos) {
        criarVideo(video, 0, false)
    }
}

f()