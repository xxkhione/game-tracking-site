import { Router } from 'express';
import pool from '../db.js';
import { require_auth, require_admin } from '../auth/auth.js';
import handle_database_error from '../helpers/errors.js';

const router = Router()

router.post('/admin/games', require_auth, require_admin, async (req, res) => {
    const {
        title,
        genre,
        platform,
        release_year,
        cover_url,
        description,
        achievement_count = 0,
    } = req.body

    const errors = [
        validate_string(title, 'title', 100),
        validate_string(genre, 'genre', 100),
        validate_string(platform, 'platform', 50),
        validate_integer(release_year, 'release_year', 1950, 2100),
        validate_string(cover_url, 'cover_url', 200),
        validate_string(description, 'description'),
        validate_integer(achievement_count, 'achievement_count', 0),
    ].filter(Boolean)

    if (errors.length > 0) {
        return res.status(400).json({ error: errors[0] })
    }

    try {
        const result = await pool.query(`
            INSERT INTO game (
                title,
                genre,
                platform,
                releaseyear,
                coverurl,
                description,
                achievementcount
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [
            title.trim(),
            genre.trim(),
            platform.trim(),
            release_year,
            cover_url.trim(),
            description.trim(),
            achievement_count,
        ])

        res.status(201).json(result.rows[0])
    } catch (err) {
        handle_database_error(err, res, 'Could not create the game.')
    }
})

router.patch('/admin/games/:game_id', require_auth, require_admin, async (req, res) => {
    const game_id = Number(req.params.game_id)
    const {
        title,
        genre,
        platform,
        release_year,
        cover_url,
        description,
        achievement_count,
    } = req.body

    if (!Number.isInteger(game_id) || game_id < 1) {
        return res.status(400).json({ error: 'game_id must be a valid positive integer.' })
    }

    if (release_year !== undefined) {
        const error = validate_integer(release_year, 'release_year', 1950, 2100)
        if (error) {
            return res.status(400).json({ error })
        }
    }

    if (achievement_count !== undefined) {
        const error = validate_integer(achievement_count, 'achievement_count', 0)
        if (error) {
            return res.status(400).json({ error })
        }
    }

    try {
        const result = await pool.query(`
            UPDATE game
            SET
                title = COALESCE($1, title),
                genre = COALESCE($2, genre),
                platform = COALESCE($3, platform),
                releaseyear = COALESCE($4, releaseyear),
                coverurl = COALESCE($5, coverurl),
                description = COALESCE($6, description),
                achievementcount = COALESCE($7, achievementcount)
            WHERE gameid = $8
            RETURNING *
        `, [
            typeof title === 'string' ? title.trim() : null,
            typeof genre === 'string' ? genre.trim() : null,
            typeof platform === 'string' ? platform.trim() : null,
            release_year ?? null,
            typeof cover_url === 'string' ? cover_url.trim() : null,
            typeof description === 'string' ? description.trim() : null,
            achievement_count ?? null,
            game_id,
        ])

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Game not found.' })
        }

        res.json(result.rows[0])
    } catch (err) {
        handle_database_error(err, res, 'Could not update the game.')
    }
})

router.delete('/admin/games/:game_id', require_auth, require_admin, async (req, res) => {
    const game_id = Number(req.params.game_id)

    if (!Number.isInteger(game_id) || game_id < 1) {
        return res.status(400).json({ error: 'game_id must be a valid positive integer.' })
    }

    try {
        const result = await pool.query(`
            DELETE FROM game
            WHERE gameid = $1
            RETURNING *
        `, [game_id])

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Game not found.' })
        }

        res.json({ message: 'Game deleted.', game: result.rows[0] })
    } catch (err) {
        handle_database_error(err, res, 'Could not delete the game.')
    }
})

router.get('/admin/pending-games', require_auth, require_admin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                pg.pendinggameid,
                pg.fuserid,
                u.username AS submitted_by_username,
                pg.title,
                pg.genre,
                pg.platform,
                pg.releaseyear,
                pg.status,
                pg.reviewedat,
                pg.rejectionreason
            FROM pending_game pg
            JOIN users u ON pg.fuserid = u.userid
            WHERE pg.status = 'Pending'
            ORDER BY pg.pendinggameid ASC
        `)

        res.json(result.rows)
    } catch (err) {
        handle_database_error(err, res, 'Could not load pending game submissions.')
    }
})

