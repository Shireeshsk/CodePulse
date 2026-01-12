import { pool } from '../../config/database.js'
export const createProblem = async (req, res) => {
    const client = await pool.connect();
    try {
        const userId = req.user.id;
        const { title, description, difficulty } = req.body
        await client.query('BEGIN')
        const { rows } = await client.query(`INSERT INTO problems(user_id,title,description,difficulty)
            values($1,$2,$3,$4) RETURNING *`, [userId, title, description, difficulty])
        await client.query('COMMIT')
        return res.status(200).json({ data: rows[0] })
    } catch (err) {
        await client.query('ROLLBACK')
        console.log(err)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
    finally {
        client.release()
    }
}