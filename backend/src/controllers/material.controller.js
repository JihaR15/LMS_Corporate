const { poolPromise, sql } = require('../config/db');

// CREATE
exports.createMaterial = async (req, res) => {
    try {
        const { module_id, title, type, sequence_order, file_url, source_type } = req.body;

        if (!module_id || !title || !type || !sequence_order) {
            return res.status(400).json({ message: 'Semua field teks wajib diisi' });
        }

        let finalUrl = file_url;
        if (req.file) {
            finalUrl = `/uploads/${req.file.filename}`;
        }

        if (!finalUrl || finalUrl.trim() === '') {
            return res.status(400).json({ message: 'Harap unggah file atau masukkan Link URL' });
        }

        const pool = await poolPromise;
        
        await pool.request()
            .input('module_id', sql.INT, module_id)
            .input('title', sql.NVARCHAR(255), title)
            .input('type', sql.NVARCHAR(50), type)
            .input('file_url', sql.NVARCHAR(sql.MAX), finalUrl)
            .input('sequence_order', sql.INT, sequence_order)
            .query(`
                INSERT INTO Materials (module_id, title, type, file_url, sequence_order) 
                VALUES (@module_id, @title, @type, @file_url, @sequence_order)
            `);
        
        await pool.request()
            .input('module_id', sql.INT, module_id)
            .query('DELETE FROM Test_Results WHERE module_id = @module_id');

        res.status(201).json({ message: 'Materi berhasil ditambahkan' });
    } catch (error) {
        console.error("Error createMaterial:", error);
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

exports.reorderMaterials = async (req, res) => {
    try {
        const { ordered_ids } = req.body;

        if (!ordered_ids || !Array.isArray(ordered_ids) || ordered_ids.length === 0) {
            return res.status(400).json({ message: 'Data urutan materi tidak valid' });
        }

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();
            const request = new sql.Request(transaction);

            for (let i = 0; i < ordered_ids.length; i++) {
                await request
                    .input(`id_${i}`, sql.INT, ordered_ids[i])
                    .input(`order_${i}`, sql.INT, i + 1)
                    .query(`UPDATE Materials SET sequence_order = @order_${i} WHERE id = @id_${i}`);
            }

            await transaction.commit();
            res.json({ message: 'Urutan materi berhasil diperbarui' });

        } catch (innerError) {
            await transaction.rollback();
            console.error("Rollback Reorder:", innerError);
            throw innerError;
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal memperbarui urutan materi' });
    }
};

exports.updateMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, type, file_url, source_type } = req.body;
        
        if (!title || !type) {
            return res.status(400).json({ message: 'Judul dan tipe materi wajib diisi' });
        }

        const pool = await poolPromise;

        // 1. Ambil data lama sebelum di-update untuk pengecekan
        const oldDataReq = await pool.request()
            .input('id', sql.INT, id)
            .query('SELECT type, file_url FROM Materials WHERE id = @id');
            
        if (oldDataReq.recordset.length === 0) {
            return res.status(404).json({ message: 'Materi tidak ditemukan' });
        }
        
        const oldData = oldDataReq.recordset[0];

        // 2. Cegah Admin mengganti tipe materi tanpa mengunggah file baru
        if (oldData.type !== type && source_type === 'file' && !req.file) {
            return res.status(400).json({ 
                message: `Anda mengubah tipe menjadi ${type.toUpperCase()}, harap unggah file ${type.toUpperCase()} yang baru.` 
            });
        }

        let finalUrl = file_url;
        if (req.file) {
            finalUrl = `/uploads/${req.file.filename}`;
        }

        const request = pool.request()
            .input('id', sql.INT, id)
            .input('title', sql.NVARCHAR(255), title)
            .input('type', sql.NVARCHAR(50), type);

        // 3. Eksekusi Update
        if ((source_type === 'link' && finalUrl) || req.file) {
            request.input('file_url', sql.NVARCHAR(sql.MAX), finalUrl);
            await request.query('UPDATE Materials SET title = @title, type = @type, file_url = @file_url WHERE id = @id');
        } else {
            await request.query('UPDATE Materials SET title = @title, type = @type WHERE id = @id');
        }

        res.json({ message: 'Materi berhasil diperbarui' });
    } catch (error) {
        console.error("Error updateMaterial:", error);
        res.status(500).json({ message: 'Gagal memperbarui materi' });
    }
};