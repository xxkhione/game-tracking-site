import { Router } from 'express';
import pool from '../db.js';
import { require_auth } from '../auth/auth.js';

const router = Router()

function make_user_response(user) {
    return {
        user_id: user.userid,
        username: user.username,
        role: user.role,
        created_at: user.createdat,
    }
}

router.post('/register', async (req, res) => {
    const { username, password } = req.body

    const errors = [
        validate_string(username, 'username', 50),
        validate_string(password, 'password'),
    ].filter(Boolean)

    if (errors.length > 0) {
        return res.status(400).json({ error: errors[0] })
    }

    if (password.length < 8) {
        return res.status(400).json({
            error: 'password must be at least 8 characters long.'
        })
    }

    try {
        const password_hash = await bcrypt.hash(password, 12)

        const result = await pool.query(`
            INSERT INTO users (username, passwordhash, role)
            VALUES ($1, $2, 'authenticated_user')
            RETURNING userid, username, role, createdat
        `, [username.trim(), password_hash])

        const user = result.rows[0]
        req.session.user = {
            user_id: user.userid,
            username: user.username,
            role: user.role,
        }

        res.status(201).json({
            message: 'Account created successfully.',
            user: make_user_response(user),
        })
    } catch (err) {
        handle_database_error(err, res, 'Could not create the account.')
    }
})

router.post('/login', async (req, res) => {
    const { username, password } = req.body

    const errors = [
        validate_string(username, 'username', 50),
        validate_string(password, 'password'),
    ].filter(Boolean)

    if (errors.length > 0) {
        return res.status(400).json({ error: errors[0] })
    }

    try {
        const result = await pool.query(`
            SELECT userid, username, passwordhash, role, createdat
            FROM users
            WHERE username = $1
        `, [username.trim()])

        if (result.rowCount === 0) {
            return res.status(401).json({ error: 'Invalid username or password.' })
        }

        const user = result.rows[0]
        const password_is_correct = await bcrypt.compare(password, user.passwordhash)

        if (!password_is_correct) {
            return res.status(401).json({ error: 'Invalid username or password.' })
        }

        req.session.user = {
            user_id: user.userid,
            username: user.username,
            role: user.role,
        }

        res.json({
            message: 'Login successful.',
            user: make_user_response(user),
        })
    } catch (err) {
        handle_database_error(err, res, 'Could not log in.')
    }
})

router.post('/logout', require_auth, (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return next(error)
        }
    
        res.clearCookie('connect.sid')
        res.json({ message: 'Logout successful.' })
    })
})

router.get('/me', require_auth, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT userid, username, role, createdat
            FROM users
            WHERE userid = $1
        `, [req.user.user_id])

        if (result.rowCount === 0) {
            return res.status(401).json({ error: 'This account no longer exists.' })
        }

        res.json({ user: make_user_response(result.rows[0]) })
    } catch (err) {
        handle_database_error(err, res, 'Could not load the current user.')
    }
})

export default router