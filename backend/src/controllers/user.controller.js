const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcryptjs');

// CREATE
exports.createUser = async (req, res) => {
    try {
        const { nik, fullname, password, position_id } = req.body;

        if (!nik || !fullname || !password || !position_id) {
            return res.status(400).json({ message: 'NIK, Fullname, Password, dan Posisi wajib diisi' });
        }

        const pool = await poolPromise;

        const checkUser = await pool.request()
            .input('nik', sql.NVARCHAR, nik)
            .query('SELECT id FROM Users WHERE nik = @nik');
            
        if (checkUser.recordset.length > 0) {
            return res.status(400).json({ message: 'NIK sudah terdaftar!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await pool.request()
            .input('nik', sql.NVARCHAR, nik)
            .input('fullname', sql.NVARCHAR, fullname)
            .input('password_hash', sql.NVARCHAR, hashedPassword)
            .input('position_id', sql.INT, position_id)
            .query(`
                INSERT INTO Users (nik, fullname, password_hash, role, position_id, is_active)
                OUTPUT INSERTED.id, INSERTED.nik, INSERTED.fullname, INSERTED.role, INSERTED.is_active
                VALUES (@nik, @fullname, @password_hash, 'operator', @position_id, 1)
            `);

        res.status(201).json({
            message: 'Operator berhasil didaftarkan',
            data: result.recordset[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mendaftarkan operator' });
    }
};

// READ
exports.getAllOperators = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT u.id, u.nik, u.fullname, u.is_active, p.name as position_name, p.id as position_id
            FROM Users u
            LEFT JOIN Positions p ON u.position_id = p.id
            WHERE u.role = 'operator'
            ORDER BY u.fullname ASC
        `);
        
        res.json({ data: result.recordset });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil data operator' });
    }
};

// UPDATE
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullname, position_id, is_active } = req.body;

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.INT, id)
            .input('fullname', sql.NVARCHAR, fullname)
            .input('position_id', sql.INT, position_id)
            .input('is_active', sql.BIT, is_active)
            .query(`
                UPDATE Users 
                SET fullname = @fullname, position_id = @position_id, is_active = @is_active
                OUTPUT INSERTED.id, INSERTED.nik, INSERTED.fullname, INSERTED.is_active
                WHERE id = @id AND role = 'operator'
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Operator tidak ditemukan' });
        }

        res.json({
            message: 'Data operator berhasil diperbarui',
            data: result.recordset[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal memperbarui data operator' });
    }
};

// DELETE
exports.deactivateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        
        const result = await pool.request()
            .input('id', sql.INT, id)
            .query(`
                UPDATE Users 
                SET is_active = 0 
                OUTPUT INSERTED.nik, INSERTED.fullname, INSERTED.is_active
                WHERE id = @id AND role = 'operator'
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Operator tidak ditemukan' });
        }

        res.json({ 
            message: 'Akun operator berhasil dinonaktifkan',
            data: result.recordset[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menonaktifkan akun operator' });
    }
};