require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { poolPromise } = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const positionRoutes = require('./routes/position.routes');
const userRoutes = require('./routes/user.routes');
const moduleRoutes = require('./routes/module.routes');
const materialRoutes = require('./routes/material.routes');
const questionRoutes = require('./routes/question.routes');
const progressRoutes = require('./routes/progress.routes');
const testRoutes = require('./routes/test.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/tests', testRoutes);

app.get('/', (req, res) => {
    res.send('LMS Corporate API is running...');
});

app.get('/test-db', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT GETDATE() as server_time');
        res.json({
            message: 'Database connection is active!',
            server_time: result.recordset[0].current_time
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});