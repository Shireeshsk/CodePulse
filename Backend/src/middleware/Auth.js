import jwt from 'jsonwebtoken';
import {config} from 'dotenv'
config()

export const authenticate = async (req, res, next) => {
    try {
        const accessToken = req.cookies?.access_token;
        if (!accessToken) {
            return res.status(401).json({ message: 'Authentication required' });
        };

        const decoded = jwt.verify(accessToken, process.env.ACCESS);

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please refresh.' });
        }
        return res.status(500).json({ error: 'Authentication failed' });
    }
};


export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Forbidden. Insufficient permissions.',
                required: allowedRoles,
                current: req.user.role
            });
        }
        next();
    };
};
