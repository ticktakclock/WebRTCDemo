var express = require('express');
var socket = require('socket.io');
var serveIndex = require('serve-index');

var app = express();
var port_client = 9080;
var port_server = 9090;

// static hosting
app
  .use(express.static('../public'))
  .use(serveIndex('../public', { icons: true }))
  .listen(process.env.PORT || port_client);

// websocket
const server = app.listen(port_server, function() {
  console.log('server is running on port 9090');
});

const io = socket(server);

io.on('connection', socket => {
  console.log(socket.id);
  socket.emit('RECEIVE_CONNECTED', { id: socket.id });

  socket.on('SEND_MOUSE_EVENT', function(data) {
    console.log(data);
    console.log('room name=' + socket.roomname + ', id=' + socket.id);
    io.emit('RECEIVE_MOUSE_EVENT', data);
  });
});
