const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const { assert } = require('console');
const io = new Server(server);

const port = process.env.PORT || 3000;


app.use(express.static('public'));

var currentModel = "ammonitModel2";
var labels = [];

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit('current model', currentModel)
    socket.emit('labels', labels)

    socket.on('current model', (modelId) => {
        // first validate modelId schema!!!
        if (typeof (modelId) === "string" && currentModel !== modelId) {
            labels = [];
            currentModel = modelId;
            io.emit('current model', modelId)
            io.emit('labels', labels)
        }
    });
    socket.on('add label', (label) => {
        
        // first validate label schema!!!
        // point1: string, point2: string, text: string
        var valid = typeof(label) === "object"
        if(!valid) return
        valid = Object.keys(label).length === 3
        if(!valid) return
        valid = label.hasOwnProperty("point1") && label.hasOwnProperty("point2") && label.hasOwnProperty("text")
        if(!valid) return
        valid = typeof(label.point1) === "string" && typeof(label.point2) === "string" && typeof(label.text) === "string"
        if(!valid) return
        valid = label.point1.length <= 80 && label.point2.length <= 80 && label.text.length <= 200
        if(!valid) return
        
        if (labels.length > 20) {
            labels.shift()
        }
        labels.push(label)
        io.emit('labels',labels)
        //io.emit('add label', label)
    })
});

server.listen(port, () => {
    console.log(`Example app running at http://localhost:${port}`);
})
