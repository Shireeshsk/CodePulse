import bcrypt from 'bcryptjs';
import { pool } from '../../config/database.js';

/**
 * Create admin user (Admin only)
 * Allows existing admin to create new admin accounts
 */
export const createAdmin = async (req, res) => {
    try {
        const { full_name, email, password } = req.body;

        // Validate input
        if (!full_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Full name, email, and password are required'
            });
        }

        // Check if email already exists
        const { rows: existingUser } = await pool.query(
            `SELECT id FROM users WHERE email = $1`,
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin user
        const { rows } = await pool.query(
            `INSERT INTO users (full_name, email, password, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id, full_name, email, role, created_at`,
            [full_name, email, hashedPassword, 'ADMIN']
        );

        return res.status(201).json({
            success: true,
            message: 'Admin user created successfully',
            user: rows[0]
        });
    } catch (error) {
        console.error('Create admin error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create admin user',
            error: error.message
        });
    }
};
