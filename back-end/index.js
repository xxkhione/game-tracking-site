import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import session from 'express-session'

import authRoutes from './routes/auth.js'
import gameRoutes from './routes/games.js'
import libraryRoutes from './routes/library.js'
import submissionRoutes from './routes/submissions.js'
import adminRoutes from './routes/admin.js'

const app = express()
const PORT = 3001

app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 2,
    }
}))
app.use(express.json())

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the Game Backlog API.',
        public_endpoints: [
            'POST /register',
            'POST /login',
            'GET /games',
            'GET /games/:game_id',
        ],
        authenticated_endpoints: [
            'GET /me',
            'POST /logout',
            'GET /me/games',
            'POST /me/games',
            'PATCH /me/games/:user_game_id',
            'DELETE /me/games/:user_game_id',
            'POST /pending-games',
        ],
        admin_endpoints: [
            'GET /admin/pending-games',
            'GET /admin/pending-games/:pending_game_id',
            'POST /admin/pending-games/:pending_game_id/approve',
            'PATCH /admin/pending-games/:pending_game_id/reject',
            'POST /admin/games',
            'PATCH /admin/games/:game_id',
            'DELETE /admin/games/:game_id',
        ],
    })
})

app.use(authRoutes)
app.use(gameRoutes)
app.use(libraryRoutes)
app.use(submissionRoutes)
app.use(adminRoutes)

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found.' })
})

app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ error: 'Unexpected server error.' })
})

app.listen(PORT, () => {
    console.log(`Express running on http://localhost:${PORT}`)
})