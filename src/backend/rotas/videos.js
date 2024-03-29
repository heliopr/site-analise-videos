const { Router } = require("express")
const bodyParser = require("body-parser")
const fs = require("fs")
const bd = require("../bd")
const path = require("path")
const { tentar, tentarAsync } = require("../util/tentar")

const videos = fs.readdirSync("./videos/")

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

            if (i > 0 && marcacoes[i-1]["frame"] >= frame) {
                return `'frame' da marcação ${i} possui valor menor ou igual ao anterior`
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
                    return `Nenhuma das posições da marcação ${i} devem estar presentes já que 'contemInterprete' é false`
                }
            }
        }
        else {
            return `Marcação de índice ${i} não é um dicionário`
        }
    }

    return null
}


router.get("/videos", tentarAsync(async (req, res) => {
    const videosBd = await bd.videosCollection.find({}).toArray()
    const videosRes = []

    for (const video of videosBd) {
        videosRes.push({nome: video.nome, duracaoOriginal: video.duracaoOriginal, marcado: video.marcado})
    }

    res.status(200).json({ sucesso: true, videos: videosRes})
}))

router.get("/videos/:video", tentarAsync(async (req, res) => {
    const video = req.params["video"]

    const videoInfo = await bd.videosCollection.findOne({nome:video})

    if (!videoInfo || !videos.includes(video)) {
        return res.status(400).json({ sucesso: false, mensagem: "Vídeo não encontrado" })
    }

    videoInfo["_id"] = undefined
    videoInfo["marcacoes"] = undefined

    res.status(200).json({ sucesso: true, video: videoInfo })
}))

router.get("/videos/:video/video", tentar((req, res) => {
    const video = req.params["video"]

    if (!videos.includes(video)) {
        return res.status(400).json({ sucesso: false, mensagem: "Vídeo não encontrado" })
    }

    res.status(200).sendFile(path.join(__dirname, "../../../videos/", video))
}))




router.get("/videos/:video/marcacoes", tentarAsync(async (req, res) => {
    const video = req.params["video"]

    const videoInfo = await bd.videosCollection.findOne({nome: video})

    if (!videoInfo || !videos.includes(video)) {
        return res.status(400).json({ sucesso: false, mensagem: "Vídeo não encontrado" })
    }

    res.status(200).json({ sucesso: true, marcacoes: videoInfo["marcacoes"] })
}))

router.post("/videos/:video/marcacoes", bodyParser.json(), tentarAsync(async (req, res) => {
    const video = req.params["video"]
    const marcacoes = req.body["marcacoes"]
    const marcado = req.body["marcado"]

    //console.log(marcacoes)

    const videoInfo = await bd.videosCollection.findOne({nome: video})

    if (!videoInfo || !videos.includes(video)) {
        return res.status(400).json({ sucesso: false, mensagem: "Vídeo não encontrado" })
    }

    const mensagem = validarMarcacoes(marcacoes)
    if (mensagem != null) {
        return res.status(400).json({ sucesso: false, mensagem: mensagem })
    }

    
    if (marcado !== undefined && typeof(marcado) == "boolean") {
        await bd.videosCollection.updateOne({nome: video}, {$set: {marcacoes: marcacoes, marcado: marcado}})
    }
    else {
        await bd.videosCollection.updateOne({nome: video}, {$set: {marcacoes: marcacoes}})
    }

    res.status(200).json({ sucesso: true })
}))

/* não é muito necessário já que agora as marcações estão na mesma collection

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
}))*/

module.exports = router