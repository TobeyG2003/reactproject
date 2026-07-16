import express from "express";
import mysql from "mysql2";

const app = express();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "sqlPass03",
  database: "mydatabase",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed. Start MySQL and verify your credentials.");
    console.error(err.message);
    return;
  }

  console.log("Connected to MySQL");

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(createUsersTable, (error) => {
    if (error) {
      console.error("Error creating users table:", error);
      return;
    }
    console.log("users table ready");
  });
});

app.get("/", (req, res) => {
  res.json("Hello from the backend!");
});

app.get("/users", (req, res) => {
  const q = "SELECT * FROM users";

  db.query(q, (err, data) => {
    if (err) {
      console.error("Failed to fetch users:", err.message);
      return res.status(500).json({ error: "Unable to read users from the database." });
    }
    return res.json(data);
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000!");
});
