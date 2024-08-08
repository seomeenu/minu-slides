const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const fps = 60;
const selectionColor = "#80b3ff";
ctx.textBaseline = "top";

let layerElements = document.getElementById("layer-elements");
let edit = document.getElementById("edit");
let textEdit = document.getElementById("text-edit");
let editText = document.getElementById("text");
let editFontSize = document.getElementById("font-size");
let editBold = document.getElementById("bold");
let editColor = document.getElementById("color");
let editX = document.getElementById("x");
let editY = document.getElementById("y");

let slideElements = document.getElementById("slide-elements");
let editSlideColor = document.getElementById("slide-color");
let editSlideText = document.getElementById("slide-text");

let mouseX = 0;
let mouseY = 0;
let mouseDown = false;

let currentSelection = -1;
let currentSlide = 0;

let slideData = {};

function update(){
    ctx.fillStyle = slideData[currentSlide]["slide_color"];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (i in slideData[currentSlide]["layer"]){
        element = slideData[currentSlide]["layer"][i];
        if (element["type"] == "text"){
            ctx.fillStyle = element["color"];
            let weight = "";
            if (element["is_bold"]){
                weight = "bold ";
            }
            ctx.font = weight+element["font_size"].toString()+"px Pretendard";
            ctx.fillText(element["text"], element["x"], element["y"]);
            if (currentSelection == i) {
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

function setEdit(index){
    currentSelection = index;
    highlightLayer(currentSelection);
    if (index != -1){
        let layer = slideData[currentSlide]["layer"][currentSelection];
        edit.style.display = "block";
        if (layer["type"] == "text"){
            textEdit.style.display = "block";
            editX.value = layer["x"];
            editY.value = layer["y"];
            editText.value = layer["text"];
            editFontSize.value = layer["font_size"];
            editBold.checked = layer["is_bold"];
            editColor.value = layer["color"]; 
        }
    }
    else{
        edit.style.display = "none";
    }
}

function deleteLayer(index){
    layerElements.removeChild(document.getElementById("layer-element-"+index));
    delete slideData[currentSlide]["layer"][index];
}

function createLayerElement(index, newText){
    let layerElement = document.createElement("span");
    layerElement.id = "layer-element-"+index;
    layerElement.className = "layer-element"

    let layerButton = document.createElement("button"); 
    layerButton.innerText = newText["text"]
    layerButton.id = "layer-button-"+index;
    layerButton.onclick = () => {
        setEdit(index);
    };
    layerElement.appendChild(layerButton);

    let deleteButton = document.createElement("button");
    deleteButton.innerText = "🗑️";
    deleteButton.onclick = () => {
        deleteLayer(index);
    }
    layerElement.appendChild(deleteButton);

    let br = document.createElement("br");
    layerElement.appendChild(br);

    return layerElement;
}

function createLayer(){
    let index = Object.keys(slideData[currentSlide]["layer"]).length;
    let newText = {
        "type": "text",
        "text": "텍스트",
        "x": 100,
        "y": 100,
        "font_size": 128,
        "is_bold": false,
        "color": "#111111",
    };
    slideData[currentSlide]["layer"][index] = newText;
    
    layerElements.appendChild(createLayerElement(index, newText));
    setEdit(index);
}

function highlightLayer(index){
    for (i in slideData[currentSlide]["layer"]){
        element = slideData[currentSlide]["layer"][i];
        let styleString = "none";
        if (index == i){
            styleString = "2px solid "+selectionColor;
        }
        document.getElementById("layer-element-"+i).style.border = styleString;
    }    
}

function switchSlide(index){
    layerElements.innerHTML = ""; 
    highlightSlide(index);
    currentSlide = index;
    editSlideColor.value = slideData[index]["slide_color"]
    editSlideText.value = slideData[index]["text"]
    for (i in slideData[index]["layer"]){
        element = slideData[index]["layer"][i];
        layerElements.appendChild(createLayerElement(i, element)); 
    }
}

function createSlideElement(index, newSlide){
    let slideElement = document.createElement("span");
    slideElement.id = "slide-element-"+index;
    slideElement.className = "slide-element"

    let slideButton = document.createElement("button"); 
    slideButton.innerText = newSlide["text"]
    slideButton.id = "slide-button-"+index;
    slideButton.onclick = () => {
        switchSlide(index);
    };
    slideElement.appendChild(slideButton);

    let deleteButton = document.createElement("button");
    deleteButton.innerText = "🗑️";
    deleteButton.onclick = () => {
        deleteSlide(index);
    }
    slideElement.appendChild(deleteButton);
    
    return slideElement
}

function deleteSlide(index){
    if (Object.keys(slideData).length > 1){
        slideElements.removeChild(document.getElementById("slide-element-"+index));
        delete slideData[index];
    }
}

function createSlide(){
    let index = Object.keys(slideData).length;
    let newSlide = {
        "text": "슬라이드",
        "slide_color": "#eeeeee",
        "layer": {}
    }
    slideData[index] = newSlide;
    slideElements.appendChild(createSlideElement(index, newSlide));
    switchSlide(index);
}

function highlightSlide(index){
    for (i in slideData){
        element = slideData[i];
        let styleString = "none";
        if (index == i){
            styleString = "2px solid "+selectionColor;
        }
        document.getElementById("slide-element-"+i).style.border = styleString;
    }    
}

editText.addEventListener("input", e => {
    if (currentSelection != -1){
        let layer = slideData[currentSlide]["layer"][currentSelection]
        let textValue = e.target.value
        layer["text"] = textValue;
        console.log(textValue.length);
        if (textValue.length >= 7){
            textValue = textValue.slice(0, 5)+"..."; 
        }
        document.getElementById("layer-button-"+currentSelection).innerText = textValue;
    }
});
editFontSize.addEventListener("input", e => { 
    if (currentSelection != -1){
        slideData[currentSlide]["layer"][currentSelection]["font_size"] = parseInt(e.target.value);
    }
});
editBold.addEventListener("input", e => { 
    if (currentSelection != -1){
        slideData[currentSlide]["layer"][currentSelection]["is_bold"] = editBold.checked;
    }
});
editColor.addEventListener("input", e => { 
    if (currentSelection != -1){
        slideData[currentSlide]["layer"][currentSelection]["color"] = e.target.value;
    }
});
editX.addEventListener("input", e => { 
    if (currentSelection != -1){
        slideData[currentSlide]["layer"][currentSelection]["x"] = parseInt(e.target.value);
    }
});
editY.addEventListener("input", e => { 
    if (currentSelection != -1){
        slideData[currentSlide]["layer"][currentSelection]["y"] = parseInt(e.target.value);
    }
});
editSlideColor.addEventListener("input", e => { 
    slideData[currentSlide]["slide_color"] = e.target.value;
});
editSlideText.addEventListener("input", e => {
    let slide = slideData[currentSlide]
    slide["text"] = e.target.value;
    document.getElementById("slide-button-"+currentSlide).innerText = e.target.value;
});

canvas.addEventListener("mousemove", e => {
    mouseX = e.offsetX*canvas.width/canvas.clientWidth;
    mouseY = e.offsetY*canvas.height/canvas.clientHeight;
    if (mouseDown){
        let movementX = e.movementX*canvas.width/canvas.clientWidth;
        let movementY = e.movementY*canvas.height/canvas.clientHeight;
        if (currentSelection != -1) {
            let layer = slideData[currentSlide]["layer"][currentSelection]
            layer["x"] += movementX;
            layer["y"] += movementY;
            editX.value = layer["x"];
            editY.value = layer["y"];
        }
    }
})

canvas.addEventListener("mousedown", e => {
    mouseDown = true;
    if (e.button == 0){
        for (i in slideData[currentSlide]["layer"]){
            let layer = slideData[currentSlide]["layer"][i];
            if (layer["type"] == "text"){
                ctx.font = layer["weight"]+" "+layer["font_size"].toString()+"px Pretendard";
                let textWidth = ctx.measureText(layer["text"]).width;
                let textHeight = layer["font_size"];
                let collision = CheckCollision(layer["x"], layer["y"], textWidth, textHeight, mouseX, mouseY, 0, 0);
                if (collision){
                    setEdit(i);
                    break;
                }
                else{
                    setEdit(-1);
                }
            }
        }
    }
}) 

canvas.addEventListener("mouseup", e => {
    mouseDown = false;
})

document.addEventListener("keydown", function(e) {
    if (e.key === 's' && (navigator.userAgent.includes('Mac') ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        // alert('captured');
    }
}, false);

createSlide();
update()