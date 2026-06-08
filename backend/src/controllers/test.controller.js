const { poolPromise, sql } = require('../config/db');

exports.submitTest = async (req, res) => {
    try {
        const { module_id, submitted_answers } = req.body;
        const user_id = req.user.id;

        if (!module_id || !submitted_answers || !Array.isArray(submitted_answers)) {
            return res.status(400).json({ message: 'Data jawaban tidak valid atau kosong' });
        }

        const pool = await poolPromise;

        const moduleQuery = await pool.request()
            .input('module_id', sql.INT, module_id)
            .query('SELECT passing_score FROM Modules WHERE id = @module_id');
        
        if (moduleQuery.recordset.length === 0) {
            return res.status(404).json({ message: 'Modul tidak ditemukan' });
        }
        const passing_score = moduleQuery.recordset[0].passing_score;

        const answerQuery = await pool.request()
            .input('module_id', sql.INT, module_id)
            .query(`
                SELECT a.id as answer_id, a.question_id 
                FROM Answers a
                JOIN Questions q ON a.question_id = q.id
                WHERE q.module_id = @module_id AND a.is_correct = 1
            `);
        const correctAnswers = answerQuery.recordset;

        const totalQuestionsQuery = await pool.request()
            .input('module_id', sql.INT, module_id)
            .query('SELECT COUNT(*) as total FROM Questions WHERE module_id = @module_id');
        const totalQuestions = totalQuestionsQuery.recordset[0].total;

        if (totalQuestions === 0) {
            return res.status(400).json({ message: 'Soal belum tersedia untuk modul ini' });
        }

        let correctCount = 0;
        
        submitted_answers.forEach(userAns => {
            const isCorrect = correctAnswers.some(
                dbAns => dbAns.question_id === userAns.question_id && dbAns.answer_id === userAns.answer_id
            );
            if (isCorrect) correctCount++;
        });

        const score = (correctCount / totalQuestions) * 100;
        const is_passed = score >= passing_score ? 1 : 0;

        const attemptQuery = await pool.request()
            .input('module_id', sql.INT, module_id)
            .input('user_id', sql.INT, user_id)
            .query('SELECT ISNULL(MAX(attempt), 0) as last_attempt FROM Test_Results WHERE module_id = @module_id AND user_id = @user_id');
        
        const current_attempt = attemptQuery.recordset[0].last_attempt + 1;

        await pool.request()
            .input('user_id', sql.INT, user_id)
            .input('module_id', sql.INT, module_id)
            .input('attempt', sql.INT, current_attempt)
            .input('score', sql.DECIMAL(5,2), score)
            .input('is_passed', sql.BIT, is_passed)
            .query(`
                INSERT INTO Test_Results (user_id, module_id, attempt, score, is_passed, taken_at)
                VALUES (@user_id, @module_id, @attempt, @score, @is_passed, GETDATE())
            `);

        res.status(201).json({
            message: 'Ujian selesai dievaluasi',
            data: {
                total_questions: totalQuestions,
                correct_answers: correctCount,
                score: score,
                passing_score: passing_score,
                is_passed: is_passed === 1,
                attempt: current_attempt
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengirim jawaban ujian' });
    }
};