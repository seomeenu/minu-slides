const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const fps = 60;
const selectionColor = getComputedStyle(document.body).getPropertyValue("--acc");
ctx.textBaseline = "top";

const borderStyle = "2px solid "+selectionColor;
const noBorderStyle = "2px solid #00000000";

let startURL = "";
let saved = document.getElementById("saved");

let layerElements = document.getElementById("layer-elements");
let edit = document.getElementById("edit");
let editLabel = document.getElementById("label");

let textEdit = document.getElementById("text-edit");
let editFontSize = document.getElementById("font-size");
let editBold = document.getElementById("bold");
let editColor = document.getElementById("color");

let editText = document.getElementById("text");
let editX = document.getElementById("x");
let editY = document.getElementById("y");

let imageEdit = document.querySelectorAll("#image-edit");
let editImageURL = document.getElementById("image-url");
let editImageWidth = document.getElementById("image-width");
let editImageHeight = document.getElementById("image-height");

let slideElements = document.getElementById("slide-elements");
let editSlideColor = document.getElementById("slide-color");
let editSlideText = document.getElementById("slide-text");

let mouseX = 0;
let mouseY = 0;
let mouseDown = false;

let currentSelection = -1;
let currentSlide = 0;

let slideData = {};
let imgs = {}

let slideDragElement = null;

// main stuff

function update(){
    ctx.fillStyle = slideData["data"][currentSlide]["slide_color"];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (i in slideData["data"][currentSlide]["layer"]){
        let layer = slideData["data"][currentSlide]["layer"][i];
        let layerWidth = 0;
        let layerHeight = 0; 
        if (layer["type"] == "text"){
            ctx.fillStyle = layer["color"];
            let weight = "";
            if (layer["is_bold"]){w
                weight = "bold ";
            }
            ctx.font = weight+layer["font_size"].toString()+"px Pretendard";
            layerWidth = 0;
            layerHeight = layer["font_size"]; 
            let lines = layer["text"].split("\n");
            for (j=0; j<lines.length; j++){
                line = lines[j];
                ctx.fillText(line, layer["x"], layer["y"]+layerHeight*j);
                layerWidth = Math.max(layerWidth, ctx.measureText(line).width)
            }
            layerHeight *= lines.length;
        }
        else if (layer["type"] == "image" && i in imgs){
            if (layer["url"].trim() != ""){
                if (imgs[i].complete){
                    layerWidth = imgs[i].naturalWidth*layer["width"];
                    layerHeight = imgs[i].naturalHeight*layer["height"];
                    ctx.drawImage(imgs[i], layer["x"], layer["y"], layerWidth, layerHeight);
                }
            }
        }
        if (currentSelection == i) {
            ctx.strokeStyle = selectionColor;
            ctx.lineWidth = 4;
            ctx.strokeRect(layer["x"], layer["y"], layerWidth, layerHeight);
        }
    }
    setTimeout(() => {
        requestAnimationFrame(update);
    }, 1000/fps);
}

function dataToURL(){
    let serializedData = JSON.stringify(slideData["data"]);
    let compressedData = LZString.compressToEncodedURIComponent(serializedData);
    let url = "#"+compressedData;
    window.location.hash = url;
}

function updateStuff(){
    updateSlides();
    switchSlide(currentSlide); 
    updateImgs();
}

function updateImgs(){
    for (i in slideData["data"][currentSlide]["layer"]){
        let layer = slideData["data"][currentSlide]["layer"][i];
        if (layer["type"] == "image"){
            let newImg = new Image();
            newImg.src = layer["url"];
            imgs[i] = newImg;
        }
    }
}

function URLToData(data=null){
    let urlData = location.hash.substring(1);
    if (data != null){
        urlData = data;
    }
    if (!urlData){
        return null;
    }
    let decompressedData = LZString.decompressFromEncodedURIComponent(urlData);
    if (!decompressedData){
        alert("invalid URL!");
        return false;
    }
    try{
        slideData["data"] = JSON.parse(decompressedData);
    }
    catch(e){
        alert("invalid URL! "+e.message);
        return false;
    }
    updateStuff();
    return false;
}

