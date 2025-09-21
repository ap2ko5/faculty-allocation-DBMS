const express = require('express');
const router = express.Router();
const db = require('./db');

/**
 * @route   GET /api/allocations/view/:teacher_id?
 * @desc    Get a detailed view of allocations, optionally for a single teacher
 * @access  Public
 */
router.get('/view/:teacher_id?', async (req, res) => {
    const { teacher_id } = req.params;
    try {
        // This query joins all necessary tables to get a full picture of each allocation
        let queryText = `
            SELECT
                t.teacher_id,
                t.name AS teacher_name,
                t.email,
                t.department AS teacher_department,
                c.class_name,
                s.subject_name,
                s.subject_code,
                ts.day_of_week,
                ts.start_time,
                ts.end_time,
                a.academic_year
            FROM
                teachers t
            LEFT JOIN
                allocations a ON t.teacher_id = a.teacher_id
            LEFT JOIN
                classes c ON a.class_id = c.class_id
            LEFT JOIN
                subjects s ON a.subject_id = s.subject_id
            LEFT JOIN
                time_slots ts ON a.timeslot_id = ts.timeslot_id
        `;
        const queryParams = [];

        if (teacher_id) {
            queryText += ` WHERE t.teacher_id = $1`;
            queryParams.push(teacher_id);
        }

        queryText += ` ORDER BY
                t.name, ts.day_of_week, ts.start_time;
        `;
        const { rows } = await db.query(queryText, queryParams);

        // Group the flat list of allocations by teacher for a structured response
        const teachersWithAllocations = rows.reduce((acc, row) => {
            const { teacher_id, teacher_name, email, teacher_department, ...allocationDetails } = row;

            if (!acc[teacher_id]) {
                acc[teacher_id] = { teacher_id, name: teacher_name, email, department: teacher_department, allocations: [] };
            }

            // Only add allocation details if they exist (due to the LEFT JOIN)
            if (allocationDetails.class_name) {
                acc[teacher_id].allocations.push(allocationDetails);
            }

            return acc;
        }, {});

        res.json(Object.values(teachersWithAllocations));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;