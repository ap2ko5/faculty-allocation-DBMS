require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db'); // Import the database connection module

const app = express();
const port = process.env.PORT || 5001;

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
app.use('/api/teachers', require('./routes/teachers'));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});