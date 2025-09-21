const express = require('express');
const router = express.Router();
const db = require('./db');

/**
 * @route   GET /api/preferences/:teacher_id
 * @desc    Get all preferences for a specific teacher for the current year
 * @access  Private (should be protected)
 */
router.get('/:teacher_id', async (req, res) => {
    const { teacher_id } = req.params;
    const academic_year = "2024-2025"; // This should be dynamic in a real app

    try {
        const { rows } = await db.query(
            'SELECT s.subject_id, s.subject_name, s.subject_code, tp.rank FROM teacher_preferences tp JOIN subjects s ON tp.subject_id = s.subject_id WHERE tp.teacher_id = $1 AND tp.academic_year = $2 ORDER BY tp.rank',
            [teacher_id, academic_year]
        );
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   POST /api/preferences
 * @desc    Submit or update teacher preferences
 * @access  Private (should be protected)
 */
router.post('/', async (req, res) => {
    const { teacher_id, preferences } = req.body; // preferences is an array of { subject_id, rank }
    const academic_year = "2024-2025";

    if (!teacher_id || !preferences || !Array.isArray(preferences)) {
        return res.status(400).json({ msg: 'Invalid data submitted' });
    }

    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        // First, clear existing preferences for that year
        await client.query('DELETE FROM teacher_preferences WHERE teacher_id = $1 AND academic_year = $2', [teacher_id, academic_year]);
        // Then, insert the new ones
        for (const pref of preferences) {
            await client.query('INSERT INTO teacher_preferences (teacher_id, subject_id, rank, academic_year) VALUES ($1, $2, $3, $4)', [teacher_id, pref.subject_id, pref.rank, academic_year]);
        }
        await client.query('COMMIT');
        res.status(201).json({ msg: 'Preferences saved successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Server Error');
    } finally {
        client.release();
    }
});

module.exports = router;