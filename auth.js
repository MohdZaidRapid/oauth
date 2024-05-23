const passport = require("passport");
const mongoose = require("mongoose");
const User = require("./model/User");
const jwt = require("jsonwebtoken");

require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const GoogleStrategy = require("passport-google-oauth2").Strategy;
// initialize google strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/google/callback",
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      console.log(profile);
      //   User.findOrCreate({ googleId: profile.id }, function (err, user) {
      //     return done(err, user);
      //   });
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          // If user does not exist, create a new user
          user = new User({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.email,
          });
          await user.save();
        }

        // Generate JWT token
        const token = jwt.sign(
          {
            userId: user._id,
            email: user.email,
            displayName: user.displayName,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1h" } // Token expires in 1 hour, adjust as needed
        );
        return done(null, { user, token });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(async function (user, done) {
  //   console.log(userobj);
  try {
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
