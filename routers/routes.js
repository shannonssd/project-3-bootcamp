/*
 * ========================================================
 * ========================================================
 *
 *    Import controller and DB for various socket 'routes'
 *
 * ========================================================
 * ========================================================
 */
const { initGameController } =  require('../controllers/game.js');
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
    // Add new users socket id to an array
    gameController.addUsersSocketId(socket);
   
    // When client tries to sign up, run logic through DB
    socket.on('Sign up', (data) => {
      gameController.signUpAttemptDb(socket, data);
    });

    // When client tries to login, verify details through DB
    socket.on('Login', (data) => {
      gameController.loginAttemptDb(socket, data);
    });

    // When user tries to play a hand, evaluate attempt 
    socket.on('Play hand', (gameData) => {
      gameController.evaluateChoice(socket, gameData);
    });

    // When user skips turn, add a card to their hand
    socket.on('Skip turn', (gameData) => {
      gameController.skipTurn(socket, gameData);
    });
  });
};