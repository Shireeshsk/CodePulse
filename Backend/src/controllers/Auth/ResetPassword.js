import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../../config/database.js';

export const ResetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;

    try {
        const decoded = jwt.decode(resetToken);
        if (!decoded || !decoded.id) {
            return res.status(400).json({ message: 'Invalid or expired reset session' });
        }

        const { rows } = await pool.query(
            'SELECT id, otp FROM users WHERE id = $1',
            [decoded.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = rows[0];

        // Verify the reset token using the secret that included the OTP
        const secret = process.env.ACCESS + user.otp;

        try {
            jwt.verify(resetToken, secret);
        } catch (err) {
            return res.status(400).json({ message: 'Session expired or already used. Please restart the process.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear OTP fields
        await pool.query(
            `UPDATE users 
       SET password = $1, 
           otp = NULL, 
           otp_created_at = NULL, 
           otp_expires_at = NULL, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
            [hashedPassword, user.id]
        );

        return res.status(200).json({ message: 'Password reset successful' });

    } catch (error) {
        console.error('Reset Password Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
