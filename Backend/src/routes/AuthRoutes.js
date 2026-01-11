import express from 'express'
import { Register } from '../controllers/Auth/Register.js'
import { Login } from '../controllers/Auth/Login.js'
import { Refresh } from '../controllers/Auth/Refresh.js'
import { Logout } from '../controllers/Auth/Logout.js'
import { authenticate } from '../middleware/Auth.js'
import { MyDetails } from '../controllers/Auth/MyDetails.js'

export const router = express.Router()

router.post('/register',Register)
router.post('/login',Login)
router.post('/refresh',Refresh)
router.post('/logout',Logout)
router.get('/me',authenticate,MyDetails)