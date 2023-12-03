require('dotenv').config()
const fs = require("fs")
const ffmpeg = require("fluent-ffmpeg")
const { spawnSync } = require("child_process")

const bd = require("../src/backend/bd")

function pegarMetadata(video) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(video, (err, metadata) => {
            if (err) {
                reject(err)
            }
            else {
                resolve(metadata)
            }
        })
    })
}

async function fechar() {
    if (await bd.estaConectado()) {
        await bd.encerrarConexao()
    }
    process.exit(0)
}

const f = async () => {
    process.on("SIGINT", fechar)
    process.on("SIGTERM", fechar)

    if (!fs.existsSync("./processar/")) {
        console.log("Diretório '/processar/' inexistente, nenhum vídeo para processar.")
        process.exit()
    }

    const videos = fs.readdirSync("./processar/")

    if (videos.length == 0) {
        console.log("Não há vídeos para processar.")
        process.exit()
    }

    await bd.conectar()
    if (!await bd.estaConectado()) {
        return console.log("[BD] Não foi possível conectar ao banco de dados")
    }

    if (!fs.existsSync("./videos/")) {
        fs.mkdirSync("videos")
    }


    console.log(`Processando ${videos.length} vídeos`)
    let c = 0

    const inicio = performance.now()
    for (let i = 0; i < videos.length; i++) {
        const videoArquivo = videos[i]

        if (await bd.videosCollection.findOne({nome: videoArquivo})) {
            console.log(`O vídeo '${videoArquivo}' já está no banco de dados. PULANDO VÍDEO...`)
            continue
        }

        if (fs.existsSync("./videos/"+videoArquivo)) {
            console.log(`O vídeo '${videoArquivo}' já está na pasta 'videos'. PULANDO VÍDEO...`)
            continue
        }

        const processadoPath = `videos/${videoArquivo}`
        const processarPath = `processar/${videoArquivo}`
        console.log(`Processando vídeo '${videoArquivo}'`)

        try {
            const processarMetadata = await pegarMetadata(processarPath)
            const avgFrameRate = processarMetadata["streams"][0]["avg_frame_rate"].split("/")
            const frameRate = (parseInt(avgFrameRate[0])/parseInt(avgFrameRate[1])).toFixed(2)
            //console.log(frameRate)

            const inicio = performance.now()
            //ffmpeg -y -i video.mp4 -filter:v "setpts=PTS/30,fps=30" -an output.mp4
            spawnSync("ffmpeg", [
                "-y",
                "-i", processarPath,
                "-vf", `setpts=PTS/${frameRate}`,
                "-an",
                processadoPath
            ])
            const tempo = performance.now() - inicio

            const processadoMetadata = await pegarMetadata(processadoPath)

            //console.log(processadoMetadata)

            bd.videosCollection.insertOne({
                nome: videoArquivo,
                fps: parseFloat(frameRate),
                marcado: false,
                duracaoOriginal: processarMetadata["streams"][0]["duration"],
                duracao: processadoMetadata["streams"][0]["duration"],
                tamanho: processadoMetadata["format"]["size"],
                frames: processadoMetadata["streams"][0]["nb_frames"],
                resolucao: [processadoMetadata["streams"][0]["width"],processadoMetadata["streams"][0]["height"]]
            })
            console.log(`'${videoArquivo}' processado em ${(tempo / 1000).toFixed(2)}s (${tempo.toFixed(1)}ms)`)
            c += 1
        }
        catch (e) {
            console.log(`Ocorreu um erro ao tentar processar '${videoArquivo}'`)
            console.log(e)
        }
    }

    const tempo = performance.now() - inicio
    console.log(`${c} vídeos processados com sucesso em ${Math.round(tempo / 1000)}s`)

    return await fechar()
}

f()