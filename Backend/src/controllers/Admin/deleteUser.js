import { pool } from '../../config/database.js';

export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if user exists
        const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [id]);

        if (userCheck.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Optional: Prevent deleting the last admin or yourself
        if (id === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        await pool.query('DELETE FROM users WHERE id = $1', [id]);

        return res.status(200).json({ message: 'User deleted successfully' });

    } catch (error) {
        console.error('Delete User Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
