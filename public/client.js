const socket = io();
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
let currentGameId = 0;
const playButton = document.getElementById('play-button');
const skipButton = document.getElementById('skip-button');

// Global variable to store card that user wants to play
let userCardToPlay = [];
// Global variable to store rest of players hand
let alteredPlayerHand = [];
// Global variable to store index of previously selected card
let previousSelectedCardIndex = '';

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
const alterBtnVisibility = (gameObj) => {
  // If not players turn, hide gameplay buttons
  if(!(socket.id === gameObj.playersData[gameObj.playerTurn].socketId)) {
    hideBtn();
  }
  // If players turn, show gameplay buttons
  if(socket.id === gameObj.playersData[gameObj.playerTurn].socketId) {
    showBtn();
  }
};

/*
 * ========================================================
 * ========================================================
 *
 *       Logic if a player uses up cards and wins
 *
 * ========================================================
 * ========================================================
 */
const gameOver = (data) => {
  // Inform all players that someone won
  const userMessage = document.getElementById('user-message');
  userMessage.innerText = `${data.winner}`;
  // Hide all buttons
  hideBtn();
}

socket.on('Game over', (data) => {
  gameOver(data);
});

/*
 * ========================================================
 * ========================================================
 *
 *          Game Buttons Helper Functions
 *
 * ========================================================
 * ========================================================
 */
const pressPlayBtn = () => {
  const gameData = {
    userCardToPlay: userCardToPlay[userCardToPlay.length - 1],
    alteredPlayerHand,
    currentGameId,
  }  
  socket.emit('Play hand', gameData);
  
  socket.on('Invalid play', () => {
    // Inform player of invalid play
    const userMessage = document.getElementById('user-message');
    userMessage.innerText = "Invalid play! Please choose another card or skip your turn!";
    // Show that card entry has been unselected
    const previousPlayMessage = document.querySelector(`.user-play${previousSelectedCardIndex}`);
    previousPlayMessage.style.display = 'none';
  });
};

const pressSkipBtn = () => {
  const gameData = {
    currentGameId,
  }  
  socket.emit('Skip turn', gameData);
};

/*
 * ========================================================
 * ========================================================
 *
 *        Event listener for game buttons
 *
 * ========================================================
 * ========================================================
 */
  playButton.addEventListener('click', pressPlayBtn);

  skipButton.addEventListener('click', pressSkipBtn);

  /*
  * ========================================================
  * ========================================================
  *
  *       Show new cards if player is forced to draw 2
  *
  * ========================================================
  * ========================================================
  */
  socket.on('Draw 2', (hiddenInfoGameObj) => {
    // Find users cards in object
    let playerHand = [];
    for (let i = 0; i < hiddenInfoGameObj.playersData.length; i += 1) {
      if (hiddenInfoGameObj.playersData[i].socketId === socket.id) {
        playerHand = hiddenInfoGameObj.playersData[i].playerHand;
      }
    }
    // Reset global variables
    userCardToPlay = [];
    alteredPlayerHand = [];
    previousSelectedCardIndex = '';
    // Generate display with new cards
    createUserCard(playerHand);
  });

 /*
  * ========================================================
  * ========================================================
  *
  *      Show new cards if players play was succesful
  *
  * ========================================================
  * ========================================================
  */
socket.on('Valid play', (hiddenGameObj) => {
  // Reset global variables
  userCardToPlay = [];
  alteredPlayerHand = [];
  previousSelectedCardIndex = '';

  // Find users cards in object
    let playerHand = [];
    for (let i = 0; i < hiddenGameObj.playersData.length; i += 1) {
      if (hiddenGameObj.playersData[i].socketId === socket.id) {
        playerHand = hiddenGameObj.playersData[i].playerHand;
      }
    }
    // Generate display with new cards
    createUserCard(playerHand);
  });

  /*
  * ========================================================
  * ========================================================
  *
  * Refresh all opponents cards if players play was succesful
  *
  * ========================================================
  * ========================================================
  */
  socket.on('Round completed', (hiddenGameObjAll) => {
    generateOpponentCardsAndName(hiddenGameObjAll);
    // Allow next player to see btn and make a play
    alterBtnVisibility(hiddenGameObjAll);
    // Update discard pile card
    createDiscardCard(hiddenGameObjAll.discardCardPile);
    // Update game message to players
    const userMessageToPlayers = document.getElementById('user-message');
    userMessageToPlayers.innerText = `${hiddenGameObjAll.message}`;
  });

