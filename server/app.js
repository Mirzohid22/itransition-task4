require("dotenv").config();
require("./config/database").connect();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const express = require("express");

const app = express();

const auth = require("./middleware/auth");

app.use(express.json());
app.use(cors());

// importing user context
const User = require("./model/user");

// Register
app.post("/register", async (req, res) => {
  // our register logic goes here...
  try {
    // Get user input
    const { name, email, password } = req.body;

    // Validate user input
    if (!(email && password && name)) {
      res
        .status(400)
        .send({ status: "error", message: "All input is required" });
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send({
        status: "warning",
        message: "User Already Exist. Please Login",
      });
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
      lastOnline: new Date(),
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    res
      .status(201)
      .send({ status: "success", user, message: "User created successfully" });
  } catch (err) {
    console.log(err);
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      return res
        .status(409)
        .send({ status: "error", message: "All input is required" });
    }
    // Validate if user exist
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(409).send({
        status: "warning",
        message: "Sorry, we can't find an account with this email address.",
      });
    }
    // Validate if user is active
    if (user && user.status !== "active") {
      return res.status(409).send({
        status: "warning",
        message: "User is not active. Please contact admin",
      });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token;

      // update user's lastonline
      await User.findByIdAndUpdate(user._id, { lastOnline: new Date() });

      // user
      return res.status(200).send({
        status: "success",
        user,
        message: "User logged in successfully",
      });
    }
    return res.status(401).send({
      status: "error",
      message: "Incorrect password. Please try again.",
    });
  } catch (err) {
    console.log(err);
  }
});

// Users
app.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).send({
      users,
      status: "success",
      message: "Users fetched successfully",
    });
  } catch (e) {
    return res.send({ status: "error", message: "Error in Fetching user" });
  }
});

// Activate user
app.put("/activate", auth, async (req, res) => {
  try {
    const users = req.body.users || [];
    if (users.length === 0) {
      return res.status(400).send({
        status: "error",
        message: "No users selected",
      });
    }

    // validate users

    const usersToActivate = await User.find({
      _id: { $in: users },
      status: "blocked",
    });

    if (usersToActivate.length === 0) {
      return res.status(400).send({
        status: "error",
        message: "No blocked users selected",
      });
    }
    // update users
    await User.updateMany(
      { _id: { $in: usersToActivate } },
      { status: "active" },
      { new: true }
    );

    const result = await User.find();

    return res.status(200).send({
      status: "info",
      message: "users activated",
      data: result,
    });
  } catch (e) {
    return res.send({ status: "error", message: "Error in Activating user" });
  }
});

// Deactivate user
app.put("/deactivate", auth, async (req, res) => {
  try {
    const users = req.body.users || [];

    if (users.length === 0) {
      return res
        .status(400)
        .send({ status: "error", message: "No users selected" });
    }

    // validate users
    const usersToDeactivate = await User.find({
      _id: { $in: users },
      status: "active",
    });

    if (usersToDeactivate.length === 0) {
      return res
        .status(400)
        .send({ status: "error", message: "No active users selected" });
    }

    // update users
    await User.updateMany(
      { _id: { $in: usersToDeactivate } },
      { status: "blocked" },
      { new: true }
    );

    const result = await User.find();

    return res.status(200).send({
      status: "info",
      message: "user(s) blocked",
      data: result,
    });
  } catch (e) {
    return res
      .status(400)
      .send({ status: "error", message: "Error in blocking user(s)" });
  }
});

// Delete user
app.delete("/delete", auth, async (req, res) => {
  try {
    const usersToDelete = req.body.users;

    // removing users from database
    for (let userId of usersToDelete) {
      await User.findByIdAndRemove(userId);
    }

    res.status(200).send({ status: "info", message: "user(s) deleted" });
  } catch (e) {
    res.send({ status: "error", message: "Error in deleting user" });
  }
});
module.exports = app;
