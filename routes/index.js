var express = require('express');
var router = express.Router();
var path = require("path");

// /* GET home page. */
router.get(
  "/",
  function (req, res, next) {
    if (!req.user) {
      return res.render("home", { title: `Express Calendar API` });
    }
    next();
  },
  function (req, res, next) {
    res.locals.filter = null;
    res.render("index", { user: req.user });
  }
);

router.get(["/app", "/app/*"], function (req, res, next) {
  res.sendFile(path.join(__dirname, "../public/app", "app.html"));
});

module.exports = router;
