import { pool } from '../../config/database.js';

/**
 * Get all users (Admin only)
 * Returns list of all users with their basic info
 */
export const getAllUsers = async (req, res) => {
    try {
        const { rows: users } = await pool.query(
            `SELECT id, full_name, email, role, created_at
             FROM users
             ORDER BY created_at DESC`
        );

        return res.status(200).json({
            success: true,
            users,
            total: users.length
        });
    } catch (error) {
        console.error('Get all users error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};