function setStartURL(){
    startURL = location.hash.substring(1);
}

function isStartURL(){
    return location.hash.substring(1) == startURL;
}

function copyData(){
    navigator.clipboard.writeText(location.href);
    saved.classList.remove("saved-blink");
    window.getComputedStyle(saved).opacity;
    saved.classList.add("saved-blink");
}

function newSlide(){
    location.hash = "";
    init(); 
}

function CheckCollision(x1, y1, w1, h1, x2, y2, w2, h2){
    return x1 < x2+w2 &&
           x2 < x1+w1 &&
           y1 < y2+h2 && 
           y2 < y1+h1;
}

function driveURL(){
    let url = prompt();
    if (url.startsWith("https://drive.google.com/file/d/")){
        url = "https://lh3.googleusercontent.com/d/"+url.substring("https://drive.google.com/file/d/".length, url.indexOf("/view?"));
        if (currentSelection != -1){ 
            let layer = slideData["data"][currentSlide]["layer"][currentSelection];
            layer["url"] = url;
            editImageURL.value = url;
        }
        updateImgs();
        dataToURL();
    }
}

function play(){
    canvas.requestFullscreen();
}

// layer stuff

function setEdit(index){
    currentSelection = index;
    highlightLayer(currentSelection);
    textEdit.style.display = "none";
    imageEdit[0].style.display = "none";
    imageEdit[1].style.display = "none";
    if (index != -1){
        let layer = slideData["data"][currentSlide]["layer"][currentSelection];
        edit.style.display = "block";
        window.getComputedStyle(edit).opacity;
        edit.classList.add("popup");
        editLabel.value = layer["label"];
        editX.value = layer["x"];
        editY.value = layer["y"];
        if (layer["type"] == "text"){
            textEdit.style.display = "block";
            editText.value = layer["text"];
            editFontSize.value = layer["font_size"];
            editBold.checked = layer["is_bold"];
            editColor.value = layer["color"]; 
        }
        else if (layer["type"] == "image"){
            imageEdit[0].style.display = "block";
            imageEdit[1].style.display = "block"; 
            editImageURL.value = layer["url"];
            editImageWidth.value = layer["width"];
            editImageHeight.value = layer["height"];
        }
    }
    else{
        edit.style.display = "none";
        edit.classList.remove("popup");
    }
}

function deleteLayer(index){
    layerElements.removeChild(document.getElementById("layer-element-"+index));
    delete slideData["data"][currentSlide]["layer"][index];
    if (currentSelection in slideData["data"][currentSlide]["layer"]){
        setEdit(currentSelection);
    }
    else{
        setEdit(-1);
    }
    dataToURL();
}

function createLayerElement(index, newLayer){
    let layerElement = document.createElement("span");
    layerElement.id = "layer-element-"+index;
    layerElement.classList.add("layer-element");

    let layerButton = document.createElement("button");
    let textValue = newLayer["label"];
    if (textValue.length >= 7){
        textValue = textValue.slice(0, 5)+"..."; 
    }
    layerButton.innerText = textValue;
    layerButton.id = "layer-button-"+index;
    layerButton.onclick = () => {
        setEdit(index);
    };
    layerElement.appendChild(layerButton);

    let deleteButton = document.createElement("button");
    deleteButton.innerText = "🗑️";
    deleteButton.classList.add("delete");
    deleteButton.onclick = () => {
        deleteLayer(index);
    }
    layerElement.appendChild(deleteButton);

    let br = document.createElement("br");
    layerElement.appendChild(br);

    return layerElement;
}

