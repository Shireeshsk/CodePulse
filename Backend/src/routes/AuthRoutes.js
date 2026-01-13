import express from 'express'
import { Register } from '../controllers/Auth/Register.js'
import { Login } from '../controllers/Auth/Login.js'
import { Refresh } from '../controllers/Auth/Refresh.js'
import { Logout } from '../controllers/Auth/Logout.js'
import { authenticate } from '../middleware/Auth.js'
import { MyDetails } from '../controllers/Auth/MyDetails.js'
import { ForgotPassword } from '../controllers/Auth/ForgotPassword.js'
import { VerifyOTP } from '../controllers/Auth/VerifyOTP.js'
import { ResetPassword } from '../controllers/Auth/ResetPassword.js'

export const router = express.Router()

router.post('/register', Register)
router.post('/login', Login)
router.post('/refresh', Refresh)
router.post('/logout', Logout)
router.post('/forgot-password', ForgotPassword)
router.post('/verify-otp', VerifyOTP)
router.post('/reset-password', ResetPassword)

router.get('/me', authenticate, MyDetails)