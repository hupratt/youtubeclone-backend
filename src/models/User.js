const { Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  return sequelize.define("User", {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        min: 6,
      },
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue:
        "https://generic-f1492f08-f236-4a55-afb7-70ded209cb29.s3.eu-west-2.amazonaws.com/images/profile.2e16d0ba.fill-50x50.jpg",
    },
    cover: {
      type: DataTypes.STRING,
      defaultValue:
        "https://generic-f1492f08-f236-4a55-afb7-70ded209cb29.s3.eu-west-2.amazonaws.com/images/cover.jpeg",
    },
    channelDescription: {
      type: DataTypes.STRING,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });
};
