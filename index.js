const express = require("express");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
require("dotenv").config();
require("./auth");
const User = require("./model/User");

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}
const app = express();
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
    res.json({ user, token });
  }
);

app.get("/auth/failure", (req, res) => {
  res.send("something went wrong...");
});

app.get("/protected", isLoggedIn, (req, res) => {
  res.send(req.user.displayName);
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Error logging out:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.redirect("/");
  });
  req.session.destroy();
  res.send("Goodbye!");
});

app.listen(5000, () => console.log("listening on: 5000"));
