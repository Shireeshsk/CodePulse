import { pool } from "../../config/database.js";

export const createLanguageBoilerPlate = async (req, res) => {
    const client = await pool.connect();
    try {
        const { problem_id, language, boilerplate_code, test_runner_template } = req.body;
        await client.query('BEGIN')

        // Insert with optional test_runner_template
        const { rows } = await client.query(
            `INSERT INTO problem_languages(problem_id, language, boilerplate_code, test_runner_template) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [problem_id, language, boilerplate_code, test_runner_template || null]
        )

        await client.query('COMMIT')
        return res.status(200).json(rows[0]);
    } catch (err) {
        await client.query('ROLLBACK')
        console.log(err)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
    finally {
        client.release()
    }
}