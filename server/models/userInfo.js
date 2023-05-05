const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  // Define the user_info model
  const userInfo = sequelize.define(
    "user_info",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mobile_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      profile_picture: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      created_date: {
        type: DataTypes.DATE,
        //   allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      created_by: {
        type: DataTypes.STRING,
        //   allowNull: false,
      },
      updated_date: {
        type: DataTypes.DATE,
        //   allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_by: {
        type: DataTypes.STRING,
        //   allowNull: false,
      },
    }
    // {
    //   timestamps: false,
    // }
  );
  return userInfo;
};
