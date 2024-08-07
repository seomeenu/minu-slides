const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const fps = 60;
const selectionColor = "#80b3ff";
ctx.textBaseline = "top";

let layers = document.getElementById("layers");
let edit = document.getElementById("edit");
let textEdit = document.getElementById("text-edit");
let editText = document.getElementById("text");
let editFontSize = document.getElementById("font-size");
let editBold = document.getElementById("bold");
let editColor = document.getElementById("color");
let editX = document.getElementById("x");
let editY = document.getElementById("y");

let mouseX = 0;
let mouseY = 0;
let mouseDown = false;

let currentSelection = -1;

let slideData = {
    "bg-color": "#eeeeee",
    "objects": []
};

function update(){
    ctx.fillStyle = slideData["bg-color"];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (i=0; i<slideData["objects"].length; i++){
        element = slideData["objects"][i]
        if (element["type"] == "text"){
            ctx.fillStyle = element["color"];
            let weight = "";
            if (element["is_bold"]){
                weight = "bold ";
            }
            ctx.font = weight+element["font_size"].toString()+"px Pretendard";
            ctx.fillText(element["text"], element["x"], element["y"]);
            if (currentSelection == element["index"]) {
                let textWidth = ctx.measureText(element["text"]).width;
                let textHeight = element["font_size"]; 
                ctx.strokeStyle = selectionColor;
                ctx.lineWidth = 4;
                ctx.strokeRect(element["x"], element["y"], textWidth, textHeight);
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
           y2 < y1+h1;
}

editText.addEventListener("input", e => {
    if (currentSelection != -1){
        let element = slideData["objects"][currentSelection]
        element["text"] = e.target.value;
        document.getElementById("layer-button-"+element["index"]).innerText = e.target.value;
    }
});
editFontSize.addEventListener("input", e => { 
    if (currentSelection != -1){
        slideData["objects"][currentSelection]["font_size"] = parseInt(e.target.value);
    }
});
editBold.addEventListener("input", e => { 
    if (currentSelection != -1){
        slideData["objects"][currentSelection]["is_bold"] = editBold.checked;
    }
});
editColor.addEventListener("input", e => { 
    if (currentSelection != -1){
        slideData["objects"][currentSelection]["color"] = e.target.value;
    }
});
editX.addEventListener("input", e => { 
    if (currentSelection != -1){
        slideData["objects"][currentSelection]["x"] = parseInt(e.target.value);
    }
});
editY.addEventListener("input", e => { 
    if (currentSelection != -1){
        slideData["objects"][currentSelection]["y"] = parseInt(e.target.value);
    }
});

function setEdit(state){
    if (state){
        let element = slideData["objects"][currentSelection];
        edit.style.display = "block";
        if (element["type"] == "text"){
            textEdit.style.display = "block";
            editText.value = element["text"];
            editFontSize.value = element["font_size"];
            editBold.checked = element["is_bold"];
            editBold.value = element["color"]; 
        }
    }
    else{
        edit.style.display = "none";
    }
}

function deleteObject(index){
    for (i=slideData["objects"].length-1; i>=0; i--){
        let element = slideData["objects"][i];
        if (element["index"] == index){
            slideData["objects"].splice(i, 1);
            layers.removeChild(document.getElementById("layer-element-"+element["index"]));
            break;
        }
    }
}

function createText(){
    let index = slideData["objects"].length;
    let newText = {
        "index": index,
        "type": "text",
        "text": "텍스트",
        "x": 100,
        "y": 100,
        "font_size": 128,
        "is_bold": false,
        "color": "#111111",
    };
    slideData["objects"].push(newText);

    let layerElement = document.createElement("div");
    layerElement.id = "layer-element-"+index;

    let layerButton = document.createElement("button");
    layerButton.innerText = newText["text"]
    layerButton.id = "layer-button-"+index;
    layerButton.onclick = () => {
        currentSelection = index;
        setEdit(true);
    };
    layerElement.appendChild(layerButton);

    let deleteButton = document.createElement("button");
    deleteButton.innerText = "🗑️";
    deleteButton.onclick = () => {
        deleteObject(index);
    };
    layerElement.appendChild(deleteButton);
    
    layers.appendChild(layerElement);
    currentSelection = index;
    setEdit(true);
}

canvas.addEventListener("mousemove", e => {
    mouseX = e.offsetX*canvas.width/canvas.clientWidth;
    mouseY = e.offsetY*canvas.height/canvas.clientHeight;
    if (mouseDown){
        let movementX = e.movementX*canvas.width/canvas.clientWidth;
        let movementY = e.movementY*canvas.height/canvas.clientHeight;
        if (currentSelection != -1) {
            let element = slideData["objects"][currentSelection]
            element["x"] += movementX;
            element["y"] += movementY;
            editX.value = element["x"];
            editY.value = element["y"];
        }
    }
})

canvas.addEventListener("mousedown", e => {
    mouseDown = true;
    if (e.button == 0){
        for (i=0; i<slideData["objects"].length; i++){
            element = slideData["objects"][i];
            if (element["type"] == "text"){
                ctx.font = element["weight"]+" "+element["font_size"].toString()+"px Pretendard";
                let textWidth = ctx.measureText(element["text"]).width;
                let textHeight = element["font_size"];
                let collision = CheckCollision(element["x"], element["y"], textWidth, textHeight, mouseX, mouseY, 0, 0);
                if (collision){
                    currentSelection = element["index"];
                    setEdit(true);
                    break;
                }
                else{
                    currentSelection = -1;
                    setEdit(false);
                }
            }
        }
    }
})

canvas.addEventListener("mouseup", e => {
    mouseDown = false;
})

update();