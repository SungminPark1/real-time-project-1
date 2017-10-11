const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');
const ioSockets = require('./ioSockets.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const onRequest = (req, res) => {
  if (req.url === '/bundle.js') {
    fs.readFile(`${__dirname}/../hosted/bundle.js`, (err, data) => {
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.write(data);
      res.end();
    });
  } else {
    fs.readFile(`${__dirname}/../hosted/index.html`, (err, data) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }
};

const app = http.createServer(onRequest);
app.listen(port);
console.log(`Listening on 127.0.0.1: ${port}`);

// pass in the http server into socketio and grab the websocket server as io
const io = socketio(app);

io.sockets.on('connection', (socket) => {
  ioSockets.onJoined(socket, io);
  ioSockets.onMsg(socket, io);
  ioSockets.onDisconnect(socket, io);
});

console.log('websocket server started');