function createLayer(type){
    let index = parseInt(Object.keys(slideData["data"][currentSlide]["layer"]).at(-1))+1;
    if (Object.keys(slideData["data"][currentSlide]["layer"]).length == 0){
        index = 0;
    }
    let newLayer = {
        "type": type,
        "label": "텍스트",
        "x": 100,
        "y": 100,
    }
    if (type == "text"){
        newLayer["text"] = "텍스트 입력";
        newLayer["font_size"] = 128;
        newLayer["is_bold"] = false;
        newLayer["color"] = "#111111";
    }
    if (type == "image"){
        newLayer["url"] = "";
        newLayer["label"] = "🖼️";
        newLayer["width"] = 1;
        newLayer["height"] = 1;
    } 
    slideData["data"][currentSlide]["layer"][index] = newLayer;
    let layerElement = createLayerElement(index, newLayer);
    layerElement.classList.add("before-popup");
    layerElements.appendChild(layerElement);
    window.getComputedStyle(layerElement).opacity;
    layerElement.classList.add("popup");
    setEdit(index);
    dataToURL();
}

function highlightLayer(index){
    for (i in slideData["data"][currentSlide]["layer"]){
        element = slideData["data"][currentSlide]["layer"][i];
        let styleString = noBorderStyle;
        if (index == i){
            styleString = borderStyle;
        }
        document.getElementById("layer-element-"+i).style.border = styleString;
    }    
}

// slide stuff

// function getNearbySlide(dir){
//     let index = 0;
//     if (dir > 0){
//         for (i in slideData["data"]){
//             index = parseInt(i);
//             if (index > currentSlide){
//                 break;
//             }
//         }
//     }
//     else{
//         for (const i of Object.keys(slideData["data"]).reverse()){
//             index = parseInt(i);
//             if (index < currentSlide){
//                 break;
//             }
//         }
//     }
//     return index;
// }

function updateSlides(){
    slideElements.innerHTML = "";
    for (i in slideData["data"]){
        let slide = slideData["data"][i]; 
        let slideElement = createSlideElement(i, slide);
        slideElements.appendChild(slideElement); 
    }
}

function switchSlide(index){
    // if (!(index in slideData["data"])){
    //     index = -1;
    // }
    // if (index == -1){
    //     index = getNearbySlide(1);
    // }
    layerElements.innerHTML = ""; 
    highlightSlide(index);
    currentSlide = index;
    editSlideColor.value = slideData["data"][index]["slide_color"];
    editSlideText.value = slideData["data"][index]["text"];
    for (i in slideData["data"][index]["layer"]){
        let layer = slideData["data"][index]["layer"][i]; 
        let layerElement = createLayerElement(i, layer)
        layerElements.appendChild(layerElement);
    }
    setEdit(-1);
    dataToURL();
}

function slideDragStart(e){
    slideDragElement = this;
    e.dataTransfer.effectAllowed = "move";
}
function slideDrop(e){
    e.stopPropagation(); 
    if (slideDragElement != this){
        let index = parseInt(slideDragElement.id.split("-")[2]);
        let otherIndex = parseInt(this.id.split("-")[2]);
        let slide = slideData["data"].splice(index, 1);
        slideData["data"].splice(otherIndex, 0, slide[0]);
        updateSlides();
        switchSlide(otherIndex);
    } 
    return false;
} 
function slideDragOver(e){
    e.preventDefault();
    return false;
}

function createSlideElement(index, newSlide){
    let slideElement = document.createElement("span");
    slideElement.id = "slide-element-"+index;
    slideElement.classList.add("slide-element");
    slideElement.draggable = true;

    slideElement.addEventListener("dragstart", slideDragStart);
    slideElement.addEventListener("drop", slideDrop);
    slideElement.addEventListener("dragover", slideDragOver);

    let slideButton = document.createElement("button"); 
    slideButton.innerText = newSlide["text"]
    // slideButton.id = "slide-button-"+index;
    slideButton.id = "slide-button";
    slideButton.onclick = function(){ 
        switchSlide(parseInt(this.parentElement.id.split("-")[2]));
    };
    slideElement.appendChild(slideButton);

    let deleteButton = document.createElement("button");
    deleteButton.innerText = "🗑️";
    deleteButton.classList.add("delete");
    deleteButton.onclick = function(){ 
        deleteSlide(parseInt(this.parentElement.id.split("-")[2]));
    };
    slideElement.appendChild(deleteButton);
    
    return slideElement
}

