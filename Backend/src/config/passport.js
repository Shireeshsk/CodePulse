import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { pool } from './database.js';
import { config } from 'dotenv';
config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            if (!profile.emails || profile.emails.length === 0) {
                return done(new Error('No email found in Google profile'), null);
            }
            const email = profile.emails[0].value;
            const imageUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;
            const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

            let user;
            if (rows.length === 0) {
                const result = await pool.query(
                    'INSERT INTO users (full_name, email, password, role, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                    [profile.displayName, email, null, 'USER', imageUrl]
                );
                user = result.rows[0];
            } else {
                user = rows[0];
                if (imageUrl && user.image_url !== imageUrl) {
                    await pool.query('UPDATE users SET image_url = $1 WHERE id = $2', [imageUrl, user.id]);
                    user.image_url = imageUrl;
                }
            }

            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        done(null, rows[0]);
    } catch (err) {
        done(err, null);
    }
});

export default passport;
