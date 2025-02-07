const express = require("express");
const router = express.Router();
const User = require("../db/userModel");

router.post("/register", async (req, res) => {
  const {
    login_name,
    password,
    first_name,
    last_name,
    location,
    description,
    occupation,
  } = req.body;

  // Validate required fields
  if (!login_name || !password || !first_name || !last_name) {
    return res.status(400).json({
      error: "login_name, password, first_name, and last_name are required.",
    });
  }

  try {
    // Check if the login_name already exists
    const existingUser = await User.findOne({ login_name: login_name });
    if (existingUser) {
      return res.status(400).json({
        error: "Login name already exists. Please choose a different one.",
      });
    }

    // Create a new user object
    const newUser = new User({
      login_name,
      password,
      first_name,
      last_name,
      location: location || "",
      description: description || "",
      occupation: occupation || "",
    });

    // Save the new user to the database
    const savedUser = await newUser.save();

    // Respond with the user data (customize the response based on your needs)
    return res.json({
      user: newUser,
      message: "User registered successfully!",
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/login", async (req, res) => {
  const { login_name, password } = req.body;

  if (!login_name) {
    return res.status(400).json({ error: "login_name is required" });
  }

  try {
    const user = await User.findOne({ login_name: login_name });

    if (!user) {
      return res.status(400).json({ error: "Invalid login_name" });
    }
    const passwordMatch = password === user.password;

    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid login_name or password" });
    }

    req.session.user = user;
    console.log("Login successful:", req.session.user);
    return res.json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/session", (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    console.log("Session End");
    res.status(401).json({ user: null });
  }
});

// Logout endpoint
router.post("/logout", (req, res) => {
  if (!req.session.user) {
    return res
      .status(400)
      .json({ success: false, message: "No user is currently logged in" });
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Logout failed" });
    } else {
      console.log("Logged out");
      res.clearCookie("connect.sid", { path: "/" });
      return res
        .status(200)
        .json({ success: true, message: "Logout successful" });
    }
  });
});
module.exports = router;
