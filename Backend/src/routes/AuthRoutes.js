import express from 'express'
import passport from 'passport'
import { Register } from '../controllers/Auth/Register.js'
import { Login } from '../controllers/Auth/Login.js'
import { Refresh } from '../controllers/Auth/Refresh.js'
import { Logout } from '../controllers/Auth/Logout.js'
import { authenticate } from '../middleware/Auth.js'
import { MyDetails } from '../controllers/Auth/MyDetails.js'
import { ForgotPassword } from '../controllers/Auth/ForgotPassword.js'
import { VerifyOTP } from '../controllers/Auth/VerifyOTP.js'
import { ResetPassword } from '../controllers/Auth/ResetPassword.js'
import { GoogleAuthCallback } from '../controllers/Auth/GoogleAuth.js'

export const router = express.Router()

router.post('/register', Register)
router.post('/login', Login)
router.post('/refresh', Refresh)
router.post('/logout', Logout)
router.post('/forgot-password', ForgotPassword)
router.post('/verify-otp', VerifyOTP)
router.post('/reset-password', ResetPassword)

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`,
        session: false
    })(req, res, next);
}, GoogleAuthCallback);

router.get('/me', authenticate, MyDetails)