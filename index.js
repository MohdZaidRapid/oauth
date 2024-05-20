const express = require("express");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();
require("./auth");
const User = require("./model/User");
const verifyToken = require("./authverifJwt");

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}
const app = express();
app.use(cookieParser());
app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send('<a href="/auth/google">Autheticate with Google</a>');
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    // Extract the user and token from the authentication result
    const { user, token } = req.user;

    // Redirect or send response with JWT token
    // For example, you can send it as JSON

    res.cookie("jwt", token, { httpOnly: true, secure: false }); // secure: true for HTTPS

    // Redirect to protected route
    res.redirect("/protected");
  }
);

app.get("/auth/failure", (req, res) => {
  res.send("something went wrong...");
});

app.get("/protected", verifyToken, async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.json({ user: user });
});

app.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.send("Goodbye!");
});

app.listen(5000, () => console.log("listening on: 5000"));
