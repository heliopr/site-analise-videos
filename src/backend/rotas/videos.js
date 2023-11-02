const { Router } = require("express")
const bodyParser = require("body-parser")
const bd = require("../bd")
const path = require("path")
const { tentar, tentarAsync } = require("../util/tentar")

const videosJson = require("../../../videos.json")

const router = Router()

function validarMarcacoes(marcacoes) {
    if (!Array.isArray(marcacoes)) {
        return "Marcações inválidas"
    }

    if (marcacoes.length == 0) {
        return "Pelo menos uma marcação é necessária"
    }

    for (let i = 0; i < marcacoes.length; i++) {
        const marcacao = marcacoes[i]
        if (typeof marcacao == "object" && !Array.isArray(marcacao)) {
            const frame = marcacao["frame"]
            if (typeof frame != "number") {
                return `'frame' da marcação ${i} deve ser um número`
            }

            const contemInterprete = marcacao["contemInterprete"]
            if (typeof contemInterprete != "boolean") {
                return `'contemInterprete' da marcação ${i} deve ser um boolean`
            }

            const pos1 = marcacao["pos1"]
            const pos2 = marcacao["pos2"]
            if (contemInterprete) {
                if (!Array.isArray(pos1) || !Array.isArray(pos2) || pos1.length != 2 || pos2.length != 2) {
                    return `Uma ou ambas as posições da marcação ${i} possuem um erro`
                }
            }
            else {
                if (pos1 != undefined || pos2 != undefined) {
                    return `Nenhuma das posições da marcação ${i} devem estar presentes já que contemInterprete é false`
                }
            }
        }
        else {
            return `Marcação de índice ${i} não é um dicionário`
        }
    }

    return null
}


router.get("/videos", tentar((req, res) => {
    res.status(200).json({ sucesso: true, videos: Object.keys(videosJson)})
}))

router.get("/videos/:video", tentar((req, res) => {
    const video = req.params["video"]
    if (videosJson[video] == undefined) {
        return res.status(400).json({ sucesso: false, mensagem: "Vídeo não encontrado" })
    }

    res.status(200).json({ sucesso: true, video: videosJson[video] })
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

    const marcacoes = await bd.marcacoes.findOne({ nome: video })
    if (marcacoes) {
        res.status(200).json({ sucesso: true, marcacoes: marcacoes["marcacoes"] || [] })
    }
    else {
        res.status(200).json({ sucesso: true, marcacoes: null })
    }
}))

router.post("/videos/:video/marcacoes", bodyParser.json(), tentarAsync(async (req, res) => {
    const video = req.params["video"]
    const marcacoes = req.body["marcacoes"]

    if (videosJson[video] == undefined) {
        return res.status(400).json({ sucesso: false, mensagem: "Vídeo não encontrado" })
    }

    const mensagem = validarMarcacoes(marcacoes)
    if (mensagem != null) {
        return res.status(400).json({ sucesso: false, mensagem: mensagem })
    }

    if (await bd.marcacoes.findOne({ nome: video }) != null) {
        return res.status(400).json({ sucesso: false, mensagem: "Marcações já existem para este vídeo" })
    }

    await bd.marcacoes.insertOne({ nome: video, marcacoes: marcacoes })
    res.status(200).json({ sucesso: true })
}))

router.put("/videos/:video/marcacoes", bodyParser.json(), tentarAsync(async (req, res) => {
    const video = req.params["video"]
    const marcacoes = req.body["marcacoes"]

    if (videosJson[video] == undefined) {
        return res.status(400).json({ sucesso: false, mensagem: "Vídeo não encontrado" })
    }

    const mensagem = validarMarcacoes(marcacoes)
    if (mensagem != null) {
        return res.status(400).json({ sucesso: false, mensagem: mensagem })
    }

    if (await bd.marcacoes.findOne({ nome: video }) == null) {
        return res.status(400).json({ sucesso: false, mensagem: "Marcações não existem para este vídeo" })
    }

    await bd.marcacoes.updateOne({ nome: video }, { $set: { marcacoes: marcacoes } })
    res.status(200).json({ sucesso: true })
}))

module.exports = router