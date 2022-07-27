// import('./fabric.min');
console.log("Hello Brother");
const brushColor = 'hotpink';
const brushSize = 30;
const colorPicker = document.getElementById("colorPicker");
const bgColorPicker = document.getElementById("bgColorPicker");
const select = document.getElementsByTagName("select");
const roomName = document.getElementById("roomName");
const joinButton = document.getElementById("joinRoom");

// This returns a canvas
const makeCanvas = (id)=>{
    return new fabric.Canvas(id, {
      backgroundColor: "#f6f6f6",
      height : 1 * window.innerHeight , 
      width : 1 * window.innerWidth , 
      selection: false, // this is for avoiding selection in canvas
      isDrawingMode : true ,
      backgroundColor : "black" , 
});
}

// Sets background image of canvas passed with image url given
const setBackgroundImage = (url,passedCanvas) =>{
    fabric.Image.fromURL(
      url,
      (img) => {
        passedCanvas.backgroundImage = img;
        passedCanvas.renderAll();
      }
    );
}

const canvas = makeCanvas('canvas');
canvas.freeDrawingBrush.color = "white";
canvas.freeDrawingBrush.width = 3;

// Modes 

let currentMode = "drawing";
let currentBrushWidth = 2;
let queue = [];
let bgColor = "black";

const modes = {
    pan : "pan" , 
    drawing : "drawing" , 
    default : '' , 
    eraser : "eraser" , 
    a1 : 10 , a2 : 20 , a3 : 40 , a4 : 60 , a5 : 100 , 
}


function panToggle(mode)
{
    currentMode = mode;
    canvas.renderAll();

    if(currentMode == modes.drawing)
    {
        canvas.freeDrawingBrush.color = "cyan";
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.width = currentBrushWidth;
        canvas.renderAll();
    }

    else if(currentMode == modes.eraser)
    {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.color = bgColor;
        canvas.freeDrawingBrush.width = 40;
        canvas.renderAll();
    }

    // else if(currentMode == modes.pan)
    // {
    //     // console.log(canvas.freeDrawingBrush.color);
    //     console.log('pan mode');
    //     canvas.isDrawingMode = false;
    //     canvas.setCursor("grab");
    //     canvas.renderAll(); 
    // }

    // else if(mode == modes.default)
    // {
    //     canvas.isDrawingMode = false;
    //     canvas.renderAll(); 
    // }

    else if( 0<=mode<=50 )
    {
        // console.log("he we are");
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.color = bgColor;
        canvas.freeDrawingBrush.width = mode;
        canvas.renderAll(); 
    }
}


function changeOption(event){
    console.log("we are here");
    // console.log(event.target.value)
    canvas.renderAll();
    const value = event.target.value;
    canvas.isDrawingMode = true;
    currentBrushWidth = value ;
    canvas.freeDrawingBrush.width = value;
    canvas.renderAll(); 
};


colorPicker.addEventListener("input" , ()=>
{
    // console.log(currentBrushWidth);
    currentMode = modes.drawing;
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.color = colorPicker.value;   
    canvas.freeDrawingBrush.width = currentBrushWidth;
    canvas.renderAll(); 
});

// bgColorPicker.addEventListener("input" , ()=>{
//     // console.log("where we are");
//     canvas.backgroundColor = bgColorPicker.value;
//     bgColor = bgColorPicker.value;
//     canvas.renderAll();
// });

function penSize(value)
{
    canvas.isDrawingMode = true;
    currentBrushWidth = value ;
    canvas.freeDrawingBrush.width = value;
    canvas.renderAll(); 
}


function troubleShoot()
{
    // console.log("here in troubleShoot");
    const temp = [];
    while(canvas._objects.length > 0)
    {   
        temp.push(canvas._objects.pop());
    }
    while(temp.length > 0)
    {   
        canvas._objects.push(temp.pop());
    }
    canvas.renderAll(); 
}



let mouseDown = false;

canvas.on("mouse:move" , (event)=>{

    // if(mouseDown && currentMode == modes.pan)
    // {
    //     // console.log("panning");
    //     // console.log(canvas.freeDrawingBrush.color);
    //     // console.log(canvas.isDrawingMode);
    //     canvas.setCursor("grabbing");
    //     // canvas.renderAll(); 
    //     const mEvent = event.e;
    //     const delta = new fabric.Point(mEvent.movementX , mEvent.movementY);
    //     canvas.relativePan(delta);
    //     canvas.renderAll(); 
    // }
    if(mouseDown && currentMode == modes.drawing)
    {
        canvas.isDrawingMode = true;
        canvas.renderAll();
    }

    else if(mouseDown && (currentMode == modes.drawing || currentMode == modes.eraser) )
    {
        queue = [];
        canvas.renderAll(); 
    }


});

