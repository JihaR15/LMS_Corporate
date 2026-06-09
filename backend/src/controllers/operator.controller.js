const { poolPromise, sql } = require('../config/db');

exports.getOperatorDashboardData = async (req, res) => {
    try {
        const user_id = req.user.id;
        const pool = await poolPromise;

        const modulesResult = await pool.request()
            .input('user_id', sql.INT, user_id)
            .query(`
                SELECT 
                    m.id,
                    m.title,
                    m.passing_score,
                    (SELECT COUNT(*) FROM Materials mat WHERE mat.module_id = m.id) AS total_materials,
                    (SELECT COUNT(*) FROM User_Progress up 
                     JOIN Materials mat ON up.material_id = mat.id 
                     WHERE mat.module_id = m.id AND up.user_id = @user_id AND up.is_completed = 1) AS completed_materials
                FROM Modules m
                WHERE m.position_id = (SELECT position_id FROM Users WHERE id = @user_id)
            `);

        const statsResult = await pool.request()
            .input('user_id', sql.INT, user_id)
            .query(`
                SELECT 
                    (SELECT COUNT(*) FROM Test_Results WHERE user_id = @user_id AND is_passed = 1) AS total_passed_tests
            `);

        res.json({
            data: {
                modules: modulesResult.recordset,
                stats: statsResult.recordset[0]
            }
        });
    } catch (error) {
        console.error("Error getOperatorDashboardData:", error);
        res.status(500).json({ message: 'Gagal memuat data dasbor operator' });
    }
};