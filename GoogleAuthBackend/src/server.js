import express from 'express'
import { config } from 'dotenv'
config()
import cors from 'cors'
import cookieParser from 'cookie-parser';
import { router as AuthRoutes } from './routes/AuthRoutes.js'
import passport from './config/passport.js'

const app = express();
const port = process.env.PORT || 5001

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api/auth', AuthRoutes)

app.get('/', (req, res) => {
    return res.status(200).json({ message: 'Google Auth Server is up and running' })
})

app.listen(port, () => {
    console.log(`Google Auth Server running on http://localhost:${port}`)
})
