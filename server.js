const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
// const path = require('path');
// const publicPath = path.join(__dirname, '/public');
const app = express();
let server = http.createServer(app);
let io = socketIO(server);

require('dotenv').config();

const { PORT } = process.env;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.get('/', (req, response) => {response.render('index')});

// When new user connects do the following:
io.on('connection', (socket) => {
  console.log('Newuser:', socket.id);
  // playersList.push(socket.id);
  // console.log(playersList);
  
  socket.on('disconnect', () => {console.log('A user disconnected')});

  // socket.emit('player turn', playerTurnObj)

  
  // socket.on('Skip', () => {
  //   skipTurn(socket);
  // });

  // socket.on('Play hand', () => {
  //   evaluateChoice(socket);
  // });
});

server.listen(PORT);