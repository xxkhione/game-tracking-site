function require_auth(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({
            error: 'Authentication is required. Please log in.'
        })
    }

    req.user = req.session.user
    next()
}

function require_admin(req, res, next) {
    if (!req.user || req.user.role !== 'admin_user') {
        return res.status(403).json({
            error: 'Admin access is required for this action.'
        })
    }

    next()
}

export {
    require_auth,
    require_admin
}