function setSlideIndex(index, newIndex){
    // console.log(index, newIndex)
    let slideElement = document.getElementById("slide-element-"+index);
    slideElement.id = "slide-element-"+newIndex;
}

function deleteSlide(index){
    index = parseInt(index);
    let len = slideData["data"].length-1;
    if (len+1 > 1){
        slideElements.removeChild(document.getElementById("slide-element-"+index)); 
        slideData["data"].pop(index)
        for (i=index+1; i<len+1; i++){
            setSlideIndex(i, i-1);
        }
        if (currentSlide >= len-1){
            switchSlide(len-1);
        }
        else{
            switchSlide(currentSlide);
        }
    }
    dataToURL();
}

function createSlide(){
    // let index = parseInt(Object.keys(slideData["data"]).at(-1))+1;
    // if (Object.keys(slideData["data"]).length == 0){
    //     index = 0;
    // }
    let newSlide = {
        "text": "슬라이드",
        "slide_color": "#eeeeee",
        "layer": {}
    }

    
    slideData["data"].push(newSlide);
    let len = slideData["data"].length;
    let slideElement = createSlideElement(len-1, newSlide);
    
    slideElement.classList.add("before-popup");
    slideElements.appendChild(slideElement);
    window.getComputedStyle(slideElement).opacity;
    slideElement.classList.add("popup");
    switchSlide(len-1); 
    dataToURL();
}

function highlightSlide(index){
    for (i in slideData["data"]){ 
        let styleString = noBorderStyle;
        if (index == i){
            styleString = borderStyle;
        }
        document.getElementById("slide-element-"+i).style.border = styleString;
    }
}

//events

editLabel.addEventListener("input", e => {
    if (currentSelection != -1){
        let layer = slideData["data"][currentSlide]["layer"][currentSelection];
        let textValue = e.target.value;
        layer["label"] = textValue;
        if (textValue.length >= 7){
            textValue = textValue.slice(0, 5)+"..."; 
        }
        document.getElementById("layer-button-"+currentSelection).innerText = textValue;
        dataToURL();
    }
});
editText.addEventListener("input", e => {
    if (currentSelection != -1){
        let layer = slideData["data"][currentSlide]["layer"][currentSelection];
        let textValue = e.target.value;
        layer["text"] = textValue;
        dataToURL();
    }
});
editFontSize.addEventListener("input", e => { 
    if (currentSelection != -1){
        slideData["data"][currentSlide]["layer"][currentSelection]["font_size"] = parseInt(e.target.value);
        dataToURL();
    }
});
editBold.addEventListener("input", e => { 
    if (currentSelection != -1){
        slideData["data"][currentSlide]["layer"][currentSelection]["is_bold"] = editBold.checked;
        dataToURL();
    }
});
editColor.addEventListener("input", e => { 
    if (currentSelection != -1){
        slideData["data"][currentSlide]["layer"][currentSelection]["color"] = e.target.value;
        dataToURL();
    }
});
editX.addEventListener("input", e => { 
    if (currentSelection != -1){
        slideData["data"][currentSlide]["layer"][currentSelection]["x"] = parseInt(e.target.value);
        dataToURL();
    }
});
editY.addEventListener("input", e => { 
    if (currentSelection != -1){
        slideData["data"][currentSlide]["layer"][currentSelection]["y"] = parseInt(e.target.value);
        dataToURL();
    }
});
editSlideColor.addEventListener("input", e => { 
    // console.log(currentSlide);
    slideData["data"][currentSlide]["slide_color"] = e.target.value;
    dataToURL();
});
editSlideText.addEventListener("input", e => {
    let slide = slideData["data"][currentSlide]
    slide["text"] = e.target.value;
    document.getElementById("slide-element-"+currentSlide).querySelector("#slide-button").innerText = e.target.value;
    dataToURL();
});
editImageURL.addEventListener("input", e => {
    if (currentSelection != -1){
        let layer = slideData["data"][currentSlide]["layer"][currentSelection];
        let textValue = e.target.value;
        layer["url"] = textValue;
    }
    dataToURL();
}); 
editImageWidth.addEventListener("input", e => {
    if (currentSelection != -1){
        let layer = slideData["data"][currentSlide]["layer"][currentSelection];
        layer["width"] = editImageWidth.value; 
    }
    dataToURL();
});
editImageHeight.addEventListener("input", e => {
    if (currentSelection != -1){
        let layer = slideData["data"][currentSlide]["layer"][currentSelection];
        layer["height"] = editImageHeight.value; 
    }
    dataToURL();
});
editImageURL.addEventListener("focusout", e => {
    updateImgs();
});
 
