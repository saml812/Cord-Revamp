const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).send({
                message: 'Authorization token missing or malformed.',
                success: false,
            });
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);

        req.body = req.body || {};
        req.body.userId = decodedToken.userId;

        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send({
                message: 'Token has expired.',
                success: false,
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).send({
                message: 'Invalid token.',
                success: false,
            });
        }

        res.status(500).send({
            message: 'Internal Server Error',
            success: false,
        });
    }
};