/*
 * ========================================================
 * ========================================================
 * 
 *    Generate players cards and opponent name displays
 *
 * ========================================================
 * ========================================================
 */
// Genereate opponents cards using DOM
const createOpponentCard = () => {
  const outerCardDiv = document.createElement('div');
  outerCardDiv.classList.add('opponent-card-outer');
  const innerCardDiv = document.createElement('div');
  innerCardDiv.classList.add('opponent-card-inner');
  const cardText = document.createElement('div');
  cardText.classList.add('card-text');
  cardText.innerText = 'OH NO!';
  innerCardDiv.appendChild(cardText);
  outerCardDiv.appendChild(innerCardDiv);
  return outerCardDiv;
};

// Genereate discard pile card using DOM
const createDiscardCard = (discardCardPile) => {
  const card = discardCardPile[discardCardPile.length - 1];
  const discardContainer = document.getElementById('discard-container');
  discardContainer.innerText = '';
  if (card.rank <= 9) {
    const outerCard = document.createElement('div');
    outerCard.classList.add('card'); 
    outerCard.classList.add(`num-${card.rank}`); 
    outerCard.classList.add(`${card.colour}`); 
    const inner = document.createElement('div');
    inner.classList.add('inner'); 
    const mark = document.createElement('div');
    mark.classList.add('mark'); 
    mark.innerText = `${card.rank}`;
    inner.appendChild(mark);
    outerCard.appendChild(inner);
    discardContainer.appendChild(outerCard);
  } else if (card.rank === 10 && card.category === 'reverse') {
    const outerCard = document.createElement('div');
    outerCard.classList.add('card'); 
    outerCard.classList.add('num-reverse'); 
    outerCard.classList.add(`${card.colour}`); 
    const inner = document.createElement('div');
    inner.classList.add('inner'); 
    const mark = document.createElement('div');
    mark.classList.add('mark-reverse'); 
    mark.innerText = 'R';
    inner.appendChild(mark);
    outerCard.appendChild(inner);
    discardContainer.appendChild(outerCard);
  } else if (card.rank === 10 && card.category === 'skip') {
    const outerCard = document.createElement('div');
    outerCard.classList.add('card'); 
    outerCard.classList.add('num-skip'); 
    outerCard.classList.add(`${card.colour}`); 
    const inner = document.createElement('div');
    inner.classList.add('inner'); 
    const mark = document.createElement('div');
    mark.classList.add('mark-skip'); 
    const skipColour = document.createElement('div');
    skipColour.classList.add(`skip-${card.colour}`); 
    mark.appendChild(skipColour);
    inner.appendChild(mark);
    outerCard.appendChild(inner);
    discardContainer.appendChild(outerCard);
  } else if (card.rank === 10 && card.category === 'draw') {
    const outerCard = document.createElement('div');
    outerCard.classList.add('card'); 
    outerCard.classList.add('num-draw'); 
    outerCard.classList.add(`${card.colour}`); 
    const inner = document.createElement('div');
    inner.classList.add('inner'); 
    const mark = document.createElement('div');
    mark.classList.add('mark-draw'); 
    const drawColour = document.createElement('div');
    drawColour.classList.add(`draw-${card.colour}`); 
    mark.appendChild(drawColour);
    inner.appendChild(mark);
    outerCard.appendChild(inner);
    discardContainer.appendChild(outerCard);
  }
};


// When user clicks a card, store / remove card from global array + show/ hide 'play!' message under card
const cardClick = (index, playerHand) => {
  const playMessageDisplay = document.querySelector(`.user-play${index}`);
  // First time the user clicks a card, do the following:
  if(userCardToPlay.length === 0) {
    // 1. Show the 'play!' message under card
    playMessageDisplay.style.display = 'block';
    // 2. Store index as global variable
    previousSelectedCardIndex = index;
    // 3. Remove and store selected card in global variable
    userCardToPlay = playerHand.splice(index, 1);
    // 4. Store rest of players hand in global variable
    alteredPlayerHand = playerHand;
    // On subsequent car clicks do the following:
  } else {
    // 1. Identify and hide previous 'play!' message under previously selected card
    const previousPlayMessage = document.querySelector(`.user-play${previousSelectedCardIndex}`);
    previousPlayMessage.style.display = 'none';
    // 2. Show the 'play!' message under card
    playMessageDisplay.style.display = 'block';
    // 3. Put previously selected card back at its original index
    alteredPlayerHand.splice(previousSelectedCardIndex, 0, userCardToPlay[0]);
    // 4. Remove selected card and update global variable
    userCardToPlay = alteredPlayerHand.splice(index, 1);
    // 5. Update global variable storing previous index 
    previousSelectedCardIndex = index;
  }
}; 

