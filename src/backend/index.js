require('dotenv').config()
const express = require("express")
const bd = require("./bd")

const config = require("../../config.json")

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

const f = async () => {

    await bd.conectar()

    app.use(require("./rotas/videos"))

    servidor = app.listen(config.porta, () => {
        console.log(`Servidor aberto na porta ${config.porta}`)
    })

    process.on("SIGINT", fechar)
    process.on("SIGTERM", fechar)
}

f()