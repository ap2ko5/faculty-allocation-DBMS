const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool instance. The pool will manage client connections
// and reuse them, which is more efficient than creating a new client
// for every query. It reads connection details from environment variables.
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Export a query function that will be used throughout the application
// to interact with the database.
module.exports = {
  query: (text, params) => pool.query(text, params),
};