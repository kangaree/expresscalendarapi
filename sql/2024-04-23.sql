DROP TABLE IF EXISTS federated_credentials,
calendars,
"session",
users,
users_calendars;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE,
    hashed_password BYTEA,
    salt BYTEA,
    name TEXT,
    -- TODO: add constraint- unique or null.
    email TEXT,
    email_verified BOOLEAN
);

-- for later. set up with google calendar.
CREATE TABLE IF NOT EXISTS federated_credentials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    provider TEXT NOT NULL,
    subject TEXT NOT NULL,
    UNIQUE (provider, subject)
);

CREATE TABLE IF NOT EXISTS calendars (
    id SERIAL PRIMARY KEY,
    title TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users_calendars (
    user_id INTEGER REFERENCES users(id),
    calendar_id INTEGER REFERENCES calendars(id),
    PRIMARY KEY (user_id, calendar_id)
);

-- connect-pg-simple
CREATE TABLE IF NOT EXISTS "session" (
    "sid" varchar NOT NULL COLLATE "default",
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL
) WITH (OIDS = FALSE);

ALTER TABLE
    "session"
ADD
    CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");