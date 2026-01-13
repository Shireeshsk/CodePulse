import express from 'express';
import { SubmitFeedback } from '../controllers/feedback/submitFeedback.js';
import { authenticate } from '../middleware/Auth.js';

export const router = express.Router();

// POST /api/feedback/submit - Submit rating and feedback (requires authentication)
router.post('/submit', authenticate, SubmitFeedback);
