"use strict";
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { hash, compare } = require("bcryptjs");
const { auth, isAuth } = require("./middleware/auth");
const db = require("./db.config");
const registerUser = require("./components/registrationController");
const { v4: uuidv4 } = require("uuid");
const { generateRefreshToken, generateAccessToken } = require("./shared/token");
const getUTCdate = require("./shared/utcDate");

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
    const date = getUTCdate();

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
      return;
    }
    const id = userPayload?.[0][0]?.id;
    // if password matches -> send token
    if (isPasswordCorrect) {
      const refreshToken = generateRefreshToken(id);
      const accessToken = generateAccessToken(id);
      const date = getUTCdate();

      const resp = await db.sequelize.query(`UPDATE users
              SET
                  refresh_token   = '${refreshToken}',
                  updated_by      = '${id}',
                  updatedAt       = '${date}'
              WHERE
                  id = '${id}'
      `);
      console.log("--------resp----------", resp[0].affectedRows);

      if (!resp || !resp[0]?.affectedRows) {
        throw new Error();
      }
      //send token in cookie
      const options = {
        expires: new Date(Date.now() + 1 * 24 * 60 * 1000), // expires in 1 day
        httpOnly: true, // cookie can be manipulated in the server only, user will not be able to manipulate it in the browser
        path: "/refresh_token",
      };
      res
        .status(200)
        .cookie(
          "refreshToken",
          refreshToken, // REFRESH TOKEN
          options
        )
        .json({
          success: true,
          accessToken, // ACCESS TOKEN
          id, // if needed})
        });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message, errorLoggedFrom: "loginController" });
  }
});

app.put("/profile", async (req, res) => {
  try {
    const { id, firstName, lastName, mobileNumber, profilePicture } = req.body;

    // validation 422

    const date = getUTCdate();

    const resp = await db.sequelize.query(`UPDATE users
            SET
                first_name      = '${firstName}',
                last_name       = '${lastName}',
                mobile_number   = '${mobileNumber}',
                profile_picture = '${profilePicture}',
                updated_by      = '${id}',
                updatedAt       = '${date}'
            WHERE
                id = '${id}'
    `);
    console.log("--------resp----------", resp[0].affectedRows);

    if (!resp || !resp[0]?.affectedRows) {
      throw new Error();
    }

    res.status(201).json(resp);
    //image pending
  } catch (error) {
    res.status(500).send({
      message: error.message,
      errorLoggedFrom: "registrationController",
    });
  }
});

// protected route
app.get("/profile/:id", isAuth, async (req, res, next) => {
  try {
    // only authorised user will be able to access it
    const { id } = req.params;
    // query db with id, Welcome user
    console.log("req.user", req.user.id);

    if (!req.user || req.user?.id !== id) {
      res.status(401).send("PLease login");
      return;
    }
    const userPayload = await db.sequelize.query(`SELECT 
          id, 
          first_name, 
          last_name, 
          mobile_number, 
          profile_picture 
      FROM users 
      WHERE id = '${id}';`);
    console.log("--------userPayload----------", userPayload);
    res.status(200).send(userPayload[0][0]);
    next();
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message, errorLoggedFrom: "profileController" });
  }
});

app.post("/refresh_token", async (req, res) => {
  try {
    const refreshTokenFromClient = req.cookies.refreshToken;
    if (!refreshTokenFromClient) {
      res.status(401).send({ accessToken: "" });
      return;
    }
    let payload = null;
    try {
      payload = jwt.verify(refreshTokenFromClient, process.env.TOKEN_SECRET);
    } catch (error) {
      res.status(401).send({ accessToken: "" });
      return;
    }
    console.log("payload from refresh", payload);
    // if token is vaild, check if user exist
    const userPayload = await db.sequelize.query(
      `SELECT id, refresh_token AS refreshToken from users WHERE id = '${payload.id}'`
    );
    console.log("userPayload", userPayload[0][0]);
    const { id, refreshToken } = userPayload[0][0];
    // if user doen't exist or refresh token from Db doesn't match
    if (!id || refreshToken !== refreshTokenFromClient) {
      res.status(401).send({ accessToken: "" });
      return;
    }
    // token matches - create new tokens
    const newRefreshToken = generateRefreshToken(id);
    const newAccessToken = generateAccessToken(id);
    // store the new token in db
    const date = getUTCdate();
    const resp = await db.sequelize.query(`UPDATE users
              SET
                  refresh_token   = '${refreshToken}',
                  updated_by      = '${id}',
                  updatedAt       = '${date}'
              WHERE
                  id = '${id}'
      `);
    console.log("--------resp----------", resp[0].affectedRows);

    if (!resp || !resp[0]?.affectedRows) {
      throw new Error();
    }
    // send refresh tokens in cookies
    const options = {
      expires: new Date(Date.now() + 1 * 24 * 60 * 1000), // expires in 1 day
      httpOnly: true, // cookie can be manipulated in the server only, user will not be able to manipulate it in the browser
      path: "/refresh_token",
    };
    res.status(200).cookie("refreshToken", newRefreshToken, options).json({
      success: true,
      newAccessToken,
      id,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      errorLoggedFrom: "refreshController",
    });
  }
});

app.post("/logout", (_, res) => {
  res.clearCookie("refreshToken", { path: "/refresh_token" });
  res.send({ message: "User logged out" });
});
// in the logout route set the cookies as undefined

// Logout endpoint
// app.post("/logout", async (req, res) => {
//   try {
//     // Get the JWT token from the request headers
//     const token = req.headers.authorization.split(" ")[1];

//     // Verify the JWT token
//     let decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

//     // Destroy the JWT token and logout the user
//     // Optionally, you can also add the token to a blacklist or revoke list to prevent future usage
//     // This is useful in case the token is compromised or stolen
//     // You can use a database or a cache like Redis to store the revoked tokens
//     // For this example, we'll just destroy the token and logout the user
//     decodedToken = null;

//     // Send a response to the client
//     res.status(200).json({
//       message: "Logout successful",
//     });
//   } catch (error) {
//     // If there's an error, send an error response to the client
//     console.error(error);
//     res.status(401).json({
//       error: "Unauthorized",
//       message: "Invalid or expired token",
//     });
//   }
// });

module.exports = app;
