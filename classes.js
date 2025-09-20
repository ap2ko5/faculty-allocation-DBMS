const express = require('express');
const router = express.Router();
const db = require('./db');

// @route   GET /api/classes
// @desc    Get all classes
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM classes ORDER BY year DESC, semester DESC');
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/classes
// @desc    Create a new class
router.post('/', async (req, res) => {
    const { class_name, semester, year, department } = req.body;
    if (!class_name || !semester || !year) {
        return res.status(400).json({ msg: 'Please provide class name, semester, and year' });
    }
    try {
        const { rows } = await db.query(
            'INSERT INTO classes (class_name, semester, year, department) VALUES ($1, $2, $3, $4) RETURNING *',
            [class_name, semester, year, department]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') { // unique_violation
            return res.status(400).json({ msg: 'A class with this name already exists for the specified year.' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/classes/:id
// @desc    Update a class
router.put('/:id', async (req, res) => {
    const { class_name, semester, year, department } = req.body;
    const { id } = req.params;
    try {
        const { rows } = await db.query(
            'UPDATE classes SET class_name = $1, semester = $2, year = $3, department = $4 WHERE class_id = $5 RETURNING *',
            [class_name, semester, year, department, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ msg: 'Class not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') {
            return res.status(400).json({ msg: 'A class with this name already exists for the specified year.' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/classes/:id
// @desc    Delete a class
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deleteOp = await db.query('DELETE FROM classes WHERE class_id = $1', [id]);
        if (deleteOp.rowCount === 0) {
            return res.status(404).json({ msg: 'Class not found' });
        }
        res.json({ msg: 'Class removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;