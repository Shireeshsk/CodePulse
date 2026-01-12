import { pool } from '../../config/database.js';

export const getProblemsList = async (req, res) => {
    try {
        // Get all problems with their supported languages
        // Using the correct table name: problem_languages (not language_boilerplate)
        const problemsQuery = `
            SELECT 
                p.id,
                p.title,
                p.description,
                p.difficulty,
                p.created_at,
                COALESCE(
                    json_agg(
                        DISTINCT pl.language
                    ) FILTER (WHERE pl.language IS NOT NULL),
                    '[]'::json
                ) as languages
            FROM problems p
            LEFT JOIN problem_languages pl ON p.id = pl.problem_id
            GROUP BY p.id, p.title, p.description, p.difficulty, p.created_at
            ORDER BY p.created_at DESC
        `;

        const { rows } = await pool.query(problemsQuery);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching problems list:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
