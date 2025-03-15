const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        return res.status(401).json({ message: "Accès refusé, token manquant !" });
    }
    try {
        const verified = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: "Token invalide !", error: err.message });
    }
};

module.exports = authMiddleware;