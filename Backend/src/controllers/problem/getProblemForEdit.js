import { pool } from '../../config/database.js';

/**
 * Get problem with all test cases (Admin only)
 * Returns problem details with all test cases for editing
 */
export const getProblemForEdit = async (req, res) => {
    try {
        const { problemId } = req.params;

        // Get problem details
        const { rows: problemRows } = await pool.query(
            `SELECT * FROM problems WHERE id = $1`,
            [problemId]
        );

        if (problemRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        // Get all test cases (including hidden ones for admin)
        const { rows: testCases } = await pool.query(
            `SELECT * FROM test_cases 
             WHERE problem_id = $1 
             ORDER BY visibility DESC, created_at ASC`,
            [problemId]
        );

        // Get all language boilerplates
        const { rows: boilerplates } = await pool.query(
            `SELECT * FROM problem_languages 
             WHERE problem_id = $1
             ORDER BY language ASC`,
            [problemId]
        );

        return res.status(200).json({
            success: true,
            problem: {
                ...problemRows[0],
                testCases,
                boilerplates
            }
        });
    } catch (error) {
        console.error('Get problem for edit error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch problem',
            error: error.message
        });
    }
};
