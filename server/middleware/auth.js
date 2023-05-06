"use strict";
require("dotenv").config();
const jwt = require("jsonwebtoken");

// if you want to create a middleware, so that ypu don't have to call a particular code again and again
// use next, so that working flow is passed forward
const auth = (req, res, next) => {
  try {
    //get token from cookie
    const { token } = req.cookies;
    console.log("req.cookies", req.cookies);
    // if no token, stop
    if (!token) {
      res.status(403).send({ message: "User not logged in" });
    }
    //if token, decode it and get id which we had sent while creating token
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = decodedToken;
  } catch (error) {
    res.status(401).send({ message: "Invalid token" }); // incorrect token
  }
  next();
};

// alternate way of Auth
const isAuth = (req, res, next) => {
  const authoriszation = req.headers["authorization"];
  console.log("authoriszation", authoriszation);
  // Authorization: `Bearer ${token}`,
  if (!authoriszation) {
    res.status(403).send({ message: "User not logged in" });
  }
  const token = authoriszation.split(" ")[1];
  const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
  req.user = decodedToken;
  next();
};

module.exports = { auth, isAuth };
