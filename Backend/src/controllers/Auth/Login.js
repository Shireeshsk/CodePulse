import bcrypt from 'bcryptjs';
import { pool } from '../../config/database.js';
import {
  generateAccessToken,
  generateRefreshToken
} from '../../utils/generateTokens.js';

export const Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { rows } = await pool.query(
      `SELECT id, full_name, email, password, role
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
};
