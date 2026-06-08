const { poolPromise, sql } = require('../config/db');

// CREATE
exports.createQuestionWithAnswers = async (req, res) => {
    try {
        const { module_id, question_text, sequence_order, answers } = req.body;

        if (!module_id || !question_text || !sequence_order || !answers || answers.length === 0) {
            return res.status(400).json({ message: 'Data soal dan jawaban tidak lengkap' });
        }

        const pool = await poolPromise;

        const qResult = await pool.request()
            .input('module_id', sql.INT, module_id)
            .input('question_text', sql.NVARCHAR, question_text)
            .input('sequence_order', sql.INT, sequence_order)
            .query(`
                INSERT INTO Questions (module_id, question_text, sequence_order)
                OUTPUT INSERTED.id
                VALUES (@module_id, @question_text, @sequence_order)
            `);
            
        const question_id = qResult.recordset[0].id;

        for (let ans of answers) {
            await pool.request()
                .input('question_id', sql.INT, question_id)
                .input('answer_text', sql.NVARCHAR, ans.answer_text)
                .input('is_correct', sql.BIT, ans.is_correct)
                .query(`
                    INSERT INTO Answers (question_id, answer_text, is_correct)
                    VALUES (@question_id, @answer_text, @is_correct)
                `);
        }

        res.status(201).json({ message: 'Soal dan pilihan jawaban berhasil disimpan' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menyimpan soal' });
    }
};

// READ
exports.getQuestionsByModule = async (req, res) => {
    try {
        const { module_id } = req.params;
        const pool = await poolPromise;

        const qResult = await pool.request()
            .input('module_id', sql.INT, module_id)
            .query('SELECT * FROM Questions WHERE module_id = @module_id ORDER BY sequence_order ASC');
            
        const questions = qResult.recordset;

        if (questions.length === 0) {
            return res.json({ data: [] });
        }

        const questionIds = questions.map(q => q.id);

        const aResult = await pool.request()
            .query(`SELECT * FROM Answers WHERE question_id IN (${questionIds.join(',')})`);
            
        const allAnswers = aResult.recordset;

        const formattedData = questions.map(q => {
            return {
                ...q,
                answers: allAnswers.filter(a => a.question_id === q.id)
            };
        });

        res.json({ data: formattedData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil data soal' });
    }
};

// DELETE
exports.deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        await pool.request()
            .input('id', sql.INT, id)
            .query('DELETE FROM Answers WHERE question_id = @id');

        const result = await pool.request()
            .input('id', sql.INT, id)
            .query('DELETE FROM Questions WHERE id = @id');

        if (result.rowsAffected[0] === 0) return res.status(404).json({ message: 'Soal tidak ditemukan' });

        res.json({ message: 'Soal dan jawaban berhasil dihapus' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menghapus soal' });
    }
};