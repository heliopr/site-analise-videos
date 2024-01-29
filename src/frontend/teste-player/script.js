var video = document.querySelector("#v");
let c = true
let v = document.querySelector("#v")
const frames = document.querySelector("#frame")
const fps = 23.976

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

        v.currentTime = v.currentTime + d * (1 / fps)
    }
})


document.addEventListener('DOMContentLoaded', function() {
    video.requestVideoFrameCallback(drawImgeC);
  
});

function play() {
    var video = document.querySelector("#v");
    if(video.paused){
        video.play();
    } else {
        video.pause();
    }
}

var pchange = 1;
var canvas = document.querySelector("#canvas");
var originalh = (window.innerHeight)*0.7;

function drawImgeC(now, meta) {

    frame.textContent = "Frame " + (Math.round(meta.mediaTime  * fps))
    
  var video = document.querySelector("#v");
  var canvas = document.querySelector("#canvas");
  var ctx = canvas.getContext('2d');

  var w = window.innerWidth-200;
  var h = window.innerHeight;
  var size = Math.min(w,h);
  canvas.width = size*1.2;
  canvas.height = size*0.7;
  pchange = 1-((originalh - canvas.height) / originalh);

  
  
  ctx.fillStyle = 'rgba(255,255,0,0.5)';
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  drawSelectionRectangles();

  video.requestVideoFrameCallback(drawImgeC);
  
}

function drawSelectionRectangles() {
    var canvas = document.querySelector("#canvas");
    var ctx = canvas.getContext('2d');
  
    var drawRectangleX = sessionStorage.getItem("drawRectangleX");
    var drawRectangleY = sessionStorage.getItem("drawRectangleY");
    var drawRectangleW = sessionStorage.getItem("drawRectangleW");
    var drawRectangleH = sessionStorage.getItem("drawRectangleH");
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
    ctx.drawImage(document.querySelector("#v"), 0, 0, canvas.width, canvas.height);
 
    if (drawRectangleX !== null && drawRectangleY !== null && drawRectangleW !== null && drawRectangleH !== null) {
        ctx.fillRect(drawRectangleX * pchange, drawRectangleY * pchange, drawRectangleW * pchange, drawRectangleH * pchange);
    }

  
    //console.log(drawRectangleX, drawRectangleY, drawRectangleW, drawRectangleH);
}


var selecionar = document.getElementById('selecionar');
selecionar.addEventListener("change", (e) => {
    if (e.currentTarget.checked) {
        var canvas = document.querySelector("#canvas");
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
      } else {
        var canvas = document.querySelector("#canvas");
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
      }
    });
    var isDrawing = false;
    var startX, startY;
    
    function handleMouseDown(e) {
      isDrawing = true;
      startX = e.clientX - canvas.getBoundingClientRect().left;
      startY = e.clientY - canvas.getBoundingClientRect().top;
    }
    
    function handleMouseMove(e) {
      if (!isDrawing) return;
    
      var canvas = document.querySelector("#canvas");
      var endX = e.clientX - canvas.getBoundingClientRect().left;
      var endY = e.clientY - canvas.getBoundingClientRect().top;
    
      sessionStorage.setItem("drawRectangleX", startX * (1/pchange));
      sessionStorage.setItem("drawRectangleY", startY * (1/pchange));
      sessionStorage.setItem("drawRectangleW", (endX - startX) * (1/pchange));
      sessionStorage.setItem("drawRectangleH", (endY - startY) * (1/pchange));
    
      drawSelectionRectangles();
    }
    
    function handleMouseUp() {
      isDrawing = false;
    }
