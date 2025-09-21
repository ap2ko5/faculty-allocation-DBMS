const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('./db'); // Import the centralized db query function

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

/**
 * @route   POST /api/teachers
 * @desc    Register a new teacher
 * @access  Public (for now, will be admin-only)
 */
router.post('/', async (req, res) => {
  const { name, email, password, department, expertise, max_load } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Please enter name, email, and password' });
  }

  try {
    // Check if teacher already exists
    let { rows } = await db.query('SELECT * FROM teachers WHERE email = $1', [email]);
    if (rows.length > 0) {
      return res.status(400).json({ msg: 'Teacher with this email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert new teacher into the database
    const newTeacher = await db.query(
      'INSERT INTO teachers (name, email, password_hash, department, expertise, max_load) VALUES ($1, $2, $3, $4, $5, $6) RETURNING teacher_id, name, email, department',
      [name, email, password_hash, department, expertise, max_load]
    );

    res.status(201).json(newTeacher.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   PUT /api/teachers/:id
 * @desc    Update a teacher's details
 * @access  Private (Admin)
 */
router.put('/:id', async (req, res) => {
    const { name, email, department, expertise, max_load } = req.body;
    const { id } = req.params;

    try {
        const { rows } = await db.query(
            'UPDATE teachers SET name = $1, email = $2, department = $3, expertise = $4, max_load = $5 WHERE teacher_id = $6 RETURNING teacher_id, name, email, department, expertise, max_load',
            [name, email, department, expertise, max_load, id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ msg: 'Teacher not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') { // unique_violation on email
            return res.status(400).json({ msg: 'Email already in use.' });
        }
        res.status(500).send('Server Error');
    }
});

/**
 * @route   DELETE /api/teachers/:id
 * @desc    Delete a teacher
 * @access  Private (Admin)
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deleteOp = await db.query('DELETE FROM teachers WHERE teacher_id = $1', [id]);
        if (deleteOp.rowCount === 0) {
            return res.status(404).json({ msg: 'Teacher not found' });
        }
        res.json({ msg: 'Teacher removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   POST /api/teachers/login
 * @desc    Authenticate a teacher and get their data
 * @access  Public
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    const { rows } = await db.query('SELECT * FROM teachers WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const teacher = rows[0];
    const isMatch = await bcrypt.compare(password, teacher.password_hash);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Exclude password hash from the response
    const { password_hash, ...user_data } = teacher;
    res.json({ msg: 'Login successful', teacher: user_data });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;