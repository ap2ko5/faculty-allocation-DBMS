const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the centralized db query function

/**
 * @route   GET /api/teachers
 * @desc    Get all teachers
 * @access  Public (for now, will be protected later)
 */
router.get('/', async (req, res) => {
  try {
    // Select all teachers but exclude the password hash for security
    const { rows } = await db.query('SELECT teacher_id, name, email, department, expertise, max_load, created_at FROM teachers');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// You will add more routes here for creating, updating, and deleting teachers.

module.exports = router;