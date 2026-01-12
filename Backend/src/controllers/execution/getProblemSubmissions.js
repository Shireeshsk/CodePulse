import { pool } from "../../config/database.js";

/**
 * Get user's submission history for a specific problem
 */
export const getProblemSubmissions = async (req, res) => {
    try {
        const { problemId } = req.params;
        const userId = req.user.id;

        const { rows } = await pool.query(
            `SELECT 
        id,
        language,
        status,
        submitted_at
       FROM problem_submissions 
       WHERE problem_id = $1 AND user_id = $2
       ORDER BY submitted_at DESC
       LIMIT 20`,
            [problemId, userId]
        );

        return res.status(200).json({
            success: true,
            submissions: rows
        });

    } catch (err) {
        console.error("Get submissions error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch submissions",
            error: err.message,
        });
    }
};

/**
 * Get specific submission details
 */
export const getSubmissionDetails = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const userId = req.user.id;

        const { rows } = await pool.query(
            `SELECT 
        ps.id,
        ps.problem_id,
        ps.language,
        ps.code,
        ps.status,
        ps.submitted_at,
        p.title as problem_title
       FROM problem_submissions ps
       JOIN problems p ON ps.problem_id = p.id
       WHERE ps.id = $1 AND ps.user_id = $2`,
            [submissionId, userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });
        }

        return res.status(200).json({
            success: true,
            submission: rows[0]
        });

    } catch (err) {
        console.error("Get submission details error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch submission details",
            error: err.message,
        });
    }
};
