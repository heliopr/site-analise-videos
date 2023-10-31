require('dotenv').config()
const express = require("express")
const bd = require("./bd")
const fs = require("fs")

const config = require("../../config.json")
const videos = require("../../videos.json")

const app = express()
let servidor

async function fechar() {
    console.log("\n\nFechando servidor")
    await servidor.close()
    console.log("Servidor fechado")
    await bd.encerrarConexao()
    console.log("Saindo...")
    process.exit(0)
}

function verificarVideos() {
    console.log("Verificando vídeos...")

    for (const video of fs.readdirSync("./videos/")) {
        if (videos[video] == undefined) {
            console.log(`Vídeo '${video}' não pôde ser encontrado no arquivo 'videos.json'`)
            return false
        }
    }

    for (const video in videos) {
        const nome = videos[video].nome
        if (videos[video].nome !== video) {
            console.log(`Vídeo '${video}' possui propriedade nome diferente ('${nome}')`)
            return false
        }

        if (!fs.existsSync(`./videos/${video}`)) {
            console.log(`Vídeo '${video}' não pôde ser encontrado na pasta 'videos'`)
            return false
        }
    }

    console.log("Vídeos verificados com sucesso")
    return true
}

const f = async () => {
    if (!verificarVideos()) return console.log("Tente usar 'npm run processarVideos'")

    await bd.conectar()
    if (!await bd.estaConectado()) return console.log("[BD] Não foi possível conectar ao banco de dados")

    app.use(require("./rotas/videos"))

    servidor = app.listen(config.porta, () => {
        console.log(`Servidor aberto na porta ${config.porta}`)
    })

    process.on("SIGINT", fechar)
    process.on("SIGTERM", fechar)
}

f()