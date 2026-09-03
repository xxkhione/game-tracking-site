import { Router } from 'express';
import pool from '../db.js';
import { require_auth } from '../auth/auth.js';

const router = Router()

router.post('/pending-games', require_auth, async (req, res) => {
    const { title, genre, platform, release_year } = req.body

    const errors = [
        validate_string(title, 'title', 100),
        validate_string(genre, 'genre', 100),
        validate_string(platform, 'platform', 50),
        validate_integer(release_year, 'release_year', 1950, 2100),
    ].filter(Boolean)

    if (errors.length > 0) {
        return res.status(400).json({ error: errors[0] })
    }

    try {
        const approved_duplicate = await pool.query(`
            SELECT gameid
            FROM game
            WHERE LOWER(title) = LOWER($1)
              AND LOWER(platform) = LOWER($2)
        `, [title.trim(), platform.trim()])

        if (approved_duplicate.rowCount > 0) {
            return res.status(409).json({
                error: 'This game is already in the approved catalog.'
            })
        }

        const pending_duplicate = await pool.query(`
            SELECT pendinggameid
            FROM pending_game
            WHERE LOWER(title) = LOWER($1)
              AND LOWER(platform) = LOWER($2)
              AND status = 'Pending'
        `, [title.trim(), platform.trim()])

        if (pending_duplicate.rowCount > 0) {
            return res.status(409).json({
                error: 'This game is already waiting for review.'
            })
        }

        const result = await pool.query(`
            INSERT INTO pending_game (
                fuserid,
                title,
                genre,
                platform,
                releaseyear,
                status
            )
            VALUES ($1, $2, $3, $4, $5, 'Pending')
            RETURNING *
        `, [
            req.user.user_id,
            title.trim(),
            genre.trim(),
            platform.trim(),
            release_year,
        ])

        res.status(201).json(result.rows[0])
    } catch (err) {
        handle_database_error(err, res, 'Could not submit the game for review.')
    }
})

export default router