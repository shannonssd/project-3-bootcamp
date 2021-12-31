const socket = io();

// ========================================================   LOGIN FRONT-END LOGIC   ========================================================
/*
 * ========================================================
 * ========================================================
 *
 *         Global variables for login HTML elements
 *
 * ========================================================
 * ========================================================
 */
let username = '';
let password = '';
const signUpButton = document.getElementById('signup-btn');
const loginButton = document.getElementById('login-btn');

/*
 * ========================================================
 * ========================================================
 * 
 *      On click of sign up button, verify data in DB 
 *              and inform user of outcome
 *
 * ========================================================
 * ========================================================
 */
const signUpAttempt = () => {
  username = document.getElementById('username');
  password = document.getElementById('password');

  const data = {
    username: username.value,
    password: password.value,
  };

  try {
    // Send user sign up data to server for verification and creation
    socket.emit('Sign up', data);

    // Inform user if sign up successful
    socket.on('Sign up success', () => {
      username.value = '';
      password.value = '';
      const loginMessage = document.getElementById('login-message');
      loginMessage.innerText = 'Sign up successful, please login!';
    });

    // Inform user if username already exists
    socket.on('User exists', () => {
      username.value = '';
      password.value = '';
      const loginMessage = document.getElementById('login-message');
      loginMessage.innerText = 'Username taken. Please try a different username.';
    });
  } catch(error)  {
    // handle error
    console.log('Error:', error);
  };
};

/*
 * ========================================================
 * ========================================================
 * 
 *       On click of login button, verify data in DB 
 *             and inform user of outcome
 *
 * ========================================================
 * ========================================================
 */
const loginAttempt = () => {
  username = document.getElementById('username');
  password = document.getElementById('password');

  const data = {
    username: username.value,
    password: password.value,
  };
  try {
    // Send user sign up data to server for verification
    socket.emit('Login', data);

    // If login successful, show game display
    socket.on('Login successful', () => {
      username.value = '';
      password.value = '';

      // Use DOM to show game display and hide login displace
      const loginDisplay = document.getElementById('account');
      const gameDisplay = document.getElementById('game');
      loginDisplay.style.display = 'none';
      gameDisplay.style.display = 'block';
    });

    // Inform user if username or password was incorrect
    socket.on('Invalid login', () => {
      username.value = '';
      password.value = '';
      const loginMessage = document.getElementById('login-message');
      loginMessage.innerText = 'Invalid login. Please try again.';
    });
  } catch(error)  {
    // handle error
    console.log('Error:', error);
  };
};

/*
 * ========================================================
 * ========================================================
 *
 *           Event listener for login buttons
 *
 * ========================================================
 * ========================================================
 */
signUpButton.addEventListener('click', signUpAttempt);
loginButton.addEventListener('click', loginAttempt);

// ========================================================   GAME FRONT-END LOGIC   ========================================================
/*
 * ========================================================
 * ========================================================
 *
 *         Global variables for game HTML elements
 *
 * ========================================================
 * ========================================================
 */
// let currentGame = null;
const playButton = document.getElementById('play-button');
const skipButton = document.getElementById('skip-button');

/*
 * ========================================================
 * ========================================================
 *
 *      Show / Hide game buttons based on players turn
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

// Function to alter button visibility based on socket id & users turn
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
