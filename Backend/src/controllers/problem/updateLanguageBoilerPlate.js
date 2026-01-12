import { pool } from "../../config/database.js";

export const updateLanguageBoilerPlate = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params; // problem_languages table id
        const { boilerplate_code, test_runner_template } = req.body;

        await client.query('BEGIN');

        const { rows } = await client.query(
            `UPDATE problem_languages 
             SET boilerplate_code = COALESCE($1, boilerplate_code),
                 test_runner_template = COALESCE($2, test_runner_template)
             WHERE id = $3 
             RETURNING *`,
            [boilerplate_code, test_runner_template, id]
        );

        if (rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Boilerplate not found' });
        }

        await client.query('COMMIT');
        return res.status(200).json({
            success: true,
            message: 'Boilerplate updated successfully',
            boilerplate: rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Update boilerplate error:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        client.release();
    }
};
