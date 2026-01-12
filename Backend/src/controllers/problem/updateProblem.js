import { pool } from '../../config/database.js';

/**
 * Update problem details (Admin only)
 * Allows updating title, description, or difficulty
 */
export const updateProblem = async (req, res) => {
    const client = await pool.connect();
    try {
        const { problemId } = req.params;
        const { title, description, difficulty } = req.body;

        // Check if problem exists
        const { rows: existingProblem } = await client.query(
            `SELECT id FROM problems WHERE id = $1`,
            [problemId]
        );

        if (existingProblem.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        // Build dynamic update query
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (title !== undefined) {
            updates.push(`title = $${paramCount++}`);
            values.push(title);
        }
        if (description !== undefined) {
            updates.push(`description = $${paramCount++}`);
            values.push(description);
        }
        if (difficulty !== undefined) {
            updates.push(`difficulty = $${paramCount++}`);
            values.push(difficulty);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        // Add updated_at
        updates.push(`updated_at = NOW()`);
        values.push(problemId);

        await client.query('BEGIN');

        const { rows } = await client.query(
            `UPDATE problems 
             SET ${updates.join(', ')}
             WHERE id = $${paramCount}
             RETURNING *`,
            values
        );

        await client.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: 'Problem updated successfully',
            problem: rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Update problem error:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to update problem',
            error: err.message
        });
    } finally {
        client.release();
    }
};
