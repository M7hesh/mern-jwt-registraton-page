"use strict";
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { verify } = require("jsonwebtoken");
const { hash, compare } = require("bcryptjs");
const auth = require("./middleware/auth");
const db = require("./db.config");

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true })); // try w/o using it
// app.use(cors({
//   origin: "*", // all origins
//   methods: "*", // all http methods
//   allowedHeaders: "*" // all headers in HTTP request
// }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

app.post("/registration", async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;
    // validation 422

    // if user exists 4xx
    // if (userExists) {
    //   res.status(401).send("User already exists");
    // }

    //password hashing
    const encryptedPassword = await hash(password, 7);

    // return data from sql to genearte a token for it - userPayload
    //generate token
    const token = jwt.sign(
      { id: userPayload.id, email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    userPayload.token = token;
    userPayload.password = undefined; // since we don't want to send it to client

    res.status(201).json(userPayload);
    //image pending
    //send payload to query
  } catch (error) {
    res.status(500).send({
      message: error.message,
      errorLoggedFrom: "registrationController",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;
    // validation 422
    //send payload to query
    //  user found? -> userExists
    if (!userExists) {
      res.status(400).send({ message: `User doesn't exist` });
    }
    // get password from the database - const {id, password: encryptedPasswordFromDB} = userPayload
    const isPasswordCorrect = await compare(
      password,
      userPayload.encryptedPasswordFromDB
    );

    //if wrong wrong password - 401 Unauthorized
    if (!isPasswordCorrect) {
      res.status(401).send({ message: `Password Incorrect` });
    }

    // if password matches -> send token
    if (isPasswordCorrect) {
      const token = jwt.sign(
        { id: userPayload.id, email },
        process.env.TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      userPayload.token = token;
      userPayload.password = undefined; // since we don't want to send it to client
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
          userPayload, // if needed})
        });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message, errorLoggedFrom: "loginController" });
  }
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
