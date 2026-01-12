import express from 'express'
import { Submit } from '../controllers/execution/Submit.js'
import { authenticate } from '../middleware/Auth.js'
import { getSubmissions } from '../controllers/execution/getSubmissions.js'
import { runCode } from '../controllers/execution/runCode.js'
import { submitCode } from '../controllers/execution/submitCode.js'
import { getProblemSubmissions, getSubmissionDetails } from '../controllers/execution/getProblemSubmissions.js'
import { getUserStats } from '../controllers/stats/getUserStats.js'

export const router = express.Router()

// Legacy route (keep for backward compatibility)
router.post('/submit', authenticate, Submit)
router.get('/submissions', authenticate, getSubmissions)

// New problem-specific routes
router.post('/run', authenticate, runCode)
router.post('/submit-problem', authenticate, submitCode)
router.get('/problem/:problemId/submissions', authenticate, getProblemSubmissions)
router.get('/submission/:submissionId', authenticate, getSubmissionDetails)
router.get('/stats', authenticate, getUserStats)
