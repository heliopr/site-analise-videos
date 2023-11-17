var video = document.querySelector("#v");
let c = true
let v = document.querySelector("#v")
const frames = document.querySelector("#frame")
const fps = 30

document.addEventListener("keypress", (e) => {
    if (v.paused) {
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

        v.currentTime += d * (1 / fps)
    }
})

setInterval(() => {
    frame.textContent = "Frame " + Math.round(v.currentTime * 30)
}, 100)



/*
$(document).ready(function() {
    $("video").on("click", function(event) {
        
        var x = event.pageX - this.offsetLeft;
        var y = event.pageY - this.offsetTop;
        alert("X Coordinate: " + x + " Y Coordinate: " + y);
        if (c){
            coords1.textContent = "Coordenadas " + "x:" + x + " y:" + y
            c = false
            coords2.textContent = ""
        }else{
            coords2.textContent = "Coordenadas " + "x:" + x + " y:" + y
            c = true
        }
        
    });
});*/



// Código de teste, provavelmente vai ter que reescrever tudo a partir daqui 
document.addEventListener('DOMContentLoaded', function() {
  requestAnimationFrame(drawImgeC);
});


let p = true
function play() {
    var video = document.querySelector("#v");
    if(p){
        video.play()
        p = false
    }else if(!p){
        video.pause()
        p = true
    }
}


function drawImgeC() {
  
  var video = document.querySelector("#v");
  var canvas = document.querySelector("#canvas");
  var ctx = canvas.getContext('2d');
  canvas.width = 1280;
  canvas.height = 720;

  
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  setTimeout(drawImgeC, 0);

  ctx.fillStyle = 'rgba(0,0,255,0.5)';
  ctx.fillRect(sessionStorage.getItem("drawRectangleX"), sessionStorage.getItem("drawRectangleY"), sessionStorage.getItem("drawRectangleW"), sessionStorage.getItem("drawRectangleH"));
  console.log(sessionStorage.getItem("drawRectangleX"),sessionStorage.getItem("drawRectangleY"), sessionStorage.getItem("drawRectangleW"), sessionStorage.getItem("drawRectangleH"));
  
}


function drawRectangle() {

  video.pause()
  p = true
  var canvas = new fabric.Canvas('canvas', { selection: false });
  var rect, isDown, origX, origY;

  canvas.on('mouse:down', function (o) {
    video.pause()
    isDown = true;
    var pointer = canvas.getPointer(o);
    origX = pointer.x;
    origY = pointer.y;
    var pointer = canvas.getPointer(o);
    rect = new fabric.Rect({
      fill: 'rgba(255,0,0,0.5)',
      transparentCorners: false
    });
    
    sessionStorage.setItem("drawRectangleX", origX);
    sessionStorage.setItem("drawRectangleY", origY);
    sessionStorage.setItem("drawRectangleW", pointer.x - origX);
    sessionStorage.setItem("drawRectangleH", pointer.y - origY);

  });


  canvas.on('mouse:move', function (o) {
    if (!isDown) return;
    var pointer = canvas.getPointer(o);
    sessionStorage.setItem("drawRectangleW", pointer.x - origX);
    sessionStorage.setItem("drawRectangleH", pointer.y - origY);
  });


  canvas.on('mouse:up', function (o) {
    isDown = false;
  });

}
