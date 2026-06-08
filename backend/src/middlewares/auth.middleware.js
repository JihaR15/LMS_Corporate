const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak. Format token salah.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        req.user = verified; 
        
        next();
    } catch (error) {
        res.status(400).json({ message: 'Token tidak valid atau sudah kadaluarsa.' });
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Akses terlarang. Rute ini hanya untuk Admin.' });
    }
    next();
};