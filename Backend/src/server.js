import express from 'express'
import { config } from 'dotenv'
config()
import cors from 'cors'
import cookieParser from 'cookie-parser';
import { router as AuthRoutes } from './routes/AuthRoutes.js'
import { router as executionRoutes } from './routes/ExecutionRoutes.js'
import { router as problemRoutes } from './routes/ProblemRoutes.js'
import { router as adminRoutes } from './routes/AdminRoutes.js'
import passport from './config/passport.js'

const app = express();
const port = process.env.PORT

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api/auth', AuthRoutes)
app.use('/api/execute', executionRoutes)
app.use('/api/problem', problemRoutes)
app.use('/api/admin', adminRoutes)

app.get('/', (req, res) => {
    return res.status(200).json({ message: 'Server is up and running fine' })
})

app.listen(port, () => {
    console.log(`Server runnning on http://localhost:${port}`)
})