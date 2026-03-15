// Import the MySQL module that supports Promises for modern async/await syntax
import mysql from "mysql2/promise";
// Import dotenv to read environment variables from a .env file
import dotenv from "dotenv";

// Load environment variables into process.env
dotenv.config();

// Create a connection pool to the database rather than a single connection.
// A pool manages multiple connections, improving performance and reliability.
const pool = mysql.createPool({
  host: process.env.DB_HOST,         // Database server host (e.g., localhost)
  user: process.env.DB_USER,         // Database username
  password: process.env.DB_PASSWORD, // Database password
  database: process.env.DB_NAME,     // Name of the database to connect to
});

// Export the pool so it can be used to query the database in other parts of the app
export default pool;