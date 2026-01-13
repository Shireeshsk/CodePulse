import express from 'express'
import passport from 'passport'
import { GoogleAuthCallback } from '../controllers/Auth/GoogleAuth.js'

export const router = express.Router()

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_URL}/login`,
        session: false
    })(req, res, next);
}, GoogleAuthCallback);
