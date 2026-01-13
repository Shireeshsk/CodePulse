import { pool } from '../../config/database.js';
import { sendEmail } from '../../utils/sendEmail.js';

export const ForgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const { rows } = await pool.query(
            'SELECT id, full_name FROM users WHERE email = $1',
            [email]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: 'No account Associated with the given email'
            });
        }

        const user = rows[0];

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60000); // 10 minutes from now

        // Save OTP to database
        await pool.query(
            'UPDATE users SET otp = $1, otp_created_at = CURRENT_TIMESTAMP, otp_expires_at = $2 WHERE email = $3',
            [otp, otpExpires, email]
        );

        const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #ffffff; border: 1px solid #e1e4e8; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <h2 style="color: #137fec; margin-top: 0; text-align: center;">Verify Your Account</h2>
        <p style="color: #444; font-size: 16px; line-height: 1.5;">Hi ${user.full_name},</p>
        <p style="color: #444; font-size: 16px; line-height: 1.5;">You requested a password reset for your CodePulse account. Please use the following 6-digit One-Time Password (OTP) to proceed. This code is valid for 10 minutes.</p>
        
        <div style="text-align: center; margin: 40px 0;">
          <div style="display: inline-block; background-color: #f8f9fa; border: 2px dashed #137fec; padding: 20px 40px; border-radius: 8px;">
            <span style="font-size: 36px; font-weight: 800; color: #137fec; letter-spacing: 8px;">${otp}</span>
          </div>
        </div>
        
        <p style="color: #6a737d; font-size: 14px; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
          &copy; 2026 CodePulse - Master the Art of Coding
        </div>
      </div>
    `;

        try {
            await sendEmail({
                email: email,
                subject: 'Your Password Reset OTP - CodePulse',
                html: html
            });

            return res.status(200).json({
                message: 'OTP sent to your email.'
            });
        } catch (emailError) {
            console.error('Email Sending failed:', emailError);
            return res.status(200).json({
                message: 'Email service error (Dev Fallback).',
                otp: otp // Fallback for dev testing
            });
        }

    } catch (error) {
        console.error('Forgot Password Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
