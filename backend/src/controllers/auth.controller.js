const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { nik, password } = req.body;

        if (!nik || !password) {
            return res.status(400).json({ message: 'NIK dan Password wajib diisi!' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('nik', sql.NVARCHAR, nik)
            .query('SELECT * FROM Users WHERE nik = @nik AND is_active = 1');

        const user = result.recordset[0];

        if (!user) {
            return res.status(401).json({ message: 'NIK tidak ditemukan atau akun tidak aktif' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Password salah!' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, position_id: user.position_id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login berhasil',
            token,
            user: {
                nik: user.nik,
                fullname: user.fullname,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};