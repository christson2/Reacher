const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'change_this_jwt_secret';

function getTokenFromHeader(req) {
    const auth = req.headers.authorization;
    if (!auth) return null;
    const parts = auth.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') return parts[1];
    return null;
}

const auth = {
    required: async (req, res, next) => {
        try {
            const token = getTokenFromHeader(req);
            if (!token) return res.status(401).json({ error: 'Authentication required' });
            const decoded = jwt.verify(token, jwtSecret);
            req.user = decoded;
            next();
        } catch (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
    },
    optional: async (req, res, next) => {
        try {
            const token = getTokenFromHeader(req);
            if (token) {
                const decoded = jwt.verify(token, jwtSecret);
                req.user = decoded;
            }
        } catch (err) {
            // ignore token errors for optional
        }
        next();
    }
};

module.exports = auth;
