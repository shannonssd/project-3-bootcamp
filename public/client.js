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
const createDiscardCard = (card) => {
  const discardContainer = document.getElementById('discard-container');
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
// Global variable to give each play message class unique name
let playMessageCount = 0;

// Global variable to store card that user wants to play
const userCardToPlay = [];
// When user clicks a card, store / remove card from global array + show/ hide 'play!' message under card
const cardClick = (playMessageCount) => {
  const playMessageDisplay = document.getElementById(`user-play${playMessageCount}`);
  if(userCardToPlay.length === 0) {
    playMessageDisplay.style.display = 'block';
    // ########## .slice() card to be played
  } else {
    playMessageDisplay.style.display = 'none';
    // ########## put card back at index????
  }
}; 


// Genereate user cards using DOM
const createUserCard = (card) => {
  const allCardContainer = document.getElementById('user-container-all-cards');
  if (card.rank <= 9) {
    // Card + play message container 
    const cardContainer = document.createElement('div');
    cardContainer.classList.add('user-container-card'); 
    // Card divs
    const userCard = document.createElement('div');
    userCard.classList.add('user-card'); 
    const outerCard = document.createElement('div');
    outerCard.classList.add('card-small'); 
    outerCard.classList.add(`num-${card.rank}`); 
    outerCard.classList.add(`${card.colour}`); 
    const inner = document.createElement('div');
    inner.classList.add('inner'); 
    const mark = document.createElement('div');
    mark.classList.add('mark'); 
    mark.innerText = `${card.rank}`;
    // Play message divs
    const playContainer = document.createElement('div');
    playContainer.classList.add('user-play-div'); 
    const playMessage = document.createElement('div');
    playMessage.classList.add(`user-play${playMessageCount}`); 
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
      cardClick(playMessageCount); 
    });
    playMessageCount += 1;
    allCardContainer.appendChild(cardContainer);

  } else if (card.rank === 10 && card.category === 'reverse') {
    // Card + play message container 
    const cardContainer = document.createElement('div');
    cardContainer.classList.add('user-container-card'); 
    // Card divs
    const userCard = document.createElement('div');
    userCard.classList.add('user-card'); 
    const outerCard = document.createElement('div');
    outerCard.classList.add('card-small'); 
    outerCard.classList.add('num-reverse'); 
    outerCard.classList.add(`${card.colour}`); 
    const inner = document.createElement('div');
    inner.classList.add('inner'); 
    const mark = document.createElement('div');
    mark.classList.add('mark-reverse'); 
    mark.innerText = 'R';
    // Play message divs
    const playContainer = document.createElement('div');
    playContainer.classList.add('user-play-div'); 
    const playMessage = document.createElement('div');
    playMessage.classList.add(`user-play${playMessageCount}`);  
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
      cardClick(playMessageCount); 
    });
    playMessageCount += 1;
    allCardContainer.appendChild(cardContainer);

  } else if (card.rank === 10 && card.category === 'skip') {
    // Card + play message container 
    const cardContainer = document.createElement('div');
    cardContainer.classList.add('user-container-card'); 
    // Card divs
    const userCard = document.createElement('div');
    userCard.classList.add('user-card'); 
    const outerCard = document.createElement('div');
    outerCard.classList.add('card-small'); 
    outerCard.classList.add('num-skip'); 
    outerCard.classList.add(`${card.colour}`); 
    const inner = document.createElement('div');
    inner.classList.add('inner'); 
    const mark = document.createElement('div');
    mark.classList.add('mark-skip'); 
    const skipSmall = document.createElement('div');
    skipSmall.classList.add(`skip-${card.colour}-small`); 
    // Play message divs
    const playContainer = document.createElement('div');
    playContainer.classList.add('user-play-div'); 
    const playMessage = document.createElement('div');
    playMessage.classList.add(`user-play${playMessageCount}`);  
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
      cardClick(playMessageCount); 
    });
    playMessageCount += 1;
    allCardContainer.appendChild(cardContainer);

  } else if (card.rank === 10 && card.category === 'draw') {
    // Card + play message container 
    const cardContainer = document.createElement('div');
    cardContainer.classList.add('user-container-card'); 
    // Card divs
    const userCard = document.createElement('div');
    userCard.classList.add('user-card'); 
    const outerCard = document.createElement('div');
    outerCard.classList.add('card-small'); 
    outerCard.classList.add('num-draw'); 
    outerCard.classList.add(`${card.colour}`); 
    const inner = document.createElement('div');
    inner.classList.add('inner'); 
    const mark = document.createElement('div');
    mark.classList.add('mark-draw'); 
    const drawSmall = document.createElement('div');
    drawSmall.classList.add(`draw-${card.colour}-small`); 
    // Play message divs
    const playContainer = document.createElement('div');
    playContainer.classList.add('user-play-div'); 
    const playMessage = document.createElement('div');
    playMessage.classList.add(`user-play${playMessageCount}`);  
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
      cardClick(playMessageCount); 
    });
    playMessageCount += 1;
    allCardContainer.appendChild(cardContainer);
  }
};

const generateDiscardAndUserCards = (gameObj) => {
  // Generate and append discard pile card
  createDiscardCard(gameObj.discardCard);
  let playerHand = [];
  // Find users cards in object
  for (let i = 0; i < gameObj.playersData.length; i += 1) {
    if (gameObj.playersData[i].socketId === socket.id) {
      playerHand = gameObj.playersData[i].playerHand;
    }
  }
  // Generate and append user cards
  for (let j = 0; j < playerHand.length; j += 1){
    createUserCard(playerHand[j]);
  }
};

const generateOpponentCardsAndName = (gameObj) => {
  if (gameObj.playersLoggedIn > 1) {
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
      // Generate opponents cards
      for (let i = 0; i < opponentHandsInOrder[1]; i += 1){
        opponentContainerCard1.appendChild(createOpponentCard()) 
      }
      opponentName1.innerText = `${opponentNamesInOrder[1]}`
      opponentCardCount1.innerText = `Cards: ${opponentHandsInOrder[1]}`;
    }
  }
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
      console.log(gameObj);
      // Use DOM to show game display and hide login displace
      const loginDisplay = document.getElementById('account');
      const gameDisplay = document.getElementById('game');
      loginDisplay.style.display = 'none';
      gameDisplay.style.display = 'block';
      generateDiscardAndUserCards(gameObj);
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
const alterBtnVisibility = (gameObj) => {
  if(!(socket.id === gameObj.playersData[gameObj.playerTurn].socketId)) {
    console.log('hide')
    hideBtn();
  }
  if(socket.id === gameObj.playersData[gameObj.playerTurn].socketId) {
    console.log('show');
    showBtn();
  }
};

// On response from server - Alter button visibility based on socket id
socket.on('player turn', (gameObj) => {
  alterBtnVisibility(gameObj);
});
