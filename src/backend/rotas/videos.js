const { Router } = require("express")
const bd = require("../bd")
const path = require("path")
const tentar = require("../util/tentar")
const tentarAsync = require("../util/tentarAsync")

const videosJson = require("../../../videos.json")
const config = require("../../../config.json")

const router = Router()


router.get("/videos", tentar((req, res) => {
    res.status(200).json(Object.keys(videosJson))
}))

router.get("/videos/:video", tentar((req, res) => {
    const video = req.params["video"]
    res.status(200).json(videosJson[video] || {})
}))

router.get("/videos/:video/arquivo", tentar((req, res) => {
    const video = req.params["video"]
    if (videosJson[video] == undefined) {
        return res.status(400).json({ sucesso: false, mensagem: "Vídeo não encontrado" })
    }

    res.status(200).sendFile(path.join(__dirname, "../../../videos/", video))
}))

router.get("/videos/:video/marcacoes", tentarAsync(async (req, res) => {
    const video = req.params["video"]
    if (videosJson[video] == undefined) {
        return res.status(400).json({ sucesso: false, mensagem: "Vídeo não encontrado" })
    }

    if (!await bd.estaConectado()) {
        return res.status(400).json({ sucesso: false, mensagem: "Banco de dados não está conectado" })
    }

    const marcacoes = await bd.bd.collection("marcacoes").findOne({ nome: video })
    res.status(200).json({ sucesso: true, marcacoes: marcacoes })
}))


module.exports = router