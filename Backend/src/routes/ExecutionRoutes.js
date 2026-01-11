import express from 'express'
import { Submit } from '../controllers/execution/Submit.js'
import { authenticate } from '../middleware/Auth.js'
import { getSubmissions } from '../controllers/execution/getSubmissions.js'

export const router = express.Router()

router.post('/submit',authenticate,Submit)
router.get('/submissions',authenticate,getSubmissions)
