const { poolPromise, sql } = require('../config/db');

// CREATE
exports.createModule = async (req, res) => {
    try {
        const { title, description, position_id, passing_score } = req.body;

        if (!title || !position_id) {
            return res.status(400).json({ message: 'Judul dan Target Posisi wajib diisi' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('title', sql.NVARCHAR, title)
            .input('description', sql.NVARCHAR, description || '')
            .input('position_id', sql.INT, position_id)
            .input('passing_score', sql.DECIMAL(5,2), passing_score || 70.00)
            .query(`
                INSERT INTO Modules (title, description, position_id, passing_score)
                OUTPUT INSERTED.*
                VALUES (@title, @description, @position_id, @passing_score)
            `);

        res.status(201).json({
            message: 'Modul berhasil dibuat',
            data: result.recordset[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal membuat modul' });
    }
};

// READ (Dengan Injeksi Statistik Kelulusan)
exports.getAllModules = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                m.*, 
                p.name as position_name,
                -- 1. Hitung jumlah materi dalam modul
                (SELECT COUNT(*) FROM Materials mat WHERE mat.module_id = m.id) AS materi_count,
                
                -- 2. Hitung Total Karyawan (Target Audiens Modul Ini)
                (SELECT COUNT(*) FROM Users u 
                 WHERE u.role = 'operator' 
                   AND u.is_active = 1 
                   AND (u.position_id = m.position_id OR m.position_id IS NULL)
                ) AS total_users,
                
                -- 3. Hitung Karyawan yang Sudah LULUS Post-Test
                (SELECT COUNT(DISTINCT tr.user_id) 
                 FROM Test_Results tr
                 INNER JOIN Users u ON tr.user_id = u.id
                 WHERE tr.module_id = m.id 
                   AND tr.is_passed = 1
                   AND u.role = 'operator'
                   AND u.is_active = 1
                ) AS completed_users
                
            FROM Modules m
            LEFT JOIN Positions p ON m.position_id = p.id
            ORDER BY m.id DESC
        `);
        res.json({ data: result.recordset });
    } catch (error) {
        console.error("Error getAllModules:", error);
        res.status(500).json({ message: 'Gagal mengambil data modul' });
    }
};

// UPDATE
exports.updateModule = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, position_id, passing_score } = req.body;

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.INT, id)
            .input('title', sql.NVARCHAR, title)
            .input('description', sql.NVARCHAR, description)
            .input('position_id', sql.INT, position_id)
            .input('passing_score', sql.DECIMAL(5,2), passing_score)
            .query(`
                UPDATE Modules 
                SET title = @title, description = @description, 
                    position_id = @position_id, passing_score = @passing_score
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

        if (result.recordset.length === 0) return res.status(404).json({ message: 'Modul tidak ditemukan' });

        res.json({ message: 'Modul diperbarui', data: result.recordset[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal memperbarui modul' });
    }
};

// DELETE
exports.deleteModule = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        const checkMaterial = await pool.request()
            .input('id', sql.INT, id)
            .query('SELECT COUNT(*) as count FROM Materials WHERE module_id = @id');
            
        if (checkMaterial.recordset[0].count > 0) {
            return res.status(400).json({ message: 'Tidak bisa menghapus! Kosongkan materi di dalam modul ini terlebih dahulu.' });
        }

        const result = await pool.request()
            .input('id', sql.INT, id)
            .query('DELETE FROM Modules WHERE id = @id');

        if (result.rowsAffected[0] === 0) return res.status(404).json({ message: 'Modul tidak ditemukan' });

        res.json({ message: 'Modul berhasil dihapus' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menghapus modul' });
    }
};