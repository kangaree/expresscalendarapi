var express = require('express');
var router = express.Router();

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

module.exports = router;
