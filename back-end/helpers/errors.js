function handle_database_error(err, res, fallback_message) {
    if (err.code === '23505') {
        return res.status(409).json({ error: 'That record already exists.' })
    }

    if (err.code === '23503') {
        return res.status(400).json({ error: 'That request references a user or game that does not exist.' })
    }

    if (err.code === '23514') {
        return res.status(400).json({ error: 'One or more values failed database validation.' })
    }

    if (err.code === '22001') {
        return res.status(400).json({ error: 'One or more text values exceed the database column length.' })
    }

    if (err.code === '42501') {
        return res.status(403).json({ error: 'The server database account does not have permission for that operation.' })
    }

    console.error(err)
    return res.status(500).json({ error: fallback_message })
}

export default handle_database_error