canvas.addEventListener("mousemove", e => {
    if (document.fullscreenElement != null){
        return;
    }
    mouseX = e.offsetX*canvas.width/canvas.clientWidth;
    mouseY = e.offsetY*canvas.height/canvas.clientHeight;
    if (mouseDown){
        let movementX = e.movementX*canvas.width/canvas.clientWidth;
        let movementY = e.movementY*canvas.height/canvas.clientHeight;
        if (currentSelection != -1) {
            let layer = slideData["data"][currentSlide]["layer"][currentSelection]
            layer["x"] += movementX;
            layer["y"] += movementY;
            editX.value = layer["x"];
            editY.value = layer["y"];
        }
    }
})

canvas.addEventListener("mousedown", e => {
    mouseDown = true;
    if (document.fullscreenElement != null){
        return;
    }
    if (e.button == 0){
        for (i in slideData["data"][currentSlide]["layer"]){
            let layer = slideData["data"][currentSlide]["layer"][i];
            let layerWidth = 0;
            let layerHeight = 0; 
            if (layer["type"] == "text"){
                ctx.font = layer["weight"]+" "+layer["font_size"].toString()+"px Pretendard";
                layerWidth = 0;
                layerHeight = layer["font_size"]; 
                let lines = layer["text"].split("\n");
                for (j=0; j<lines.length; j++){
                    line = lines[j];
                    layerWidth = Math.max(layerWidth, ctx.measureText(line).width)
                }
                layerHeight *= lines.length;
            }
            else if (layer["type"] == "image"){
                if (layer["url"].trim() != ""){
                    if (imgs[i].complete){ 
                        layerWidth = imgs[i].naturalWidth*layer["width"];
                        layerHeight = imgs[i].naturalHeight*layer["height"];
                    }
                }
            }
            let collision = CheckCollision(layer["x"], layer["y"], layerWidth, layerHeight, mouseX, mouseY, 0, 0);
            if (collision){
                setEdit(i);
                break;
            }
            else{
                setEdit(-1);
            }
        }
    } 
}) 

canvas.addEventListener("mouseup", e => {
    mouseDown = false; 
    if (document.fullscreenElement != null){
        return;
    }
    dataToURL();
})

document.addEventListener("keydown", e => {
    if (e.key == "s" && (navigator.userAgent.includes("Mac") ? e.metaKey : e.ctrlKey)) { 
        e.preventDefault();
    }
    if (e.key == "z" && (navigator.userAgent.includes("Mac") ? e.metaKey : e.ctrlKey)) {
        if (!isStartURL()){
            history.back();
        }
        URLToData();
    }
    if (e.key == "y" && (navigator.userAgent.includes("Mac") ? e.metaKey : e.ctrlKey)) { 
        history.forward(); 
        URLToData();
    }
    // if (e.key == "ArrowRight"){
    //     switchSlide(getNearbySlide(1));
    // }
    // if (e.key == "ArrowLeft"){
    //     switchSlide(getNearbySlide(-1));
    // }
});

// init

function init(){
    slideData = {
        "data": []
    }; 
    imgs = {};
    if (URLToData() == null){
        createSlide();
    }
    setStartURL();
    updateStuff();
}
init();
update();