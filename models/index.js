const allConfig = require('../config/config');
const sequelizePackage = require('sequelize');
const { Sequelize } = sequelizePackage;

const gameModel = require('./game.js');
const userModel = require('./user.js');
const gameUserModel = require('./gameUser.js');

const env = process.env.NODE_ENV || 'development';
const config = allConfig[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.Game = gameModel(sequelize, Sequelize.DataTypes);
db.User = userModel(sequelize, Sequelize.DataTypes);
db.UserGame = gameUserModel(sequelize, Sequelize.DataTypes);

db.Game.belongsToMany(db.User, { through: 'game_user' });
db.User.belongsToMany(db.Game, { through: 'game_user' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;