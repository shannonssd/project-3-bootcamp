/*
 * ========================================================
 * ========================================================
 *
 *    Import logic and data for various socket 'routes'
 *
 * ========================================================
 * ========================================================
 */
const { initGameController, playersData, playerTurnObj } =  require('../controllers/game.js');

/*
 * ========================================================
 * ========================================================
 *
 *       'Routes' for various socket 'messages'
 *
 * ========================================================
 * ========================================================
 */
module.exports = (io) => {
  const gameController = initGameController();

  io.on('connection', (socket) => {
    console.log('Newuser:', socket.id);
    gameController.createNewUser(socket);
    
    // Send game data to client immediately after they connect
    socket.emit('player turn', playerTurnObj);
   
    
    // socket.on('Skip', () => {
    //   skipTurn(socket);
    // });

    // socket.on('Play hand', () => {
    //   evaluateChoice(socket);
    // });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
};