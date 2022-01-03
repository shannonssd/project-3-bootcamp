const userModel = (sequelize, DataTypes) => {
  return sequelize.define('user', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    username: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  },
  {
    // The underscored option makes Sequelize reference snake_case names in the DB.
    underscored: true,
  });
}

module.exports = userModel;