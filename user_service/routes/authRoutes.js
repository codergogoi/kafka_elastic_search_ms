const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

require("dotenv").config();

const router = express.Router();

const gereateToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const userExists = await db.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (userExists.rows.length > 0) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await db.query(
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
    [username, email, hashedPassword]
  );

  return res
    .status(201)
    .json({ message: "User created", user: newUser.rows[0] });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);

  if (user.rows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  const validPassword = await bcrypt.compare(password, user.rows[0].password);
  if (!validPassword) {
    return res.status(400).json({ message: "Invalid password" });
  }

  const token = gereateToken({
    id: user.rows[0].id,
    email: user.rows[0].email,
  });

  return res.status(200).json({ message: "Login successful", token });
});

router.get("/validate", async (req, res) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const tokenData = token.split(" ")[1];
    const user = jwt.verify(tokenData, process.env.JWT_SECRET);
    return res.status(200).json({ ...user });
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
});

module.exports = router;

/*
if you would like to use middleware to authorize routes, you can use the following code:

// Middleware to authorize routes
const requestAuthorizer = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  const tokenData = token.split(" ")[1];
  jwt.verify(tokenData, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = decoded;
    next();
  });
};

 
// Example of a protected route
 router.get("/profile", requestAuthorizer, async (req, res) => {

  // if user is authorized, their details will be available in req
  const authorisedUser = req.user;

    
   return res.json({ 
      message: "User profile fetched successfully",
      user: req.user,
    });
 });
 
 */
