const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// Register Route
router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: "All fields are required" });

        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ error: "User already exists" });

        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Login Route
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await user.comparePassword(password))) {
            return res.render("login", { error: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie("token", token, { httpOnly: true });

        res.redirect("/books");
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Logout Route
router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
});

module.exports = router;
