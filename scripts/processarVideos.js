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

    const inicio = performance.now()
    for (let i = 0; i < videos.length; i++) {
        const videoArquivo = videos[i]
        console.log(`Processando vídeo '${videoArquivo}'`)

        try {
            const metadata = await pegarMetadata(`processar/${videoArquivo}`)
            const frameRate = metadata["streams"][0]["r_frame_rate"]

            const inicio = performance.now()
            //ffmpeg -y -i video.mp4 -filter:v "setpts=PTS/30,fps=30" -an output.mp4
            spawnSync("ffmpeg", [
                "-y",
                "-i", `processar/${videoArquivo}`,
                "-filter:v", `setpts=PTS/${frameRate},fps=${frameRate}`,
                "-an",
                `videos/${videoArquivo}`
            ])
            const tempo = performance.now() - inicio

            console.log(`'${videoArquivo}' processado em ${(tempo / 1000).toFixed(2)}s (${tempo.toFixed(1)}ms)`)
        }
        catch (e) {
            console.log(`Ocorreu um erro ao tentar processar '${videoArquivo}'`)
            console.log(e)
        }
    }
    const tempo = performance.now() - inicio

    console.log(`${videos.length} vídeos processados com sucesso em ${Math.round(tempo / 1000)}s`)
}

f()