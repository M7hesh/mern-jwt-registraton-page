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

  await connection.end();

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

  //   sync model with database
  await sequelize.sync({ alert: true });
};

initializeDB();

module.exports = db;