// Global variable to give each play message class unique name
let playMessageCount = 0;

// Genereate user cards using DOM
const createUserCard = (playerHand) => {
  const allCardContainer = document.getElementById('user-container-all-cards');
  allCardContainer.innerText = '';
  for (let i = 0; i < playerHand.length; i += 1) {
    if (playerHand[i].rank <= 9) {
      // Card + play message container 
      const cardContainer = document.createElement('div');
      cardContainer.classList.add('user-container-card'); 
      // Card divs
      const userCard = document.createElement('div');
      userCard.classList.add('user-card'); 
      const outerCard = document.createElement('div');
      outerCard.classList.add('card-small'); 
      outerCard.classList.add(`num-${playerHand[i].rank}`); 
      outerCard.classList.add(`${playerHand[i].colour}`); 
      const inner = document.createElement('div');
      inner.classList.add('inner'); 
      const mark = document.createElement('div');
      mark.classList.add('mark'); 
      mark.innerText = `${playerHand[i].rank}`;
      // Play message divs
      const playContainer = document.createElement('div');
      playContainer.classList.add('user-play-div'); 
      const playMessage = document.createElement('div');
      playMessage.classList.add(`user-play${i}`); 
      playMessage.classList.add('user-play-master'); 
      playMessage.innerText = "Play!";
      playMessage.style.display = 'none';
      // Append card elements
      inner.appendChild(mark);
      outerCard.appendChild(inner);
      userCard.appendChild(outerCard);
      cardContainer.appendChild(userCard);
      // Append play message elements
      playContainer.appendChild(playMessage);
      cardContainer.appendChild(playContainer);
      userCard.addEventListener('click', () => { 
        cardClick(i, playerHand); 
      });
      allCardContainer.appendChild(cardContainer);
    } else if (playerHand[i].rank === 10 && playerHand[i].category === 'reverse') {
      // Card + play message container 
      const cardContainer = document.createElement('div');
      cardContainer.classList.add('user-container-card'); 
      // Card divs
      const userCard = document.createElement('div');
      userCard.classList.add('user-card'); 
      const outerCard = document.createElement('div');
      outerCard.classList.add('card-small'); 
      outerCard.classList.add('num-reverse'); 
      outerCard.classList.add(`${playerHand[i].colour}`); 
      const inner = document.createElement('div');
      inner.classList.add('inner'); 
      const mark = document.createElement('div');
      mark.classList.add('mark-reverse'); 
      mark.innerText = 'R';
      // Play message divs
      const playContainer = document.createElement('div');
      playContainer.classList.add('user-play-div'); 
      const playMessage = document.createElement('div');
      playMessage.classList.add(`user-play${i}`);  
      playMessage.classList.add('user-play-master'); 
      playMessage.innerText = "Play!";
      playMessage.style.display = 'none';
      // Append card elements
      inner.appendChild(mark);
      outerCard.appendChild(inner);
      userCard.appendChild(outerCard);
      cardContainer.appendChild(userCard);
      // Append play message elements
      playContainer.appendChild(playMessage);
      cardContainer.appendChild(playContainer);
      userCard.addEventListener('click', () => { 
        cardClick(i, playerHand); 
      });
      allCardContainer.appendChild(cardContainer);
    } else if (playerHand[i].rank === 10 && playerHand[i].category === 'skip') {
      // Card + play message container 
      const cardContainer = document.createElement('div');
      cardContainer.classList.add('user-container-card'); 
      // Card divs
      const userCard = document.createElement('div');
      userCard.classList.add('user-card'); 
      const outerCard = document.createElement('div');
      outerCard.classList.add('card-small'); 
      outerCard.classList.add('num-skip'); 
      outerCard.classList.add(`${playerHand[i].colour}`); 
      const inner = document.createElement('div');
      inner.classList.add('inner'); 
      const mark = document.createElement('div');
      mark.classList.add('mark-skip'); 
      const skipSmall = document.createElement('div');
      skipSmall.classList.add(`skip-${playerHand[i].colour}-small`); 
      // Play message divs
      const playContainer = document.createElement('div');
      playContainer.classList.add('user-play-div'); 
      const playMessage = document.createElement('div');
      playMessage.classList.add(`user-play${i}`);  
      playMessage.classList.add('user-play-master');
      playMessage.innerText = "Play!";
      playMessage.style.display = 'none';
      // Append card elements
      mark.appendChild(skipSmall);
      inner.appendChild(mark);
      outerCard.appendChild(inner);
      userCard.appendChild(outerCard);
      cardContainer.appendChild(userCard);
      // Append play message elements
      playContainer.appendChild(playMessage);
      cardContainer.appendChild(playContainer);
      userCard.addEventListener('click', () => { 
        cardClick(i, playerHand); 
      });
      allCardContainer.appendChild(cardContainer);

    } else if (playerHand[i].rank === 10 && playerHand[i].category === 'draw') {
      // Card + play message container 
      const cardContainer = document.createElement('div');
      cardContainer.classList.add('user-container-card'); 
      // Card divs
      const userCard = document.createElement('div');
      userCard.classList.add('user-card'); 
      const outerCard = document.createElement('div');
      outerCard.classList.add('card-small'); 
      outerCard.classList.add('num-draw'); 
      outerCard.classList.add(`${playerHand[i].colour}`); 
      const inner = document.createElement('div');
      inner.classList.add('inner'); 
      const mark = document.createElement('div');
      mark.classList.add('mark-draw'); 
      const drawSmall = document.createElement('div');
      drawSmall.classList.add(`draw-${playerHand[i].colour}-small`); 
      // Play message divs
      const playContainer = document.createElement('div');
      playContainer.classList.add('user-play-div'); 
      const playMessage = document.createElement('div');
      playMessage.classList.add(`user-play${i}`);  
      playMessage.classList.add('user-play-master');
      playMessage.innerText = "Play!";
      playMessage.style.display = 'none';
      // Append card elements
      mark.appendChild(drawSmall);
      inner.appendChild(mark);
      outerCard.appendChild(inner);
      userCard.appendChild(outerCard);
      cardContainer.appendChild(userCard);
      // Append play message elements
      playContainer.appendChild(playMessage);
      cardContainer.appendChild(playContainer);
      userCard.addEventListener('click', () => { 
        cardClick(i, playerHand); 
      });
      allCardContainer.appendChild(cardContainer);
    }
  }
  
};

