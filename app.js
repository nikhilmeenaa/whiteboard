const express = require('express');
const app = express();
const router = require('./routes/router.js');
const path = require('path');


require('./Database/connect');

// Socket.IO
const http = require('http').Server(app);
const io = require('socket.io')(http);

// Paths
const viewsPath = path.join(__dirname , './templates/views');
const publicPath = path.join(__dirname , './public');

app.use(express.json());
app.use(express.urlencoded({extended:false}));
// routing
app.use(express.static(publicPath));

app.set('view engine' , 'hbs');
app.set('views' , viewsPath);

app.use(router);

http.listen(3000 , ()=>{
    console.log("Server is running at 3000...");
});



// Socket Code
io.on('connect' , async (socket) => {
    console.log('A User connected');

    socket.on('disconnect' , ()=>{
        console.log("User disconnected");
    });

    await socket.on("newElement" , async (element)=>{
        await socket.broadcast.emit('newElement' , element);
    });

    await socket.on('clearCanvas' , async()=>{
        await socket.broadcast.emit('clearCanvas');
    })

    await socket.on('undo' , async()=>{
        await socket.broadcast.emit('undo');
    });

    await socket.on('redo' , async()=>{
        await socket.broadcast.emit('redo');
    });

});


