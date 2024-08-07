const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const fps = 60;
const selectionColor = "#80b3ff";
ctx.textBaseline = "top";

let edit = document.getElementById("edit");
let editText = document.getElementById("text");
let editFontSize = document.getElementById("font-size");
let editX = document.getElementById("x");
let editY = document.getElementById("y");

let mouseX = 0;
let mouseY = 0;
let mouseDown = false;

let currentSelection = -1;

let slideData = {
    "bg-color": "#eeeeee",
    "objects": [
        {
            "type": "text",
            "text": "안녕하세요",
            "x": 100,
            "y": 100,
            "font_size": 256,
            "weight": "bold",
            "color": "#111111",
        }
    ]
};

function update(){
    ctx.fillStyle = slideData["bg-color"];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (i=0; i<slideData["objects"].length; i++){
        element = slideData["objects"][i]
        if (element["type"] == "text"){
            ctx.fillStyle = element["color"];
            ctx.font = element["weight"]+" "+element["font_size"].toString()+"px Pretendard";
            ctx.fillText(element["text"], element["x"], element["y"]);
            if (currentSelection == i) {
                let textWidth = ctx.measureText(element["text"]).width;
                let textHeight = element["font_size"] 
                ctx.strokeStyle = selectionColor;
                ctx.lineWidth = 4;
                ctx.strokeRect(element["x"], element["y"], textWidth, textHeight)
            }
        }
    }
    setTimeout(() => {
        requestAnimationFrame(update);
    }, 1000/fps);   
}

function CheckCollision(x1, y1, w1, h1, x2, y2, w2, h2){
    return x1 < x2+w2 &&
           x2 < x1+w1 &&
           y1 < y2+h2 &&
           y2 < y1+h1
}

editText.addEventListener("change", e => {
    if (currentSelection != -1){
        slideData["objects"][currentSelection]["text"] = e.target.value;
    }
})
editFontSize.addEventListener("change", e => { 
    if (currentSelection != -1){
        slideData["objects"][currentSelection]["font_size"] = parseInt(e.target.value);
    }
})
editX.addEventListener("change", e => { 
    if (currentSelection != -1){
        slideData["objects"][currentSelection]["x"] = parseInt(e.target.value);
    }
})
editY.addEventListener("change", e => { 
    if (currentSelection != -1){
        slideData["objects"][currentSelection]["y"] = parseInt(e.target.value);
    }
})

function setEdit(state){
    if (state){
        edit.style.display = "block";
        editText.value = slideData["objects"][currentSelection]["text"];
        editFontSize.value = slideData["objects"][currentSelection]["font_size"];
    }
    else{
        edit.style.display = "none";
    }
}

canvas.addEventListener("mousemove", e => {
    mouseX = e.offsetX*canvas.width/canvas.clientWidth;
    mouseY = e.offsetY*canvas.height/canvas.clientHeight;
    if (mouseDown){
        let movementX = e.movementX*canvas.width/canvas.clientWidth;
        let movementY = e.movementY*canvas.height/canvas.clientHeight;
        if (currentSelection != -1) {
            slideData["objects"][currentSelection]["x"] += movementX;
            slideData["objects"][currentSelection]["y"] += movementY;
            editX.value = slideData["objects"][currentSelection]["x"];
            editY.value = slideData["objects"][currentSelection]["y"];
        }
    }
})

canvas.addEventListener("mousedown", e => {
    mouseDown = true;
    if (e.button == 0){
        for (i=0; i<slideData["objects"].length; i++){
            element = slideData["objects"][i]
            if (element["type"] == "text"){
                ctx.font = element["weight"]+" "+element["font_size"].toString()+"px Pretendard";
                let textWidth = ctx.measureText(element["text"]).width;
                let textHeight = element["font_size"]
                let collision = CheckCollision(element["x"], element["y"], textWidth, textHeight, mouseX, mouseY, 0, 0)
                if (collision && !(i == -1)){
                    currentSelection = i;
                    setEdit(true);
                }
                else{
                    currentSelection = -1;
                    setEdit(false);
                }
            }
        }
    }
})

canvas.addEventListener("mouseup",e => {
    mouseDown = false;
})

update()