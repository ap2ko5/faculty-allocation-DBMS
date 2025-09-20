const express = require('express');
const router = express.Router();
const db = require('./db');

// @route   GET /api/subjects
// @desc    Get all subjects
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM subjects ORDER BY subject_name');
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/subjects
// @desc    Create a new subject
router.post('/', async (req, res) => {
    const { subject_code, subject_name, department, credits } = req.body;
    if (!subject_code || !subject_name) {
        return res.status(400).json({ msg: 'Please provide subject code and name' });
    }
    try {
        const { rows } = await db.query(
            'INSERT INTO subjects (subject_code, subject_name, department, credits) VALUES ($1, $2, $3, $4) RETURNING *',
            [subject_code, subject_name, department, credits]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') { // unique_violation
            return res.status(400).json({ msg: 'Subject code must be unique.' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/subjects/:id
// @desc    Update a subject
router.put('/:id', async (req, res) => {
    const { subject_code, subject_name, department, credits } = req.body;
    const { id } = req.params;
    try {
        const { rows } = await db.query(
            'UPDATE subjects SET subject_code = $1, subject_name = $2, department = $3, credits = $4 WHERE subject_id = $5 RETURNING *',
            [subject_code, subject_name, department, credits, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ msg: 'Subject not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') {
            return res.status(400).json({ msg: 'Subject code must be unique.' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/subjects/:id
// @desc    Delete a subject
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deleteOp = await db.query('DELETE FROM subjects WHERE subject_id = $1', [id]);
        if (deleteOp.rowCount === 0) {
            return res.status(404).json({ msg: 'Subject not found' });
        }
        res.json({ msg: 'Subject removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;