router.get('/admin/pending-games/:pending_game_id', require_auth, require_admin, async (req, res) => {
    const pending_game_id = Number(req.params.pending_game_id)

    if (!Number.isInteger(pending_game_id) || pending_game_id < 1) {
        return res.status(400).json({ error: 'pending_game_id must be a valid positive integer.' })
    }

    try {
        const result = await pool.query(`
            SELECT
                pg.pendinggameid,
                pg.fuserid,
                u.username AS submitted_by_username,
                pg.title,
                pg.genre,
                pg.platform,
                pg.releaseyear,
                pg.status,
                pg.reviewedat,
                pg.rejectionreason
            FROM pending_game pg
            JOIN users u ON pg.fuserid = u.userid
            WHERE pg.pendinggameid = $1
        `, [pending_game_id])

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pending game submission not found.' })
        }

        res.json(result.rows[0])
    } catch (err) {
        handle_database_error(err, res, 'Could not load the pending game submission.')
    }
})

router.post('/admin/pending-games/:pending_game_id/approve', require_auth, require_admin, async (req, res) => {
    const pending_game_id = Number(req.params.pending_game_id)
    const {
        title,
        genre,
        platform,
        release_year,
        cover_url,
        description,
        achievement_count = 0,
    } = req.body

    if (!Number.isInteger(pending_game_id) || pending_game_id < 1) {
        return res.status(400).json({ error: 'pending_game_id must be a valid positive integer.' })
    }

    const errors = [
        validate_string(title, 'title', 100),
        validate_string(genre, 'genre', 100),
        validate_string(platform, 'platform', 50),
        validate_integer(release_year, 'release_year', 1950, 2100),
        validate_string(cover_url, 'cover_url', 200),
        validate_string(description, 'description'),
        validate_integer(achievement_count, 'achievement_count', 0),
    ].filter(Boolean)

    if (errors.length > 0) {
        return res.status(400).json({ error: errors[0] })
    }

    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        const pending_result = await client.query(`
            SELECT pendinggameid, status
            FROM pending_game
            WHERE pendinggameid = $1
            FOR UPDATE
        `, [pending_game_id])

        if (pending_result.rowCount === 0) {
            await client.query('ROLLBACK')
            return res.status(404).json({ error: 'Pending game submission not found.' })
        }

        if (pending_result.rows[0].status !== 'Pending') {
            await client.query('ROLLBACK')
            return res.status(409).json({ error: 'This game submission has already been reviewed.' })
        }

        const game_result = await client.query(`
            INSERT INTO game (
                title,
                genre,
                platform,
                releaseyear,
                coverurl,
                description,
                achievementcount
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [
            title.trim(),
            genre.trim(),
            platform.trim(),
            release_year,
            cover_url.trim(),
            description.trim(),
            achievement_count,
        ])

        const pending_update_result = await client.query(`
            UPDATE pending_game
            SET
                status = 'Approved',
                reviewedat = NOW(),
                rejectionreason = NULL
            WHERE pendinggameid = $1
            RETURNING *
        `, [pending_game_id])

        await client.query('COMMIT')

        res.status(201).json({
            message: 'Game submission approved and added to the catalog.',
            game: game_result.rows[0],
            pending_game: pending_update_result.rows[0],
        })
    } catch (err) {
        await client.query('ROLLBACK')
        handle_database_error(err, res, 'Could not approve the game submission.')
    } finally {
        client.release()
    }
})

router.patch('/admin/pending-games/:pending_game_id/reject', require_auth, require_admin, async (req, res) => {
    const pending_game_id = Number(req.params.pending_game_id)
    const { rejection_reason = null } = req.body

    if (!Number.isInteger(pending_game_id) || pending_game_id < 1) {
        return res.status(400).json({ error: 'pending_game_id must be a valid positive integer.' })
    }

    if (rejection_reason !== null && typeof rejection_reason !== 'string') {
        return res.status(400).json({ error: 'rejection_reason must be text.' })
    }

    try {
        const result = await pool.query(`
            UPDATE pending_game
            SET
                status = 'Rejected',
                reviewedat = NOW(),
                rejectionreason = $1
            WHERE pendinggameid = $2
              AND status = 'Pending'
            RETURNING *
        `, [
            rejection_reason?.trim() || null,
            pending_game_id,
        ])

        if (result.rowCount === 0) {
            return res.status(404).json({
                error: 'Pending game submission not found or it has already been reviewed.'
            })
        }

        res.json({
            message: 'Game submission rejected.',
            pending_game: result.rows[0],
        })
    } catch (err) {
        handle_database_error(err, res, 'Could not reject the game submission.')
    }
})

export default router