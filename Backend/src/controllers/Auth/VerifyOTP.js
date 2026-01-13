import { pool } from '../../config/database.js';
import jwt from 'jsonwebtoken';

export const VerifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const { rows } = await pool.query(
            'SELECT id, otp, otp_expires_at FROM users WHERE email = $1',
            [email]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = rows[0];

        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > new Date(user.otp_expires_at)) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // OTP is valid. Generate a temporary "reset token" so they can reset password.
        // This token is signed with the OTP itself so it's only valid until the OTP is cleared or changed.
        const resetSecret = process.env.ACCESS + user.otp;
        const resetToken = jwt.sign({ id: user.id, email }, resetSecret, { expiresIn: '5m' });

        return res.status(200).json({
            message: 'OTP verified successfully',
            resetToken
        });

    } catch (error) {
        console.error('Verify OTP Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
