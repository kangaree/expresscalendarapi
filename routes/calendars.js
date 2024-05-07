var express = require("express");
var router = express.Router();
var db = require("../db");

router.get(
  "/calendars",
  function (req, res, next) {
    if (!req.user) {
      return res.render("home", { title: `Express Calendar API` });
    }
    next();
  },
  fetchCalendars,
  function (req, res, next) {
    res.json(res.locals.calendars);
  }
);

router.post("/calendars", async (req, res) => {
  try {
    // Begin transaction
    await db.query("BEGIN");

    // Insert new calendar
    const calendarQuery = `
      INSERT INTO calendars (title, description)
      VALUES ($1, $2)
      RETURNING id
    `;
    const calendarValues = [req.body.title, req.body.description];
    const calendarResult = await db.query(calendarQuery, calendarValues);

    const calendarId = calendarResult.rows[0].id;

    const userCalendarQuery = `
      INSERT INTO users_calendars (user_id, calendar_id)
      VALUES ($1, $2)
    `;
    const userCalendarValues = [req.user.id, calendarId];
    await db.query(userCalendarQuery, userCalendarValues);

    // Commit transaction
    await db.query("COMMIT");

    res.redirect("/");
  } catch (error) {
    // If any error occurs, rollback transaction
    await db.query("ROLLBACK");
    console.error("Error in creating calendar:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Remove later?
router.get(
  "/api",
  function (req, res, next) {
    if (!req.user) {
      return res.render("home", { title: `Express Calendar API` });
    }
    next();
  },
  fetchCalendars,
  function (req, res, next) {
    res.render("index", { user: req.user });
  }
);

function fetchCalendars(req, res, next) {
  db.query(
    `SELECT calendars.id, calendars.title
    FROM calendars
    INNER JOIN users_calendars ON calendars.id = users_calendars.calendar_id
    WHERE users_calendars.user_id = $1`,
    [req.user.id]
  )
    .then(function (result) {
      var rows = result.rows;
      var calendars = rows.map(function (row) {
        return {
          id: row.id,
          title: row.title,
          url: "/" + row.id,
        };
      });
      res.locals.calendars = calendars;
      next();
    })
    .catch(function (err) {
      return next(err);
    });
}

module.exports = router;
