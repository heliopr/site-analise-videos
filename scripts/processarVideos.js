const fs = require("fs")
const ffmpeg = require("fluent-ffmpeg")
const { spawnSync } = require("child_process")

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

const videosJson = {}

const f = async () => {
    if (!fs.existsSync("./processar/")) {
        console.log("Diretório '/processar/' inexistente.")
        return
    }

    const videos = fs.readdirSync("./processar/")

    if (videos.length == 0) {
        console.log("Não há vídeos para processar.")
        return
    }

    console.log(`Processando ${videos.length} vídeos`)
    let c = 0

    const inicio = performance.now()
    for (let i = 0; i < videos.length; i++) {
        const videoArquivo = videos[i]
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

            videosJson[videoArquivo] = {
                nome: videoArquivo,
                fps: frameRate,
                duracaoOriginal: processarMetadata["streams"][0]["duration"],
                duracao: processadoMetadata["streams"][0]["duration"],
                tamanho: processadoMetadata["format"]["size"],
                frames: processadoMetadata["streams"][0]["nb_frames"]
            }
            console.log(`'${videoArquivo}' processado em ${(tempo / 1000).toFixed(2)}s (${tempo.toFixed(1)}ms)`)
            c += 1
        }
        catch (e) {
            console.log(`Ocorreu um erro ao tentar processar '${videoArquivo}'`)
            console.log(e)
        }
    }
    const tempo = performance.now() - inicio

    fs.writeFileSync("videos.json", JSON.stringify(videosJson))
    console.log(`${c} vídeos processados com sucesso em ${Math.round(tempo / 1000)}s`)
}

f()