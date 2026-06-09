const { poolPromise, sql } = require('../config/db');
const xlsx = require('xlsx');
const fs = require('fs');

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
                .input('is_correct', sql.BIT, ans.is_correct ? 1 : 0)
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

// IMPORT EXCEL
exports.importQuestionsFromExcel = async (req, res) => {
    try {
        const { module_id } = req.body;
        
        if (!module_id || !req.file) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Modul ID dan File Excel wajib diisi' });
        }

        // Baca file Excel
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Konversi sheet ke JSON
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'File Excel kosong' });
        }

        const pool = await poolPromise;

        // Ambil sequence_order terakhir dari modul ini agar soal baru ditaruh di paling bawah
        const seqResult = await pool.request()
            .input('module_id', sql.INT, module_id)
            .query('SELECT ISNULL(MAX(sequence_order), 0) as max_seq FROM Questions WHERE module_id = @module_id');
        
        let currentSequence = seqResult.recordset[0].max_seq + 1;
        let successCount = 0;

        for (let row of data) {
            // Pastikan format header Excel sesuai (Pertanyaan, Opsi A, Opsi B, Opsi C, Opsi D, Jawaban Benar)
            const questionText = row['Pertanyaan'];
            const optA = row['Opsi A'];
            const optB = row['Opsi B'];
            const optC = row['Opsi C'];
            const optD = row['Opsi D'];
            const correctAnswer = row['Jawaban Benar'] ? row['Jawaban Benar'].toString().trim().toUpperCase() : null;

            // Lewati baris jika data tidak lengkap
            if (!questionText || !optA || !optB || !optC || !optD || !['A', 'B', 'C', 'D'].includes(correctAnswer)) {
                continue; 
            }

            // Insert Soal
            const qResult = await pool.request()
                .input('module_id', sql.INT, module_id)
                .input('question_text', sql.NVARCHAR, questionText)
                .input('sequence_order', sql.INT, currentSequence)
                .query(`
                    INSERT INTO Questions (module_id, question_text, sequence_order)
                    OUTPUT INSERTED.id
                    VALUES (@module_id, @question_text, @sequence_order)
                `);
            
            const question_id = qResult.recordset[0].id;

            // Susun array jawaban
            const answersToInsert = [
                { text: optA, isCorrect: correctAnswer === 'A' ? 1 : 0 },
                { text: optB, isCorrect: correctAnswer === 'B' ? 1 : 0 },
                { text: optC, isCorrect: correctAnswer === 'C' ? 1 : 0 },
                { text: optD, isCorrect: correctAnswer === 'D' ? 1 : 0 }
            ];

            // Insert 4 Jawaban
            for (let ans of answersToInsert) {
                await pool.request()
                    .input('question_id', sql.INT, question_id)
                    .input('answer_text', sql.NVARCHAR, ans.text)
                    .input('is_correct', sql.BIT, ans.isCorrect)
                    .query(`
                        INSERT INTO Answers (question_id, answer_text, is_correct)
                        VALUES (@question_id, @answer_text, @is_correct)
                    `);
            }

            currentSequence++;
            successCount++;
        }

        // Hapus file sementara setelah selesai diproses
        fs.unlinkSync(req.file.path);

        res.status(201).json({ message: `Berhasil mengimpor ${successCount} soal kuis.` });

    } catch (error) {
        console.error(error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path); // Hapus file jika terjadi error
        }
        res.status(500).json({ message: 'Gagal mengimpor file Excel' });
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

// DELETE BULK (Hapus Banyak Sekaligus)
exports.deleteBulkQuestions = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Tidak ada soal yang dipilih untuk dihapus' });
        }

        const validIds = ids.filter(id => Number.isInteger(id));
        if (validIds.length === 0) {
            return res.status(400).json({ message: 'Format ID tidak valid' });
        }

        const idString = validIds.join(',');
        const pool = await poolPromise;

        await pool.request().query(`DELETE FROM Answers WHERE question_id IN (${idString})`);

        const result = await pool.request().query(`DELETE FROM Questions WHERE id IN (${idString})`);

        res.json({ message: `${result.rowsAffected[0]} soal dan jawabannya berhasil dihapus` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menghapus soal massal' });
    }
};