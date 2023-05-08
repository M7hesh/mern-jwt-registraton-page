const Sequelize = require("sequelize");
require("dotenv").config();
const mysql = require("mysql2/promise");

const {
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_DIALECT,
} = process.env;

const db = {};

const initializeDB = async () => {
  // Sequelize can't create database, so use drivers like mysql2, pgp, etc
  // open connection to mysql server
  const connection = await mysql.createConnection({
    host: DATABASE_HOST,
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
  });

  // create database
  await connection.query(`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME};`);

  // connect to database created above
  const sequelize = new Sequelize(
    DATABASE_NAME,
    DATABASE_USER,
    DATABASE_PASSWORD,
    {
      host: DATABASE_HOST,
      port: DATABASE_PORT,
      dialect: DATABASE_DIALECT,
    }
  );

  db.Sequelize = Sequelize;
  db.sequelize = sequelize;

  // init model and add it to db object
  db.userInfo = require("./models/userInfo")(sequelize, Sequelize);

  await connection.query(`USE ${DATABASE_NAME};`);
  //   await connection.query(`DROP PROCEDURE IF EXISTS registerUser;`);
  //   await connection.query(`CREATE PROCEDURE registerUser(
  //     IN uuid VARCHAR(255),
  //     IN firstName VARCHAR(255),
  //     IN lastName VARCHAR(255),
  //     IN mobileNumber VARCHAR(255),
  //     IN encryptedPassword VARCHAR(255),
  //     IN profilePicture VARCHAR(255),
  //     IN date DATETIME)
  // BEGIN
  // INSERT INTO
  //     users (
  //         id,
  //         first_name,
  //         last_name,
  //         mobile_number,
  //         password,
  //         profile_picture,
  //         created_by,
  //         updated_by,
  //         createdAt,
  //         updatedAt
  //     )
  // VALUES
  //     (
  //         uuid,
  //         firstName,
  //         lastName,
  //         mobileNumber,
  //         encryptedPassword,
  //         profilePicture,
  //         uuid,
  // 		NULL,
  // 		date,
  // 		date
  //     );
  // END`);
  //   await connection.query(`DROP PROCEDURE IF EXISTS getUserIDByMobileNumber;`);
  //   await connection.query(`CREATE PROCEDURE getUserIDByMobileNumber(IN mobileNumber VARCHAR(255), OUT userID VARCHAR(255))
  //   BEGIN
  //     SELECT id INTO userID FROM users WHERE mobile_number = mobileNumber;
  //   END
  //   `);

  await connection.end();

  //   sync model with database
  await sequelize.sync({ alert: true });
};

initializeDB();

module.exports = db;
