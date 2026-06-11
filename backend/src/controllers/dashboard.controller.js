const { poolPromise, sql } = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT 
                (SELECT COUNT(*) FROM Users WHERE role = 'operator') AS total_karyawan,
                (SELECT COUNT(*) FROM Modules) AS total_modul,
                (SELECT COUNT(*) FROM Test_Results WHERE is_passed = 1) AS ujian_lulus
        `);

        res.json({ data: result.recordset[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil statistik dasbor' });
    }
};

exports.getPopularModules = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT TOP 5
                mod.id,
                mod.title,
                ISNULL(CAST(AVG(tr.score) AS INT), 0) AS progress_percentage
            FROM Modules mod
            LEFT JOIN Test_Results tr ON mod.id = tr.module_id
            GROUP BY mod.id, mod.title
            ORDER BY COUNT(tr.id) DESC
        `);

        res.json({ data: result.recordset });
    } catch (error) {
        console.error("Error getPopularModules:", error);
        res.status(500).json({ message: 'Gagal mengambil data modul populer' });
    }
};