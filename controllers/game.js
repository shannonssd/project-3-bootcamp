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

// Global variable to hide / show buttons to users
let playerTurnObj = {
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
var newDeck = makeDeck();
var shuffledDeck = shuffleCards(newDeck);
// console.log(shuffledDeck);

const initGameController = () => {
/*
 * ========================================================
 * ========================================================
 *
 *         When new user connects do the following:
 *
 * ========================================================
 * ========================================================
 */
  const createNewUser = (socket) => {
    playersData.push({});
    // Add new players socket id to new index in array
    playersData[playersData.length - 1].socketId = socket.id;
    // Deal cards to player
    const playerHand = [];
    for (let i =0; i < 7; i +=1){
      playerHand.push(shuffledDeck.pop())
    }
    playersData[playersData.length - 1].playerHand = playerHand;

    console.log(playersData[playersData.length - 1].playerHand);
  }

  return {
    createNewUser,
  };
};

exports.initGameController = initGameController;
exports.playersData = playersData;
exports.playerTurnObj = playerTurnObj;

