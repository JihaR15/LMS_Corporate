const { poolPromise, sql } = require('../config/db');

// CREATE
exports.createMaterial = async (req, res) => {
    try {
        const { module_id, title, type, file_url, sequence_order } = req.body;

        if (!module_id || !title || !type || !file_url || !sequence_order) {
            return res.status(400).json({ message: 'Semua field materi wajib diisi' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('module_id', sql.INT, module_id)
            .input('title', sql.NVARCHAR, title)
            .input('type', sql.NVARCHAR, type)
            .input('file_url', sql.NVARCHAR, file_url)
            .input('sequence_order', sql.INT, sequence_order)
            .query(`
                INSERT INTO Materials (module_id, title, type, file_url, sequence_order)
                OUTPUT INSERTED.*
                VALUES (@module_id, @title, @type, @file_url, @sequence_order)
            `);

        res.status(201).json({
            message: 'Materi berhasil ditambahkan',
            data: result.recordset[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menambahkan materi' });
    }
};

// READ
exports.getMaterialsByModule = async (req, res) => {
    try {
        const { module_id } = req.params;
        const pool = await poolPromise;

        const result = await pool.request()
            .input('module_id', sql.INT, module_id)
            .query('SELECT * FROM Materials WHERE module_id = @module_id ORDER BY sequence_order ASC');
            
        res.json({ data: result.recordset });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil materi' });
    }
};

// DELETE
exports.deleteMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        const checkProgress = await pool.request()
            .input('id', sql.INT, id)
            .query('SELECT COUNT(*) as count FROM User_Progress WHERE material_id = @id');
            
        if (checkProgress.recordset[0].count > 0) {
            return res.status(400).json({ message: 'Materi tidak bisa dihapus karena sudah diakses oleh Operator' });
        }

        const result = await pool.request()
            .input('id', sql.INT, id)
            .query('DELETE FROM Materials WHERE id = @id');

        if (result.rowsAffected[0] === 0) return res.status(404).json({ message: 'Materi tidak ditemukan' });

        res.json({ message: 'Materi berhasil dihapus' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menghapus materi' });
    }
};