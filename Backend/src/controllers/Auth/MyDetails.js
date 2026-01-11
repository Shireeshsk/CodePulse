import { pool } from '../../config/database.js';

export const MyDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const { rows } = await pool.query(
      `SELECT id, full_name, email,image_url,role, created_at
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    return res.status(200).json({
      user: rows[0]
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
};
