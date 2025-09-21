require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db'); // Import the database connection module

const app = express();
const port = process.env.PORT || 5001;

// Ensure all required environment variables are present
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_DATABASE', 'DB_PASSWORD', 'DB_PORT'];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`Error: Missing required environment variable: ${varName}.`);
    console.error('Please ensure you have a .env file with all required variables, or that they are set in your environment.');
    process.exit(1); // Exit with a failure code
  }
}

// Middleware
app.use(cors());
app.use(express.json()); // for parsing application/json

// Test DB connection on startup
db.query('SELECT NOW()')
  .then(res => {
    console.log('Database connected successfully at:', res.rows[0].now);
  })
  .catch(err => {
    console.error('Error connecting to the database', err.stack);
  });

// A basic test route
app.get('/', (req, res) => {
  res.send('Welcome to the Faculty Allocation API!');
});

// --- API Routes will go here ---
// Mount the teacher routes on the /api/teachers path
app.use('/api/teachers', require('./teachers'));
app.use('/api/classes', require('./classes'));
app.use('/api/subjects', require('./subjects'));
app.use('/api/allocations', require('./allocations'));
app.use('/api/preferences', require('./preferences'));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});