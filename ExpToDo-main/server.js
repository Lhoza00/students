const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ======================
// DATABASE CONNECTION
// ======================
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // your mysql password
    database: 'todo_app'
});

db.connect(err => {
    if (err) {
        console.error('DB connection failed:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// ======================
// GET TODOS
// ======================
app.get('/todos', (req, res) => {
    const sql = "SELECT * FROM todos ORDER BY id DESC";

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// ======================
// CREATE TODO
// ======================
app.post('/todos', (req, res) => {
    const { title, task, date } = req.body;

    const sql = "INSERT INTO todos (title, task, date) VALUES (?, ?, ?)";
    db.query(sql, [title, task, date], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Todo created", id: result.insertId });
    });
});

// ======================
// UPDATE TODO
// ======================
app.put('/todos/:id', (req, res) => {
    const id = req.params.id;
    const { title, task, completed } = req.body;

    const sql = `
        UPDATE todos 
        SET title = ?, task = ?, completed = ?
        WHERE id = ?
    `;

    db.query(sql, [title, task, completed, id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Todo updated" });
    });
});

// ======================
// DELETE TODO
// ======================
app.delete('/todos/:id', (req, res) => {
    const id = req.params.id;

    const sql = "DELETE FROM todos WHERE id = ?";
    db.query(sql, [id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Todo deleted" });
    });
});

// ======================
// START SERVER
// ======================
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
