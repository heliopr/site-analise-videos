require('dotenv').config()
const express = require("express")
const bd = require("./bd")
const path = require("path")
const fs = require("fs")
const bodyParser = require("body-parser")

const config = require("../../config.json")

const app = express()
let servidor

async function fechar() {
    console.log("\n")
    if (servidor) {
        console.log("Fechando servidor")
        await servidor.close()
        console.log("Servidor fechado")
    }
    
    await bd.encerrarConexao()

    process.exit(0)
}

async function verificarVideos() {
    console.log("Verificando vídeos...")

    if (!fs.existsSync("./videos/")) {
        console.log("Diretório 'videos/' não pôde ser encontrado na pasta principal do projeto")
        return false
    }

    const videos = await bd.videosCollection.find({}).toArray()
    const videosArquivos = fs.readdirSync("./videos/")
    for (const video of videos) {
        if (!videosArquivos.includes(video.nome)) {
            console.log(`Vídeo '${video.nome}' não pôde ser encontrado no diretório dos vídeos`)
            return false
        }
    }

    for (const video of videosArquivos) {
        if (!videos.find((x) => x.nome == video)) {
            console.log(`Vídeo '${video}' não pôde ser encontrado no banco de dados`)
            return false
        }
    }

    console.log("Vídeos verificados com sucesso, nenhuma falha encontrada")
    return true
}

const f = async () => {
    await bd.conectar()
    //if (!await bd.estaConectado()) return console.log("[BD] Não foi possível conectar ao banco de dados")

    if (!await verificarVideos()) {
        await fechar()
    }

    app.use(require("./rotas/videos"))
    app.use("/", express.static(path.join(__dirname, "../frontend")))

    app.get("/editar/:video", bodyParser.urlencoded({extended:true}), function(req, res) {
        res.sendFile(path.join(__dirname, "../frontend/editar/index.html"))
    })

    servidor = app.listen(config.porta, () => {
        console.log(`Servidor aberto na porta ${config.porta}`)
    })

    process.on("SIGINT", fechar)
    process.on("SIGTERM", fechar)
}

f()