const generateDiscardAndUserCards = (gameObj) => {
  // Generate and append discard pile card
  createDiscardCard(gameObj.discardCardPile);
  let playerHand = [];
  // Find users cards in object
  for (let i = 0; i < gameObj.playersData.length; i += 1) {
    if (gameObj.playersData[i].socketId === socket.id) {
      playerHand = gameObj.playersData[i].playerHand;
    }
  }
  // Generate and append user cards
  createUserCard(playerHand);
  
};

const generateOpponentCardsAndName = (gameObj) => {
  // Inform players that they need to wait for 4 players
  const userMessage = document.getElementById('user-message');
  userMessage.innerText = "Please wait for more players to join!";
  // Arrays to change position and store opponents names and card hands
  const allPlayerHandsArr = [];
  let opponentHandsInOrder = [];
  const allPlayerNamesArr = [];
  let opponentNamesInOrder = [];

  for (let i = 0; i < gameObj.playersLoggedIn; i += 1){
    allPlayerHandsArr.push(gameObj.playersData[i].playerHand);
    allPlayerNamesArr.push(gameObj.playersData[i].username);
  }

  for (let j = 0; j < allPlayerHandsArr.length; j += 1){
    if (gameObj.playersData[j].socketId === socket.id) {
      const index = j;
      const numOfIndexToSplice = allPlayerHandsArr.length - index;
      const opponentCardsToMove = allPlayerHandsArr.splice(index, numOfIndexToSplice);
      const opponentNamesToMove = allPlayerNamesArr.splice(index, numOfIndexToSplice);
      opponentHandsInOrder = [...opponentCardsToMove, ...allPlayerHandsArr];
      opponentNamesInOrder = [...opponentNamesToMove, ...allPlayerNamesArr];
    }
  }

  const opponentContainerCard1 = document.getElementById('opponent-container-card-1');
  const opponentContainerCard2 = document.getElementById('opponent-container-card-2');
  const opponentContainerCard3 = document.getElementById('opponent-container-card-3');

  const opponentName1 = document.querySelector('.opponent-name1');
  const opponentCardCount1 = document.querySelector('.opponent-card-count1');

  const opponentName2 = document.querySelector('.opponent-name2');
  const opponentCardCount2 = document.querySelector('.opponent-card-count2');

  const opponentName3 = document.querySelector('.opponent-name3');
  const opponentCardCount3 = document.querySelector('.opponent-card-count3');
  if (gameObj.playersLoggedIn === 2) {
    opponentContainerCard1.innerText = '';
      // Generate opponents cards- Next player:
      for (let i = 0; i < opponentHandsInOrder[1]; i += 1){
        opponentContainerCard1.appendChild(createOpponentCard());
        // Only display max of 7 cards
        if (i >= 6) {
          break;
        }
      }
      opponentName1.innerText = `${opponentNamesInOrder[1]}`
      opponentCardCount1.innerText = `Cards: ${opponentHandsInOrder[1]}`;
    } else if (gameObj.playersLoggedIn === 3) {
      opponentContainerCard1.innerText = '';
      opponentContainerCard2.innerText = '';

      // Generate opponents cards- Next player:
      for (let i = 0; i < opponentHandsInOrder[1]; i += 1){
        opponentContainerCard1.appendChild(createOpponentCard());
        // Only display max of 7 cards
        if (i >= 6) {
          break;
        }
      }
      // Generate opponents cards- 3rd player:
      for (let i = 0; i < opponentHandsInOrder[2]; i += 1){
        opponentContainerCard2.appendChild(createOpponentCard());
        // Only display max of 7 cards
        if (i >= 6) {
          break;
        }
      } 
      opponentName1.innerText = `${opponentNamesInOrder[1]}`
      opponentCardCount1.innerText = `Cards: ${opponentHandsInOrder[1]}`;
      opponentName2.innerText = `${opponentNamesInOrder[2]}`
      opponentCardCount2.innerText = `Cards: ${opponentHandsInOrder[2]}`;
    } 
  // Once 4 players have joined, show opponent names and no of cards to everyone
  if (gameObj.playersLoggedIn === 4) {
    opponentContainerCard1.innerText = '';
    opponentContainerCard2.innerText = '';
    opponentContainerCard3.innerText = '';

    // Remove waiting message when 4th player logs in
    userMessage.innerText = '';
    // Generate opponents cards- Next player:
    for (let i = 0; i < opponentHandsInOrder[1]; i += 1){
      opponentContainerCard1.appendChild(createOpponentCard());
      // Only display max of 7 cards
      if (i >= 6) {
        break;
      }
    }
    // Generate opponents cards- 3rd player:
    for (let i = 0; i < opponentHandsInOrder[2]; i += 1){
      opponentContainerCard2.appendChild(createOpponentCard());
      // Only display max of 7 cards
      if (i >= 6) {
        break;
      }
    } 
    // Generate opponents cards- 4th player:
    for (let i = 0; i < opponentHandsInOrder[3]; i += 1){
      opponentContainerCard3.appendChild(createOpponentCard());
      // Only display max of 7 cards
      if (i >= 6) {
        break;
      }
    } 
    // Display opponents names and number of cards
    opponentName1.innerText = `${opponentNamesInOrder[1]}`
    opponentCardCount1.innerText = `Cards: ${opponentHandsInOrder[1]}`;
    opponentName2.innerText = `${opponentNamesInOrder[2]}`
    opponentCardCount2.innerText = `Cards: ${opponentHandsInOrder[2]}`;
    opponentName3.innerText = `${opponentNamesInOrder[3]}`
    opponentCardCount3.innerText = `Cards: ${opponentHandsInOrder[3]}`;
  } 
};


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
    socket.on('Login successful', (gameObj) => {
      username.value = '';
      password.value = '';
      
      // Store game id as global variable
      currentGameId = gameObj.gameId;

      // Use DOM to show game display and hide login displace
      const loginDisplay = document.getElementById('account');
      const gameDisplay = document.getElementById('game');
      loginDisplay.style.display = 'none';
      gameDisplay.style.display = 'block';
      // On response from server - Alter button visibility based on socket id
      alterBtnVisibility(gameObj)
      generateDiscardAndUserCards(gameObj);
      
      let usernameDisplay = ''; 
      // Find username
      for (let j = 0; j < gameObj.playersData.length; j += 1) {
        if (gameObj.playersData[j].socketId === socket.id) {
          usernameDisplay = gameObj.playersData[j].username;
        }
      }
      // Display username to player
      const userName = document.getElementById('user-name');
      userName.innerText = `Player: ${usernameDisplay}`;
    });

    socket.on('New login', (gameObj) => {
      generateOpponentCardsAndName(gameObj);
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