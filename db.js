const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  // Move this to an internal link, not external.
  host: process.env.PG_HOST,
  port: 5432, // default Postgres port
  database: process.env.PG_DB,
  // TODO: Remove the below. Figure out local host too.
  ssl: {
    rejectUnauthorized: false, // Use this option cautiously, it disables SSL certificate validation
    // Other SSL options may be required depending on your PostgreSQL server's configuration
  },
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};

