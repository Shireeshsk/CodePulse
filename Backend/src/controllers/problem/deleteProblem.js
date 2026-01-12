import { pool } from "../../config/database.js";

export const deleteProblem = async (req, res) => {
    const client = await pool.connect();
    try {
        const { problemId } = req.params;

        await client.query('BEGIN');

        // Check if problem exists
        const { rows } = await client.query('SELECT id FROM problems WHERE id = $1', [problemId]);
        if (rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Problem not found' });
        }

        // Deletions are likely handled by CASCADE in DB, 
        // but we explicitly delete here to be safe and ensure full cleanup if not.
        // Order: Submissions -> Test Cases -> Boilerplates -> Problem
        await client.query('DELETE FROM problem_submissions WHERE problem_id = $1', [problemId]);
        await client.query('DELETE FROM test_cases WHERE problem_id = $1', [problemId]);
        await client.query('DELETE FROM problem_languages WHERE problem_id = $1', [problemId]);
        await client.query('DELETE FROM problems WHERE id = $1', [problemId]);

        await client.query('COMMIT');
        return res.status(200).json({
            success: true,
            message: 'Problem and all associated data deleted successfully'
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Delete problem error:', err);
        return res.status(500).json({ message: 'Internal Server Error', error: err.message });
    } finally {
        client.release();
    }
};
