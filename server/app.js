"use strict";
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { hash, compare } = require("bcryptjs");
const auth = require("./middleware/auth");
const db = require("./db.config");
const registerUser = require("./components/registrationController");
const { v4: uuidv4 } = require("uuid");

const app = express();

// app.use(cors({ origin: "http://localhost:3000", credentials: true })); // try w/o using it
// app.use(cors({
//   origin: "*", // all origins
//   methods: "*", // all http methods
//   allowedHeaders: "*" // all headers in HTTP request
// }));
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

app.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, mobileNumber, profilePicture, password } =
      req.body;

    // validation 422

    // if user exists 4xx
    // call getUserIDByMobileNumber stored procedure using Sequelize's query method
    // This stored procedure is working but not returning any data
    // const result = await db.sequelize.query(
    //   `CALL getUserIDByMobileNumber('${mobileNumber}', @userID);`
    // );
    const userID = await db.sequelize.query(
      `SELECT id FROM users WHERE mobile_number = '${mobileNumber}';`
    );
    console.log("--------userID----------", userID);

    if (userID[0][0]) {
      res.status(409).send("User already exists");
      return;
    }

    //password hashing
    const encryptedPassword = await hash(password, 7);
    const uuid = uuidv4();
    const date = new Date().toISOString().slice(0, 19).replace("T", " "); // convert the date to a string in ISO format, then remove the time and replace the 'T' with a space
    console.log("--------utc date----------", date);

    // call registerUser stored procedure using Sequelize's query method
    // This stored procedure is working but not returning any data
    // await db.sequelize.query(
    //   `CALL registerUser('${uuid}','${firstName}','${lastName}','${mobileNumber}','${encryptedPassword}','${profilePicture}','${date}')`,
    //   { timeout: 5000 } // Timeout after 5 seconds
    // );
    const resp = await db.sequelize.query(`INSERT INTO
        users (
                id,
                first_name,
                last_name,
                mobile_number,
                password,
                profile_picture,
                created_by,
                updated_by,
                createdAt,
                updatedAt
            )
        VALUES
        (
            '${uuid}',
            '${firstName}',
            '${lastName}',
            '${mobileNumber}',
            '${encryptedPassword}',
            '${profilePicture}',
            '${uuid}',
            NULL,
            '${date}',
            '${date}'
    )`);
    console.log("--------resp----------", resp);

    if (!resp || !resp[1]) {
      throw new Error();
    }

    // return data from sql to genearte a token for it - userPayload
    //generate token
    const resp2 = await db.sequelize.query(
      `SELECT id FROM users WHERE mobile_number = ${mobileNumber};`
    );
    const userPayload = resp2?.[0][0];
    console.log("--------userPayload----------", userPayload);

    const token = jwt.sign(
      { id: userPayload?.id, mobileNumber },
      process.env.TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    userPayload.token = token;
    userPayload.password = undefined; // since we don't want to send it to client

    res.status(201).json(userPayload);
    //image pending
  } catch (error) {
    res.status(500).send({
      message: error.message,
      errorLoggedFrom: "registrationController",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;
    // validation 422
    //send payload to query
    //  user found? -> userExists
    const userPayload = await db.sequelize.query(
      `SELECT id, password FROM users WHERE mobile_number = '${mobileNumber}';`
    );
    console.log("--------userPayload----------", userPayload);

    if (!userPayload || !userPayload[0][0]) {
      res.status(400).send({ message: `User doesn't exist` });
      return;
    }

    // get password from the database - const {id, password: encryptedPasswordFromDB} = userPayload
    const isPasswordCorrect = await compare(
      password,
      userPayload?.[0][0]?.password
    );
    console.log("--------isPasswordCorrect----------", isPasswordCorrect);

    // //if wrong wrong password - 401 Unauthorized
    if (!isPasswordCorrect) {
      res.status(401).send({ message: `Password Incorrect` });
    }
    const payload = { id: userPayload?.[0][0]?.id };
    // if password matches -> send token
    if (isPasswordCorrect) {
      const token = jwt.sign(
        { id: payload.id, mobileNumber },
        process.env.TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      payload.token = token;
      payload.password = undefined; // since we don't want to send it to client
      //send token in cookie
      const options = {
        expires: new Date(Date.now() + 1 * 24 * 60 * 1000), // expires in 1 day
        httpOnly: true, // cookie can be manipulated in the server only, user will not be able to manipulate it in the browser
        path: "/refresh",
      };
      res
        .status(200)
        .cookie(
          "token",
          token, // REFRESH TOKEN
          options
        )
        .json({
          success: true,
          token, // ACCESS TOKEN
          payload, // if needed})
        });
    }
    // res.status(200).send("eg");
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message, errorLoggedFrom: "loginController" });
  }
});

app.get("/profile", async (req, res) => {
  // only authorised user will be able to access it
  // query db with id, Welcome user
  console.log("req.user");
  res.status(201).send("hs");
});

// protected route
app.get("/profile", auth, async (req, res, next) => {
  // only authorised user will be able to access it
  // query db with id, Welcome user
  console.log("req.user", req.user);
  next();
});

app.post("/logout", (_, res) => {
  res.clearCookie("token", { path: "/refresh" });
  res.send({ message: "User logged out" });
});
// in the logout route set the cookies as undefined

module.exports = app;
