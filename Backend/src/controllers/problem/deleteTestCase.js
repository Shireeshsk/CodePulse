import { pool } from '../../config/database.js';

/**
 * Delete test case (Admin only)
 */
export const deleteTestCase = async (req, res) => {
    const client = await pool.connect();
    try {
        const { testCaseId } = req.params;

        // Check if test case exists
        const { rows: existingTestCase } = await client.query(
            `SELECT id, problem_id FROM test_cases WHERE id = $1`,
            [testCaseId]
        );

        if (existingTestCase.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Test case not found'
            });
        }

        await client.query('BEGIN');

        await client.query(
            `DELETE FROM test_cases WHERE id = $1`,
            [testCaseId]
        );

        await client.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: 'Test case deleted successfully'
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Delete test case error:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete test case',
            error: err.message
        });
    } finally {
        client.release();
    }
};
