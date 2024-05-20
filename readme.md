Step-by-Step Integration of Google OAuth2 with JWT Authentication in an Express Application

1 .npm install express express-session passport passport-google-oauth2 mongoose dotenv jsonwebtoken cookie-parser

2.
project-root/
├── auth.js
├── verifyJwt.js
├── index.js
├── .env
├── model/
│   └── User.js
└── package.json

3 
.Add your environment variables in a .env file

Here's your environment variable configuration in markdown format:

```plaintext
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-jwt-secret
MONGODB_URI=your-mongodb-uri
```





Set up the Express application and configure middleware:

Sure, here's your code converted to markdown:

```javascript
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();
require("./auth");
const User = require("./model/User");
const verifyToken = require("./authverifJwt");

const app = express();

app.use(cookieParser()); // Add cookie parser middleware
app.use(session({ 
  secret: "cats", 
  resave: false, 
  saveUninitialized: true 
}));
app.use(passport.initialize());
// Since we are using JWT, we don't need to use passport.session()

app.get("/", (req, res) => {
  res.send('<a href="/auth/google">Authenticate with Google</a>');
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const { user, token } = req.user;

    // Set JWT token as a cookie
    res.cookie('jwt', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    // Redirect to protected route
    res.redirect("/protected");
  }
);

app.get("/auth/failure", (req, res) => {
  res.send("Something went wrong...");
});

app.get("/protected", verifyToken, (req, res) => {
  res.send(`Hello, ${req.user.displayName}`);
});

app.get("/logout", (req, res) => {
  res.clearCookie('jwt');
  res.send("Goodbye!");
});

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Could not connect to MongoDB...", err));

app.listen(5000, () => console.log("Listening on: 5000"));
```

Configure Passport with Google OAuth2 and JWT

Set up Passport with Google OAuth2 strategy and add JWT token generation:

Here's your code in markdown format:

```javascript
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const jwt = require("jsonwebtoken");
const User = require("./model/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/google/callback",
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        // Check if the user already exists in our database
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

        // Pass the JWT token along with the user object
        return done(null, { user, token });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
```

6.Verify JWT Token Middleware

Here's your code in markdown format:

```javascript
const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const token = req.cookies.jwt; // Get the token from the cookie
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = decoded; // Set decoded user information in request object
    next();
  });
}

module.exports = verifyToken;
```
Define Mongoose User Model

###### Create the User schema for MongoDB using Mongoose:

Here's your Mongoose model for the User schema in markdown format:

```javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model("User", userSchema);
```
Add connection logic in index.js:

Here's the code snippet to connect to MongoDB using Mongoose in markdown format:

```javascript
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Could not connect to MongoDB...", err));
```

To convert the instruction "npm start" into markdown, you can simply write it as a code block:

```markdown
npm start
```

Happy coding 
Please star repo