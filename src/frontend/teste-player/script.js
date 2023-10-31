/*const video = document.querySelector("#video")
const canvas = document.querySelector("#canvas")
const context = canvas.getContext("2d")

video.addEventListener('loadedmetadata', function () {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    setInterval(() => {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
    }, 1000)
})*/

let p = true
const video = document.querySelector("#video")
const frames = document.querySelector("#frame")
const fps = 30

document.addEventListener("keypress", (e) => {
    if (video.paused) {
        let d = 0

        switch (e.key) {
            case ".":
                d = 1
                break
            case ",":
                d = -1
                break
            case "k":
                d = 5
                break
            case "j":
                d = -5
                break
            case "d":
                d = 30
                break
            case "a":
                d = -30
                break
        }

        video.currentTime += d * (1 / fps)
    }
})

setInterval(() => {
    frame.textContent = "Frame " + Math.round(video.currentTime * 30)
}, 100)



$(document).ready(function() {
    $("video").on("click", function(event) {
        
        var x = event.pageX - this.offsetLeft;
        var y = event.pageY - this.offsetTop;
        alert("X Coordinate: " + x + " Y Coordinate: " + y);
        if (p){
            coords1.textContent = "Coordenadas " + "x:" + x + " y:" + y
            p = false
            coords2.textContent = ""
        }else{
            coords2.textContent = "Coordenadas " + "x:" + x + " y:" + y
            p = true
        }
        
    });
});