let stored  = undefined ;
let transformed = undefined;
let bgImg = undefined;

canvas.on("mouse:down" ,()=>{
    mouseDown = true;
    // if(currentMode == modes.pan)
    // {
    //     canvas.setCursor("grab");
    //     canvas.renderAll();
    // }


    // async function strange()
    // {
    //     canvas.getActiveObjects().forEach(element => {
    //         console.log(element);
    //         transformed = element;
    //         stored  = element.clone();
    //     });;
    // }

    // if(currentMode == '')
    // strange();


} );










const socket = io();

socket.on("connect" , ()=>{
    console.log(socket.id);
});



let recent = undefined;

canvas.on("mouse:up" , ()=>{
    mouseDown = false;
    if(currentMode == modes.pan)
    {
        canvas.setCursor("grab");
        canvas.renderAll(); 
    }

    const json = JSON.stringify(recent);
    socket.emit('newElement' , json);
});






// CLEARING CANVAS

async function clearCanvas()
{   
    // console.log("here we are");
    socket.emit('clearCanvas');
    canvas.getObjects().forEach(obj => {
        canvas.remove(obj);
    });
}

socket.on('clearCanvas' , ()=>{
    canvas.getObjects().forEach(obj => {
        canvas.remove(obj);
    });
});

const elementAdded = function(obj) {

    recent = obj.target;
};

socket.on('newElement' , async (json)=>{

    var circle = new fabric.Circle({
        radius: 50, fill: 'transparent', left: 50, top: 50
    });
    await canvas.add(circle);
    await canvas.renderAll();

    // Parse JSON and single object to canvas
    var jsonObj = JSON.parse(json);
    fabric.util.enlivenObjects([jsonObj], function (enlivenedObjects) {
        canvas.add(enlivenedObjects[0]);
        canvas.renderAll();
    }); 
    // canvas.renderAll();
    canvas.remove(circle);
    canvas.renderAll();

});

function doUndo(){
    if(canvas._objects.length>0)
    {
        queue.push( canvas._objects.pop() );
        socket.emit('undo');
        canvas.renderAll();
    }
}

function doRedo()
{
    if(queue.length > 0)
    {
        canvas._objects.push(queue.pop());
        socket.emit('redo');
        canvas.renderAll();
    }
}


socket.on('undo' , ()=>{
    if(canvas._objects.length>0)
    {
        queue.push( canvas._objects.pop() );
        canvas.renderAll();
    }
});

socket.on('redo' , ()=>{
    if(queue.length > 0)
    {
        canvas._objects.push(queue.pop());
        canvas.renderAll();
    }
});


canvas.on('object:added', elementAdded);


joinButton.addEventListener("click" , ()=>{
    const name = roomName.value;
    console.log(name);
    if( name == '' )return;
    socket.emit('joinRoom' , name);

});

socket.on("joinResult" , (data)=>{
    console.log(data);
});
















// Background Image Saving

// function saveBgImage()
// {
//     bgImg = canvas.toDataURL("image/png");
// }

// function saveBgRImage()
// {
//     let image = new Image();
//     image.onload = function () {

//         var f_img = new fabric.Image(image);
//         canvas.setBackgroundImage(f_img);
//         canvas.renderAll();
//         // context.drawImage(image, 0, 0);
//     };
//     image.src = bgImg;
// }





// SAVING AND LOADING CANVAS

// async function saveState()
// {
//     let json = await JSON.stringify(canvas.toJSON());
//     // console.log(json);

//     fetch("/canvasdata" , {
//         method : "POST" , 
//         body : json, 
//         headers : {
//             "Content-Type" : "application/json" 
//         }
//     })

//     .then((res)=>{
//         console.log(res.text());
//         // console.log("Successfully saved canvas data");
//     })
//     .catch((error)=>{
//         console.log("Some Error Occured : " , error);
//     })

// };

// async function loadCanvasData()
// {
//     const res = await fetch('/canvasdata');
//     const data = await res.json();
//     delete data._id;
//     // console.log(data);

//     canvas.loadFromJSON(data);

//   canvas.renderAll();
    
// }