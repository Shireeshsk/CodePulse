import express from 'express';
import { getAllUsers } from '../controllers/Admin/getAllUsers.js';
import { updateUserRole } from '../controllers/Admin/updateUserRole.js';
import { createAdmin } from '../controllers/Admin/createAdmin.js';
import { deleteUser } from '../controllers/Admin/deleteUser.js';
import { authenticate, authorize } from '../middleware/Auth.js';

export const router = express.Router();

// All routes require admin authentication
router.get('/users', authenticate, authorize('ADMIN'), getAllUsers);
router.put('/users/role', authenticate, authorize('ADMIN'), updateUserRole);
router.post('/users/create-admin', authenticate, authorize('ADMIN'), createAdmin);
router.delete('/users/:id', authenticate, authorize('ADMIN'), deleteUser);
