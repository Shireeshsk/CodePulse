import { generateAccessToken, generateRefreshToken } from "../../utils/generateTokens.js";

export const GoogleAuthCallback = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login`);
        }

        const user = req.user;
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Set cookies similar to standard login
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Redirect to dashboard
        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    } catch (err) {
        console.error('Google Auth Error:', err);
        res.redirect(`${process.env.FRONTEND_URL}/login`);
    }
}
