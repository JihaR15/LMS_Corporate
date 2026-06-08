const { poolPromise, sql } = require('../config/db');

// CREATE
exports.markMaterialAsCompleted = async (req, res) => {
    try {
        const { material_id } = req.body;
        const user_id = req.user.id;

        if (!material_id) {
            return res.status(400).json({ message: 'ID Materi wajib dikirim' });
        }

        const pool = await poolPromise;

        await pool.request()
            .input('user_id', sql.INT, user_id)
            .input('material_id', sql.INT, material_id)
            .query(`
                IF NOT EXISTS (SELECT 1 FROM User_Progress WHERE user_id = @user_id AND material_id = @material_id)
                BEGIN
                    INSERT INTO User_Progress (user_id, material_id, is_completed, completed_at)
                    VALUES (@user_id, @material_id, 1, GETDATE())
                END
            `);

        res.json({ message: 'Materi berhasil ditandai selesai' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mencatat progress' });
    }
};

// READ
exports.checkModuleProgress = async (req, res) => {
    try {
        const { module_id } = req.params;
        const user_id = req.user.id;

        const pool = await poolPromise;

        const result = await pool.request()
            .input('module_id', sql.INT, module_id)
            .input('user_id', sql.INT, user_id)
            .query(`
                SELECT 
                    (SELECT COUNT(*) FROM Materials WHERE module_id = @module_id) as total_materials,
                    (SELECT COUNT(*) FROM User_Progress up
                     JOIN Materials m ON up.material_id = m.id
                     WHERE m.module_id = @module_id AND up.user_id = @user_id AND up.is_completed = 1) as completed_materials
            `);

        const progress = result.recordset[0];
        
        const isUnlocked = (progress.total_materials > 0) && (progress.total_materials === progress.completed_materials);

        res.json({
            data: {
                total_materials: progress.total_materials,
                completed_materials: progress.completed_materials,
                is_post_test_unlocked: isUnlocked
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengecek progress modul' });
    }
};