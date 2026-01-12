import { pool } from '../../config/database.js';

/**
 * Update test case (Admin only)
 * Allows updating input, output, or visibility of existing test cases
 */
export const updateTestCase = async (req, res) => {
    const client = await pool.connect();
    try {
        const { testCaseId } = req.params;
        const { input, output, visibility } = req.body;

        // Check if test case exists
        const { rows: existingTestCase } = await client.query(
            `SELECT id FROM test_cases WHERE id = $1`,
            [testCaseId]
        );

        if (existingTestCase.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Test case not found'
            });
        }

        // Build dynamic update query
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (input !== undefined) {
            updates.push(`input = $${paramCount++}`);
            values.push(input);
        }
        if (output !== undefined) {
            updates.push(`output = $${paramCount++}`);
            values.push(output);
        }
        if (visibility !== undefined) {
            // Validate visibility
            if (!['SAMPLE', 'HIDDEN'].includes(visibility)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid visibility. Must be SAMPLE or HIDDEN'
                });
            }
            updates.push(`visibility = $${paramCount++}`);
            values.push(visibility);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        // Add updated_at
        updates.push(`updated_at = NOW()`);
        values.push(testCaseId);

        await client.query('BEGIN');

        const { rows } = await client.query(
            `UPDATE test_cases 
             SET ${updates.join(', ')}
             WHERE id = $${paramCount}
             RETURNING *`,
            values
        );

        await client.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: 'Test case updated successfully',
            testCase: rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Update test case error:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to update test case',
            error: err.message
        });
    } finally {
        client.release();
    }
};
