import React, { useState, useEffect } from "react";

const DEV_URL =
  process.env.NODE_ENV === "development" ? "http://localhost:3000" : "";

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Call self-hosted API to get users response
    async function fetchUsers() {
      try {
        const res = await fetch(`${DEV_URL}/users`);
        const usersData = await res.json();
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="App">
      <h1>Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.id} - {user.username}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
