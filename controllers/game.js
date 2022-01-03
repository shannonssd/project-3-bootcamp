/*
 * ========================================================
 * ========================================================
 *
 *                    Imports
 *
 * ========================================================
 * ========================================================
 */
const getHash = require('../hashing.js');

/*
 * ========================================================
 * ========================================================
 *
 *       Global variables for player and game data
 *
 * ========================================================
 * ========================================================
 */
// Store all connected players in array
let playersData = [];
// Store all discard pile cards in array
const discardCardPile = [];
// Global variable to hide / show buttons to users
let gameObj = {
  playerTurn: 0,
  playerDirection: 1,
  playersData,
};

/*
 * ========================================================
 * ========================================================
 * 
 *            Generate and shuffle card deck
 *
 * ========================================================
 * ========================================================
 */
// Get a random index ranging from 0 (inclusive) to max (exclusive).
var getRandomIndex = function (max) {
  return Math.floor(Math.random() * max);
};

// Shuffle the elements in the cardDeck array
var shuffleCards = function (cardDeck) {
  // Loop over the card deck array once
  var currentIndex = 0;
  while (currentIndex < cardDeck.length) {
    // Select a random index in the deck
    var randomIndex = getRandomIndex(cardDeck.length);
    // Select the card that corresponds to randomIndex
    var randomCard = cardDeck[randomIndex];
    // Select the card that corresponds to currentIndex
    var currentCard = cardDeck[currentIndex];
    // Swap positions of randomCard and currentCard in the deck
    cardDeck[currentIndex] = randomCard;
    cardDeck[randomIndex] = currentCard;
    // Increment currentIndex
    currentIndex = currentIndex + 1;
  }
  // Return the shuffled deck
  return cardDeck;
};

var makeDeck = () => {
  // Initialise an empty deck array
  var cardDeck = [];
  // Initialise an array of the 4 colours 
  var colours = ['red', 'green', 'blue', 'yellow'];

  // Loop over the colours array
  var coloursIndex = 0;
  while (coloursIndex < colours.length) {
    // Store the current colour in a variable
    var currentColour = colours[coloursIndex];

    // Loop from 1 to 12 to create all number cards + action cards
    var rankCounter = 0;
    while (rankCounter <= 12) {
      var cardRank = rankCounter;
      var cardCategory = '';

      // If rankCounter is between 10 - 12 (action cards) set cardRank to 10 for easy identification of action cards
      if (cardRank >= 10) {
        cardRank = 10;
      }

      // If rankCounter is between 10 - 12 create specific category name, else let category name be number
      if(rankCounter <= 9) {
        cardCategory = 'number';
      } else if (rankCounter === 10) {
        cardCategory = 'skip';
      } else if (rankCounter === 11) {
        cardCategory = 'reverse';
      } else if (rankCounter === 12) {
        cardCategory = 'draw';
      }

      // Create a new card with the current rank, colour and category
      var card = {
        rank: cardRank,
        colour: currentColour,
        category: cardCategory,
      };

      // If card is a zero, create one, else create two of each card
      if (rankCounter === 0) {
        cardDeck.push(card);
      } else {
        cardDeck.push(card);
        cardDeck.push(card);
      }

      // Increment rankCounter to iterate over the next rank
      rankCounter += 1;
    }

    // Increment the suit index to iterate over the next colour
    coloursIndex += 1;
  }
  
  // Return the completed card deck
  return cardDeck;
};



/*
 * ========================================================
 * ========================================================
 * 
 *                 Controller Functions
 *
 * ========================================================
 * ========================================================
 */
