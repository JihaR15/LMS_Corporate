const { poolPromise, sql } = require('../config/db');

// CREATE
exports.createPosition = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Nama posisi wajib diisi' });

        const pool = await poolPromise;
        const result = await pool.request()
            .input('name', sql.NVARCHAR, name)
            .query(`
                INSERT INTO Positions (name) 
                OUTPUT INSERTED.* VALUES (@name)
            `);

        res.status(201).json({
            message: 'Posisi berhasil ditambahkan',
            data: result.recordset[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menambahkan posisi' });
    }
};

// READ
exports.getAllPositions = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Positions ORDER BY id ASC');
        
        res.json({ data: result.recordset });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil data posisi' });
    }
};

// READ
exports.getPositionById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.INT, id)
            .query('SELECT * FROM Positions WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Posisi tidak ditemukan' });
        }

        res.json({ data: result.recordset[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil data posisi' });
    }
};

// UPDATE
exports.updatePosition = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        
        if (!name) return res.status(400).json({ message: 'Nama posisi wajib diisi' });

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.INT, id)
            .input('name', sql.NVARCHAR, name)
            .query(`
                UPDATE Positions 
                SET name = @name 
                OUTPUT INSERTED.* WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Posisi tidak ditemukan' });
        }

        res.json({
            message: 'Posisi berhasil diperbarui',
            data: result.recordset[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal memperbarui posisi' });
    }
};

// DELETE
exports.deletePosition = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        const checkUsage = await pool.request()
            .input('id', sql.INT, id)
            .query(`
                SELECT 
                    (SELECT COUNT(*) FROM Users WHERE position_id = @id) as user_count,
                    (SELECT COUNT(*) FROM Modules WHERE position_id = @id) as module_count
            `);
            
        const usage = checkUsage.recordset[0];
        if (usage.user_count > 0 || usage.module_count > 0) {
            return res.status(400).json({ 
                message: 'Posisi tidak bisa dihapus karena masih digunakan oleh User atau Modul' 
            });
        }

        const result = await pool.request()
            .input('id', sql.INT, id)
            .query('DELETE FROM Positions WHERE id = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Posisi tidak ditemukan' });
        }

        res.json({ message: 'Posisi berhasil dihapus' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menghapus posisi' });
    }
};