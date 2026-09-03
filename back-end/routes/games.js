import { Router } from 'express';
import pool from '../db.js';

const router = Router()

router.get('/games', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                gameid,
                title,
                genre,
                platform,
                releaseyear,
                coverurl,
                description,
                achievementcount
            FROM game
            ORDER BY title ASC
        `)

        res.json(result.rows)
    } catch (err) {
        handle_database_error(err, res, 'Could not load games.')
    }
})

router.get('/games/:game_id', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                gameid,
                title,
                genre,
                platform,
                releaseyear,
                coverurl,
                description,
                achievementcount
            FROM game
            WHERE gameid = $1
        `, [req.params.game_id])

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Game not found.' })
        }

        res.json(result.rows[0])
    } catch (err) {
        handle_database_error(err, res, 'Could not load that game.')
    }
})

export default router