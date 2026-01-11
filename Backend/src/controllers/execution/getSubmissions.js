import { pool } from "../../config/database.js";

export const getSubmissions = async (req, res) => {
    try {
        const userId = req.user.id;
        const { rows: submissions } = await pool.query(
            `SELECT 
                code,
                submitted_at,
                executed_at,
                COUNT(*) OVER() as total
             FROM submissions 
             WHERE user_id = $1 
             ORDER BY submitted_at DESC`,
            [userId]
        );
        return res.status(200).json(submissions);
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return res.status(500).json({ error: "Failed to fetch submissions" });
    }
}