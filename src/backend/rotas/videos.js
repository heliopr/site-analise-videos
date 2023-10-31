const { Router } = require("express")
const path = require("path")

const videosJson = require("../../../videos.json")

const router = Router()

router.get("/videos/:video", (req, res) => {
    const video = req.params["video"]
    res.json(videosJson[video] || {})
})

router.get("/videos/:video/arquivo", (req, res) => {
    const video = req.params["video"]
    res.sendFile(path.join(__dirname, "../../../videos/", video))
})

module.exports = router