const initGameController = (db) => {
  const { Op } = db.Sequelize;

  // When new user connects, add users socket id to an array
  const addUsersSocketId = async (socket) => {
    playersData.push({});
    // Add new players socket id to new index in array
    playersData[playersData.length - 1].socketId = socket.id;

    // When first player connects, do the following:
    if (playersData.length === 1) {
      // Deal a new shuffled deck for this game.
      var newDeck = makeDeck();
      var cardDeck = shuffleCards(newDeck);

      // Draw card for discard pile
      let discardCard = cardDeck.pop();

      // Store all used cards in a pile
      discardCardPile.push(discardCard);

      // Place discard pile card into object
      gameObj.discardCardPile = discardCardPile; 

      // Create new game object to enter into DB
      const newGame = {
        gameState: {
          cardDeck,
        },
      };

      try {
        // Create new game in DB
        const game = await db.Game.create(newGame);
        // Add game id to game object 
        gameObj.gameId = game.id; 
      } catch (error) {
        response.status(500).send(error);
      }
    } 
  };

  // When user tries to signup: 
  const signUpAttemptDb = async (socket, data) => {
    const { username } = data;
    const { password } = data;
    const hashedPassword = getHash(password);

    // Check if username already exists
    const checkIfUserExists = await db.User.findOne({
      where: {
        username,
      },
    });

    // If no such username in database, create new one
    if (checkIfUserExists === null) {
      await db.User.create({
        username,
        password: hashedPassword,
      });
      socket.emit('Sign up success');
    } else {
      // Else inform user that username already exists
      socket.emit('User exists');
    }
  };

  // When user tries to login: 
  const loginAttemptDb = async (socket, data) => {
    const { username } = data;
    const { password } = data;
    const hashedPassword = getHash(password);

    // Check if username exists in DB
    const checkUser = await db.User.findOne({
      where: {
        username,
        password: hashedPassword,
      },
    });

    // If no such username + password combo, inform user
    if (checkUser === null) {
      socket.emit('Invalid login');
      // If login successful:
    } else {
      // Create new entry in join table
      await db.UserGame.create({
        gameId: gameObj.gameId,
        userId: checkUser.id,
      });

      // Find game in DB to draw cards
      const game = await db.Game.findByPk(gameObj.gameId);

      // Deal cards to player
      const playerHand = [];
      for (let i = 0; i < 7; i += 1){
        playerHand.push(game.gameState.cardDeck.pop())
      }

      // Create new variable for use on client-side to determine how many players opponent cards to create display for
      let playersLoggedIn = 'playersLoggedIn';
      // Store num of logged in players
      if (playersLoggedIn in gameObj) {
        gameObj[playersLoggedIn] += 1;
      }
      // Else, initialise count of this card name to 1
      else {
        gameObj[playersLoggedIn] = 1;
      }

      // Check for array index matching user socket id and add user's name and cards to object
      for (let i = 0; i < gameObj.playersData.length; i += 1) {
        if (gameObj.playersData[i].socketId === socket.id) {
          gameObj.playersData[i].username = username;
          gameObj.playersData[i].playerHand = playerHand;
        }
      }

      // Update cards in DB before hiding opponents cards 
      await game.update({
        gameState: {
          cardDeck: game.gameState.cardDeck,
          gameObj: gameObj,
        }, 
        returning: true,
      });

      // Create new object so that data can be hidden without affecting data in server
      let hiddenGameObj =  JSON.parse(JSON.stringify(gameObj));
      // Check for array index matching user socket id and 'hide' cards if it does not match
      for (let j = 0; j < hiddenGameObj.playersLoggedIn; j += 1) {
        if (!(hiddenGameObj.playersData[j].socketId === socket.id)) {
          hiddenGameObj.playersData[j].playerHand = hiddenGameObj.playersData[j].playerHand.length;
        }
      }
      // Inform player if successful and send data - to generate user card display
      socket.emit('Login successful', hiddenGameObj);

      // Create new object so that data can be hidden without affecting data in server
      let hiddenGameObjAll =  JSON.parse(JSON.stringify(gameObj));
      // Modify object to reflect number of each players cards
      for (let k = 0; k < hiddenGameObjAll.playersLoggedIn; k += 1) {
        hiddenGameObjAll.playersData[k].playerHand = hiddenGameObjAll.playersData[k].playerHand.length;
      }
      // Inform ALL player if there is a new login - to generate opponent card display
      socket.broadcast.emit('New login', hiddenGameObjAll);
      socket.emit('New login', hiddenGameObjAll);
    }
  };

  // Check for valid number card
  const checkIfPlayIsValid = async (card, id) => {
    // const card = cardArr[0];
    let isTurnValid = false;

    // Access discard pile from DB based on game id
    const game = await db.Game.findByPk(id);
    const discardCardPileDB  = game.gameState.gameObj.discardCardPile;
    // Retrieve latest card on discard pile
    const discardedCard = discardCardPileDB[discardCardPileDB.length - 1];
    console.log('discard card:', discardedCard);
    console.log('discard card pile:', discardCardPileDB);
    console.log('player card:', card);

    // Check conditions for number cards
    if (card.category === 'number') {
      // Check for same colour
      if (discardedCard.colour === card.colour) {
        isTurnValid = true;
      }  
      // Check for same number regardless of colour
      if ((discardedCard.colour !== card.colour) && (card.rank === discardedCard.rank)) {
        console.log('diff color working!!!!');
        isTurnValid = true;
      }  
      console.log(isTurnValid);
      return isTurnValid;
    }

    // Check conditions for action cards
    if (card.rank === 10) {
      // Check for same colour
      if (discardedCard.colour === card.colour) {
        isTurnValid = true;
        // Check for same action card
      }  
      if ((discardedCard.colour !== card.colour) && (card.category === discardedCard.category)) {
        console.log('diff color working!!!!');
        isTurnValid = true;
      }
      console.log(isTurnValid);
      return isTurnValid;
    }
  }; 
  // const checkForValidPlayerTurnIndex = (playerTurn) => {
  //   if (playerTurn < 0) {
  //     console.log('playerTurn changer working!');
  //     playerTurn = 4 + playerTurn;
  //   } 
  //   if (playerTurn > 3) {
  //       console.log('playerTurn changer working!');

  //     playerTurn = playerTurn - 4;
  //   }
  //   return playerTurn;
  // };

  const ifPlayValid = async (socket, gameData) => {
    // Access game data in DB based on game id
    const game = await db.Game.findByPk(gameData.currentGameId);
    let latestGameObj = game.gameState.gameObj;
    // 1. Update discard pile
    latestGameObj.discardCardPile.push(gameData.userCardToPlay);
    // 2. Update players cards
    latestGameObj.playersData[latestGameObj.playerTurn].playerHand = gameData.alteredPlayerHand;
    // 3. Determine player direction based on reverse card played
    if (gameData.userCardToPlay.category === 'reverse') {
      if (latestGameObj.playerDirection === 1) {
        latestGameObj.playerDirection = -1;
      } else {
        latestGameObj.playerDirection = 1;
      }
    }
    // 4. Update index to reflect next players turn
    if (gameData.userCardToPlay.category === 'number' || gameData.userCardToPlay.category === 'reverse'){
      latestGameObj.playerTurn += latestGameObj.playerDirection;
      // checkForValidPlayerTurnIndex(latestGameObj.playerTurn);
      if (latestGameObj.playerTurn < 0) {
      latestGameObj.playerTurn = 4 + latestGameObj.playerTurn;
      } 
      if (latestGameObj.playerTurn > 3) {
        latestGameObj.playerTurn = latestGameObj.playerTurn - 4;
      }
    } else if (gameData.userCardToPlay.category === 'skip'){
      latestGameObj.playerTurn += latestGameObj.playerDirection;
      latestGameObj.playerTurn += latestGameObj.playerDirection;
      if (latestGameObj.playerTurn < 0) {
        latestGameObj.playerTurn = 4 + latestGameObj.playerTurn;
      } 
      if (latestGameObj.playerTurn > 3) {
        latestGameObj.playerTurn = latestGameObj.playerTurn - 4;
      }    
    } else if (gameData.userCardToPlay.category === 'draw'){
      latestGameObj.playerTurn += latestGameObj.playerDirection;
      if (latestGameObj.playerTurn < 0) {
      latestGameObj.playerTurn = 4 + latestGameObj.playerTurn;
      } 
      if (latestGameObj.playerTurn > 3) {
        latestGameObj.playerTurn = latestGameObj.playerTurn - 4;
      }      
      const indexOfPlayerToDraw2 = latestGameObj.playerTurn; 
      latestGameObj.playerTurn += latestGameObj.playerDirection;
      if (latestGameObj.playerTurn < 0) {
        latestGameObj.playerTurn = 4 + latestGameObj.playerTurn;
      } 
      if (latestGameObj.playerTurn > 3) {
        latestGameObj.playerTurn = latestGameObj.playerTurn - 4;
      }      
      // Draw two cards for subsequent player
      latestGameObj.playersData[indexOfPlayerToDraw2].playerHand.push(game.gameState.cardDeck.pop());
      latestGameObj.playersData[indexOfPlayerToDraw2].playerHand.push(game.gameState.cardDeck.pop());
      const socketIdOfDraw2Player = latestGameObj.playersData[indexOfPlayerToDraw2].socketId;

      // Create new object so that data can be hidden without affecting data in server
      const hiddenInfoGameObj =  JSON.parse(JSON.stringify(latestGameObj));
      // Check for array index matching user socket id and 'hide' cards if it does not match
      for (let j = 0; j < hiddenInfoGameObj.playersLoggedIn; j += 1) {
        if (!(hiddenInfoGameObj.playersData[j].socketId === socketIdOfDraw2Player)) {
          hiddenInfoGameObj.playersData[j].playerHand = hiddenInfoGameObj.playersData[j].playerHand.length;
        }
      }
      // Send to player who had to draw 2 all his cards
      socket.broadcast.to(socketIdOfDraw2Player).emit('Draw 2', hiddenInfoGameObj);
    }
    console.log('latestGameObj', latestGameObj);
    // 5. Update DB
    try {
      await db.Game.update({
        gameState: {
          cardDeck: game.gameState.cardDeck,
          gameObj: latestGameObj,
        }}, 
       { 
         where: {
          id: gameData.currentGameId,
          }
        },
      );
    } catch (error) {
      console.log('error:', error)
    }
    

    // Create new object so that data can be hidden without affecting data in server
    let hiddenGameObj =  JSON.parse(JSON.stringify(latestGameObj));
    // Check for array index matching user socket id and 'hide' cards if it does not match
    for (let j = 0; j < hiddenGameObj.playersLoggedIn; j += 1) {
      if (!(hiddenGameObj.playersData[j].socketId === socket.id)) {
        hiddenGameObj.playersData[j].playerHand = hiddenGameObj.playersData[j].playerHand.length;
      }
    }
    // 6. Inform player that his play was valid
    socket.emit('Valid play', hiddenGameObj);

    // Create new object so that data can be hidden without affecting data in server
    let hiddenGameObjAll =  JSON.parse(JSON.stringify(latestGameObj));
    // Modify object to reflect number of each players cards
    for (let k = 0; k < hiddenGameObjAll.playersLoggedIn; k += 1) {
      hiddenGameObjAll.playersData[k].playerHand = hiddenGameObjAll.playersData[k].playerHand.length;
    }
    // 7. Inform ALL player if there is a new login - to generate opponent card display
    socket.broadcast.emit('Round completed', hiddenGameObjAll);
    socket.emit('Round completed', hiddenGameObjAll);
  };

  // When user tries to play a hand, evaluate attempt 
  const evaluateChoice = async (socket, gameData) => {
    // Functions to check for various valid card plays
    const isCardValid = await checkIfPlayIsValid(gameData.userCardToPlay, gameData.currentGameId);

    // If card played is invalid, inform player
    if (isCardValid === false) {
      socket.emit('Invalid play');
      // If card played is valid, inform ALL players + change turn + alter DB 
    } else if (isCardValid === true) {
      ifPlayValid(socket, gameData);
    }
  };

  return {
    addUsersSocketId,
    signUpAttemptDb,
    loginAttemptDb,
    evaluateChoice,
  };
};

exports.initGameController = initGameController;


