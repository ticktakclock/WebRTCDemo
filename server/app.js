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
    console.log('room name:' + socket.roomname + ', id:' + socket.id);
    io.emit('RECEIVE_MOUSE_EVENT', data);
  });

  socket.on('SEND_ENTER', function(roomname) {
    socket.join(roomname);
    console.log('id=' + socket.id + ' enter room:' + roomname);
    socket.roomname = roomname;
    socket.broadcast
      .to(socket.roomname)
      .emit('RECEIVE_CALL', { id: socket.id });
  });

  socket.on('SEND_LEAVE', function(roomname) {
    console.log(
      new Date() +
        ' Peer disconnected. id:' +
        socket.id +
        ', room:' +
        socket.roomname
    );
    if (socket.roomname) {
      socket.broadcast
        .to(socket.roomname)
        .emit('RECEIVE_LEAVE', { id: socket.id });
      socket.leave(socket.roomname);
    }
  });

  socket.on('SEND_CALL', function() {
    console.log('call from:' + socket.id + ', room:' + socket.roomname);
    socket.broadcast
      .to(socket.roomname)
      .emit('RECEIVE_CALL', { id: socket.id });
  });

  socket.on('SEND_CANDIDATE', function(data) {
    console.log('candidate from:' + socket.id + ', room:' + socket.roomname);
    console.log('candidate target:' + data.target);
    if (data.target) {
      data.ice.id = socket.id;
      socket.to(data.target).emit('RECEIVE_CANDIDATE', data.ice);
    } else {
      console.log('candidate need target id');
    }
  });

  socket.on('SEND_SDP', function(data) {
    console.log(data);
    console.log(
      'sdp ' + data.sdp.type + ', from:' + socket.id + ', to:' + data.target
    );
    data.sdp.id = socket.id;
    if (data.target) {
      socket.to(data.target).emit('RECEIVE_SDP', data.sdp);
    } else {
      socket.broadcast.to(socket.roomname).emit('RECEIVE_SDP', data.sdp);
    }
  });

  socket.on('SEND_FULLSCREEN', function(data) {
    data.id = socket.id;
    console.log('full screen id: ' + data.id + ', room:' + socket.roomname);
    io.to(socket.roomname).emit('RECEIVE_FULLSCREEN', data);
  });
});
