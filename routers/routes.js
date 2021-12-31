/*
 * ========================================================
 * ========================================================
 *
 *    Import logic and data for various socket 'routes'
 *
 * ========================================================
 * ========================================================
 */
const { initGameController, playersData, gameObj } =  require('../controllers/game.js');
const db = require('../models/index');
/*
 * ========================================================
 * ========================================================
 *
 *       'Routes' for various socket 'messages'
 *
 * ========================================================
 * ========================================================
 */
module.exports = (io, app) => {
  const gameController = initGameController(db);

  // Login / Game page route
  app.get('/', (req, response) => {
    response.render('index');
  });

  // 'Routes' for every new user connection
  io.on('connection', (socket) => {
    // Add users socket id to an array
    gameController.addUsersSocketId(socket);
    
    // Send game data to client immediately after they connect
    socket.emit('player turn', gameObj);
   
    // When client tries to sign up, run logic through DB
    socket.on('Sign up', (data) => {
      gameController.signUpAttemptDb(socket, data);
    });

    // When client tries to login, verify details through DB
    socket.on('Login', (data) => {
      console.log(data);
      gameController.loginAttemptDb(socket, data);
    });

    // socket.on('Skip', () => {
    //   skipTurn(socket);
    // });

    // socket.on('Play hand', () => {
    //   evaluateChoice(socket);
    // });

  });
};