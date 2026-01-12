import { pool } from '../../config/database.js';

/**
 * Update user role (Admin only)
 * Allows admin to promote users to admin or demote to user
 */
export const updateUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;

        // Validate role
        if (!['USER', 'ADMIN'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be USER or ADMIN'
            });
        }

        // Check if user exists
        const { rows: existingUser } = await pool.query(
            `SELECT id, email, role FROM users WHERE id = $1`,
            [userId]
        );

        if (existingUser.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent admin from demoting themselves
        if (userId === req.user.id && role === 'USER') {
            return res.status(403).json({
                success: false,
                message: 'You cannot demote yourself'
            });
        }

        // Update user role
        const { rows } = await pool.query(
            `UPDATE users 
             SET role = $1, updated_at = NOW()
             WHERE id = $2
             RETURNING id, full_name, email, role`,
            [role, userId]
        );

        return res.status(200).json({
            success: true,
            message: `User role updated to ${role}`,
            user: rows[0]
        });
    } catch (error) {
        console.error('Update user role error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update user role',
            error: error.message
        });
    }
};
