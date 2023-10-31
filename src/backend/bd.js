const mongodb = require("mongodb")

const bd = {}

bd.conectar = async () => {
    const env = process.env
    const url = `mongodb://${env.BD_ENDERECO}:${env.BD_PORTA}`
    //console.log(url)

    console.log(`[BD] Criando cliente de conexão para '${url}'`)
    bd.cliente = new mongodb.MongoClient(url)

    console.log("[BD] Conectando...")
    await bd.cliente.connect()
    console.log("[BD] Conectado com sucesso")

    bd.bd = bd.cliente.db(env.BD_DB)
    bd.marcacoes = bd.bd.collection("marcacoes")
}

bd.estaConectado = async () => {
    try {
        if (!bd.cliente) return false

        let res = await bd.cliente.db().admin().ping()

        return res != undefined && res.ok != undefined && res.ok === 1
    }
    catch (e) {
        return false
    }
}

bd.encerrarConexao = async () => {
    console.log("[BD] Fechando conexão")
    await bd.cliente.close()
    console.log("[BD] Conexão fechada com sucesso")
}

module.exports = bd