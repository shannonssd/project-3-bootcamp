const socket = io();

/*
 * ========================================================
 * ========================================================
 *
 *            Global variables for HTML elements
 *
 * ========================================================
 * ========================================================
 */
const playButton = document.getElementById('play-button');
const skipButton = document.getElementById('skip-button');

/*
 * ========================================================
 * ========================================================
 *
 *      Show / Hide buttons based on players turn
 *
 * ========================================================
 * ========================================================
 */
// Hide buttons if it is not player's turn 
const hideBtn = () => {
  playButton.style.display = 'none';
  skipButton.style.display = 'none';
};
// Show buttons if it is player's turn 
const showBtn = () => {
  playButton.style.display = 'block';
  skipButton.style.display = 'block';
};

// Function to alter button visibility based on socket id
const alterBtnVisibility = (playerTurnObj) => {
  if(!(socket.id === playerTurnObj.playersData[playerTurnObj.playerTurn].socketId)) {
    console.log('hide')
    hideBtn();
  }
  if(socket.id === playerTurnObj.playersData[playerTurnObj.playerTurn].socketId) {
    console.log('show');
    showBtn();
  }
};

// On response from server - Alter button visibility based on socket id
socket.on('player turn', (playerTurnObj) => {
  alterBtnVisibility(playerTurnObj);
});
