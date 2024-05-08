import React, { useState, useEffect } from "react";

const DEV_URL =
  process.env.NODE_ENV === "development" ? "http://localhost:3000" : "";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [calendars, setCalendars] = useState([]);

  useEffect(() => {
    const getUser = async () => {
      try {
        // Make this a helper function. This is for local dev, though.
        const authResponse = await fetch(`${DEV_URL}/auth/status`, {
          credentials: "include",
        });

        if (authResponse.ok) {
          const authData = await authResponse.json();
          setIsLoggedIn(authData.isAuthenticated);

          if (authData.isAuthenticated) {
            const calendarsResponse = await fetch(`${DEV_URL}/calendars`, {
              credentials: "include",
            });
            const calendars = await calendarsResponse.json();
            setCalendars(calendars);
          }
        } else {
          console.error(
            "Error checking authentication status:",
            authResponse.status
          );
        }
      } catch (error) {
        console.error("Error checking authentication status:", error);
      }
    };

    getUser();
  }, []);

  return (
    <div className="card">
      <h1>Express Calendar API</h1>
      <div>
        {isLoggedIn ? (
          <div>
            <form action={`${DEV_URL}/logout`} method="post">
              <button className="logout" type="submit">
                Sign out
              </button>
            </form>
            <form action={`${DEV_URL}/calendars`} method="post">
              <input name="title" placeholder="Add a calendar" autoFocus />
            </form>
            <ul>
              {calendars.map((calendar, index) => (
                <li key={index}>{calendar.title}</li>
              ))}
            </ul>
          </div>
        ) : (
          <a href="/login">Login</a>
        )}
      </div>
    </div>
  );
}

export default App;
