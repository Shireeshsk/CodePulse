import { pool } from "../../config/database.js";

export const ProblemStructure = async (req, res) => {
    try {
        const problemId = req.params.id;

        // Get problem details - using correct column name 'description' not 'statement'
        const problemResult = await pool.query(
            `SELECT id, title, description, difficulty, created_at 
             FROM problems 
             WHERE id = $1`,
            [problemId]
        );

        if (problemResult.rows.length === 0) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        // Get languages with boilerplate code AND test_runner_template
        const languagesResult = await pool.query(
            `SELECT language, boilerplate_code, test_runner_template 
             FROM problem_languages 
             WHERE problem_id = $1
             ORDER BY language`,
            [problemId]
        );

        // Get test cases - fixed SQL syntax error (missing closing quote)
        const testCasesResult = await pool.query(
            `SELECT input, output 
             FROM test_cases 
             WHERE problem_id = $1 AND visibility = 'SAMPLE'
             ORDER BY created_at`,
            [problemId]
        );

        // Structure response to match frontend expectations
        return res.status(200).json({
            id: problemResult.rows[0].id,
            title: problemResult.rows[0].title,
            description: problemResult.rows[0].description,
            difficulty: problemResult.rows[0].difficulty,
            created_at: problemResult.rows[0].created_at,
            boilerplates: languagesResult.rows.map(row => ({
                language: row.language,
                boilerplate_code: row.boilerplate_code,
                test_runner_template: row.test_runner_template
            })),
            testcases: testCasesResult.rows.map(row => ({
                input: row.input,
                expected_output: row.output
            }))
        });
    } catch (err) {
        console.error('Error fetching problem structure:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
