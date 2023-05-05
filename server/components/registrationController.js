const db = require("./../db.config");
const { v4: uuidv4 } = require("uuid");
const { verify } = require("jsonwebtoken");
const { hash, compare } = require("bcryptjs");

// register user endpoint
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, mobileNumber, profilePicture, password } =
      req.body;
    // validation 422

    // if user exists 4xx
    // if (userExists) {
    //   res.status(401).send("User already exists");
    // }

    //password hashing
    const encryptedPassword = await hash(password, 7);
    const uuid = uuidv4();
    const date = new Date().toISOString().slice(0, 19).replace("T", " "); // convert the date to a string in ISO format, then remove the time and replace the 'T' with a space
    console.log("------------------", date);
    // call registerUser stored procedure using Sequelize's query method
    // const result = await db.sequelize.query(
    //   `CALL registerUser('${uuid}','${firstName}','${lastName}','${mobileNumber}','${encryptedPassword}','${profilePicture}','${date}')`,
    //   { timeout: 5000 } // Timeout after 5 seconds
    // );

    // console.log("---------result: -----------", result);
    // console.log("---------metadata: -----------", metadata);

    // return data from sql to genearte a token for it - userPayload
    //generate token
    // const token = jwt.sign(
    //   { id: userPayload.id, email },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "1h" }
    // );
    // userPayload.token = token;
    // userPayload.password = undefined; // since we don't want to send it to client

    res.status(201);
    // .json(userPayload);
    //image pending
    //send payload to query
  } catch (error) {
    res.status(500).send({
      message: error.message,
      errorLoggedFrom: "registrationController",
    });
  }
};

// app.post("/register", async (req, res) => {
//   const { email, password } = req.body;

//   res.status(200).json({ message: "User registered successfully" });
// });

// // login endpoint
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   // call loginUser stored procedure using Sequelize's query method
//   const [result, metadata] = await db.sequelize.query(
//     `CALL loginUser('${email}', '${password}', @userId)`
//   );
//   const userId = metadata[0].outParams.userId;

//   if (userId) {
//     res.status(200).json({ message: "User logged in successfully", userId });
//   } else {
//     res.status(401).json({ message: "Invalid email or password" });
//   }
// });

module.exports = registerUser;
