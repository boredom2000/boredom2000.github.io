const express = require('express');
const path = require('path');
const http = require('http');
const PORT = process.env.PORT || 3000;
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//set static folder
app.use(express.static(path.join(__dirname, "public")));

server.listen(PORT, () => console.log('server running on port ' + PORT));


//handle a socket connection

io.on('connection', socket =>
{
    console.log('new ws connection');
});