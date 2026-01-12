import jwt from 'jsonwebtoken';
import { pool } from '../../config/database.js';
import {
  generateAccessToken,
  generateRefreshToken
} from '../../utils/generateTokens.js';

export const Refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({
        message: 'No Refresh Token Found'
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH
    );

    const { rows } = await pool.query(
      `SELECT id, email, full_name, role FROM users WHERE id = $1`,
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: 'User not found'
      });
    }

    const user = rows[0];

    res.cookie('access_token', generateAccessToken(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refresh_token', generateRefreshToken(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      message: 'Token refreshed',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      return res.status(401).json({
        message: 'Invalid or expired refresh token'
      });
    }

    console.error(error);
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
};
