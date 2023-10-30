const express = require("express")
const path = require("path")

const config = require("../../config.json")
const videos = require("../../videos.json")

const app = express()

app.get("/videos/:video", (req, res) => {
    const video = req.params["video"]
    res.json(videos[video] || {})
})

app.get("/videos/:video/arquivo", (req, res) => {
    const video = req.params["video"]
    res.sendFile(path.join(__dirname, "../../videos/", video))
})

app.listen(config.porta, () => {
    console.log(`Servidor aberto na porta ${config.porta}`)
})