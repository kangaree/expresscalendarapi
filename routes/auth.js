var express = require("express");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var crypto = require("crypto");
var db = require("../db");

// Function to hash password
function hashPassword(password) {
  var salt = crypto.randomBytes(16);
  var hash = crypto.pbkdf2Sync(password, salt, 310000, 32, "sha256");
  return {
    salt: salt,
    hash: hash,
  };
}

// Function to verify password
function verifyPassword(password, hashedPassword, salt) {
  var verifyHash = crypto.pbkdf2Sync(password, salt, 310000, 32, "sha256");

  return crypto.timingSafeEqual(hashedPassword, verifyHash);
}

// Passport.js (local strategy- setting a user locally)
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // Find user by username in your PostgreSQL database
      var result = await db.query("SELECT * FROM users WHERE username = $1", [
        username,
      ]);
      var user = result.rows[0];

      if (!user) {
        return done(null, false, { message: "Incorrect username." });
      }

      // Verify password
      if (!verifyPassword(password, user.hashed_password, user.salt)) {
        return done(null, false, { message: "Incorrect password." });
      }

      // Successful authentication
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser(function (user, done) {
  process.nextTick(function () {
    done(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function (user, done) {
  process.nextTick(function () {
    return done(null, user);
  });
});

var router = express.Router();

router.get("/login", function (req, res, next) {
  res.render("login");
});

router.post(
  "/login/password",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

router.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.get("/signup", function (req, res, next) {
  res.render("signup");
});

router.post("/signup", async function (req, res, next) {
  var { salt, hash } = hashPassword(req.body.password);

  var result = await db.query(
    "INSERT INTO users (username, hashed_password, salt) VALUES ($1, $2, $3) RETURNING id",
    [req.body.username, hash, salt]
  );

  var user = {
    id: result.rows[0].id,
    username: req.body.username,
  };

  req.login(user, function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
