/*
 * ========================================================
 * ========================================================
 *
 *                    Imports
 *
 * ========================================================
 * ========================================================
 */  const getHash = require('../hashing.js');

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
let discardCard = [];
// Global variable to hide / show buttons to users
let gameObj = {
  playerTurn: 0,
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
      discardCard = cardDeck.pop();
      // Place discard pile card into object
      gameObj.discardCard = discardCard; 

      // Create new game object to enter into DB
      const newGame = {
        gameState: {
          cardDeck,
        },
      };

      try {
      // Create new game in DB
      const game = await db.Game.create(newGame);
      // Add game id to game object to be sent to front-end
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
      // Check for array index matching user socket id and add user's name and new cards to object
      for (let i = 0; i < gameObj.playersData.length; i += 1) {
        if (gameObj.playersData[i].socketId === socket.id) {
          gameObj.playersData[i].username = username;
          gameObj.playersData[i].playerHand = playerHand;
        }
      }
      // Update cards in DB
      await game.update({
        gameState: {
          cardDeck: game.gameState.cardDeck,
          gameObj: gameObj,
        },
      });
      
      // Check for array index matching user socket id and 'hide' cards if it does not match
      for (let i = 0; i < gameObj.playersData.length; i += 1) {
        if (!(gameObj.playersData[i].socketId === socket.id)) {
          gameObj.playersData[i].playerHand = playerHand.length;
        }
      }

      // Inform player if successful and send data
      socket.emit('Login successful', gameObj);
    }
  };
  return {
    addUsersSocketId,
    signUpAttemptDb,
    loginAttemptDb,
  };
};

exports.initGameController = initGameController;
exports.playersData = playersData;
exports.gameObj = gameObj;

