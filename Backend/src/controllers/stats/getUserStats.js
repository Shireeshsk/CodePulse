import { pool } from "../../config/database.js";

export const getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Problems Solved (Distinct problems with status 'ACCEPTED')
        const solvedQuery = `
            SELECT COUNT(DISTINCT problem_id) as solved_count 
            FROM problem_submissions 
            WHERE user_id = $1 AND status = 'ACCEPTED'
        `;
        const { rows: solvedRows } = await pool.query(solvedQuery, [userId]);
        const solvedCount = parseInt(solvedRows[0].solved_count) || 0;

        // 2. Acceptance Rate ( (ACCEPTED submissions / Total submissions) * 100 )
        const totalQuery = `
            SELECT 
                COUNT(*) as total_count,
                COUNT(*) FILTER (WHERE status = 'ACCEPTED') as accepted_count,
                COUNT(*) FILTER (WHERE status != 'ACCEPTED') as failed_count
            FROM problem_submissions 
            WHERE user_id = $1
        `;
        const { rows: totalRows } = await pool.query(totalQuery, [userId]);
        const totalSubmissions = parseInt(totalRows[0].total_count) || 0;
        const acceptedSubmissions = parseInt(totalRows[0].accepted_count) || 0;
        const failedSubmissions = parseInt(totalRows[0].failed_count) || 0;
        const acceptanceRate = totalSubmissions > 0
            ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(1)
            : 0;

        // 3. Current Streak
        // Find consecutive days with at least one submission, including today/yesterday.
        const streakQuery = `
            WITH RECURSIVE 
            user_dates AS (
                SELECT DISTINCT CAST(submitted_at AT TIME ZONE 'UTC' AS DATE) as sub_date
                FROM problem_submissions
                WHERE user_id = $1
            ),
            streak_days AS (
                (
                    SELECT 1 as streak, sub_date as last_date
                    FROM user_dates
                    WHERE sub_date >= CURRENT_DATE - INTERVAL '1 day'
                    ORDER BY sub_date DESC
                    LIMIT 1
                )
                
                UNION ALL
                
                -- Recursively add previous days
                SELECT s.streak + 1, ud.sub_date
                FROM streak_days s
                JOIN user_dates ud ON ud.sub_date = (s.last_date - INTERVAL '1 day')::DATE
            )
            SELECT COALESCE(MAX(streak), 0) as current_streak FROM streak_days
        `;
        const { rows: streakRows } = await pool.query(streakQuery, [userId]);
        const currentStreak = parseInt(streakRows[0].current_streak) || 0;

        // 4. Activity Status (Submissions by date for past year)
        const activityQuery = `
            SELECT 
                CAST(submitted_at AT TIME ZONE 'UTC' AS DATE) as date,
                COUNT(*) as count
            FROM problem_submissions
            WHERE user_id = $1 AND submitted_at >= CURRENT_DATE - INTERVAL '1 year'
            GROUP BY date
            ORDER BY date ASC
        `;
        const { rows: activityRows } = await pool.query(activityQuery, [userId]);

        return res.status(200).json({
            solvedCount: Number(solvedCount),
            acceptanceRate: Number(acceptanceRate),
            currentStreak: Number(currentStreak),
            totalSubmissions: Number(totalSubmissions),
            acceptedSubmissions: Number(acceptedSubmissions),
            failedSubmissions: Number(failedSubmissions),
            activity: activityRows
        });

    } catch (error) {
        console.error("CRITICAL: Error in getUserStats controller:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch aggregated user statistics",
            error: error.message
        });
    }
}
