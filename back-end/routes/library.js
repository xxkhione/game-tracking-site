import { Router } from 'express';
import pool from '../db.js';
import { require_auth } from '../auth/auth.js';
import handle_database_error from '../helpers/errors.js';

const router = Router()

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

router.get('/me/games', require_auth, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                ug.usergameid,
                ug.fgameid,
                ug.status,
                ug.playtimehours,
                ug.obtainedachievements,
                g.title,
                g.genre,
                g.platform,
                g.releaseyear,
                g.coverurl,
                g.description,
                g.achievementcount
            FROM users_game ug
            JOIN game g ON ug.fgameid = g.gameid
            WHERE ug.fuserid = $1
            ORDER BY g.title ASC
        `, [req.user.user_id])

        res.json(result.rows)
    } catch (err) {
        handle_database_error(err, res, 'Could not load your game library.')
    }
})

router.post('/me/games', require_auth, async (req, res) => {
    const {
        game_id,
        status = 'Plan_to_play',
        playtime_hours = 0,
        obtained_achievements = 0,
    } = req.body

    const errors = [
        validate_integer(game_id, 'game_id', 1),
        validate_status(status),
        validate_number(playtime_hours, 'playtime_hours', 0),
        validate_integer(obtained_achievements, 'obtained_achievements', 0),
    ].filter(Boolean)

    if (errors.length > 0) {
        return res.status(400).json({ error: errors[0] })
    }

    try {
        const game_result = await pool.query(`
            SELECT gameid, achievementcount
            FROM game
            WHERE gameid = $1
        `, [game_id])

        if (game_result.rowCount === 0) {
            return res.status(404).json({ error: 'Game not found.' })
        }

        const game = game_result.rows[0]

        if (obtained_achievements > game.achievementcount) {
            return res.status(400).json({
                error: `obtained_achievements cannot exceed this game's total of ${game.achievementcount}.`
            })
        }

        const result = await pool.query(`
            INSERT INTO users_game (
                fuserid,
                fgameid,
                status,
                playtimehours,
                obtainedachievements
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [
            req.user.user_id,
            game_id,
            status,
            playtime_hours,
            obtained_achievements,
        ])

        res.status(201).json(result.rows[0])
    } catch (err) {
        handle_database_error(err, res, 'Could not add the game to your library.')
    }
})

router.patch('/me/games/:user_game_id', require_auth, async (req, res) => {
    const user_game_id = Number(req.params.user_game_id)
    const {
        status,
        playtime_hours,
        obtained_achievements,
    } = req.body

    if (!Number.isInteger(user_game_id) || user_game_id < 1) {
        return res.status(400).json({ error: 'user_game_id must be a valid positive integer.' })
    }

    if (status !== undefined) {
        const error = validate_status(status)
        if (error) {
            return res.status(400).json({ error })
        }
    }

    if (playtime_hours !== undefined) {
        const error = validate_number(playtime_hours, 'playtime_hours', 0)
        if (error) {
            return res.status(400).json({ error })
        }
    }

    try {
        const existing_result = await pool.query(`
            SELECT ug.usergameid, g.achievementcount
            FROM users_game ug
            JOIN game g ON ug.fgameid = g.gameid
            WHERE ug.usergameid = $1
              AND ug.fuserid = $2
        `, [user_game_id, req.user.user_id])

        if (existing_result.rowCount === 0) {
            return res.status(404).json({ error: 'Library entry not found.' })
        }

        const existing = existing_result.rows[0]

        if (
            obtained_achievements !== undefined &&
            (!Number.isInteger(obtained_achievements) ||
                obtained_achievements < 0 ||
                obtained_achievements > existing.achievementcount)
        ) {
            return res.status(400).json({
                error: `obtained_achievements must be between 0 and ${existing.achievementcount}.`
            })
        }

        const result = await pool.query(`
            UPDATE users_game
            SET
                status = COALESCE($1, status),
                playtimehours = COALESCE($2, playtimehours),
                obtainedachievements = COALESCE($3, obtainedachievements)
            WHERE usergameid = $4
              AND fuserid = $5
            RETURNING *
        `, [
            status ?? null,
            playtime_hours ?? null,
            obtained_achievements ?? null,
            user_game_id,
            req.user.user_id,
        ])

        res.json(result.rows[0])
    } catch (err) {
        handle_database_error(err, res, 'Could not update your library entry.')
    }
})

router.delete('/me/games/:user_game_id', require_auth, async (req, res) => {
    const user_game_id = Number(req.params.user_game_id)

    if (!Number.isInteger(user_game_id) || user_game_id < 1) {
        return res.status(400).json({ error: 'user_game_id must be a valid positive integer.' })
    }

    try {
        const result = await pool.query(`
            DELETE FROM users_game
            WHERE usergameid = $1
              AND fuserid = $2
            RETURNING *
        `, [user_game_id, req.user.user_id])

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Library entry not found.' })
        }

        res.json({
            message: 'Game removed from your library.',
            library_entry: result.rows[0],
        })
    } catch (err) {
        handle_database_error(err, res, 'Could not remove the game from your library.')
    }
})

export default router