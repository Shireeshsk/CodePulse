import { pool } from "../../config/database.js";

export const getSubmissions = async (req, res) => {
    try {
        const userId = req.user.id;
        const { rows: submissions } = await pool.query(
            `SELECT 
                ps.id,
                ps.code,
                ps.language,
                ps.status,
                ps.submitted_at,
                p.title,
                p.difficulty,
                COUNT(*) OVER() as total
             FROM problem_submissions ps
             JOIN problems p ON ps.problem_id = p.id
             WHERE ps.user_id = $1 
             ORDER BY ps.submitted_at DESC`,
            [userId]
        );
        return res.status(200).json(submissions);
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return res.status(500).json({ error: "Failed to fetch submissions" });
    }
}