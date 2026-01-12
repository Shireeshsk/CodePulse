import bcrypt from 'bcryptjs';
import { pool } from '../../config/database.js';
import {
  generateAccessToken,
  generateRefreshToken
} from '../../utils/generateTokens.js';

export const Register = async (req, res) => {
  const { full_name, email, password, role } = req.body;

  try {
    const existingUser = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: 'Email already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine the role: only allow ADMIN if requested by an authenticated admin
    let userRole = 'USER';
    if (req.user && req.user.role === 'ADMIN' && role === 'ADMIN') {
      userRole = 'ADMIN';
    }

    const { rows } = await pool.query(
      `INSERT INTO users (full_name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role`,
      [full_name, email, hashedPassword, userRole]
    );

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

    return res.status(201).json({
      message: 'Registration successful',
      user
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
};
