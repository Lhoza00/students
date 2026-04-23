const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = 3000;

const db = new sqlite3.Database("./student.db");

db.run(`
    CREATE TABLE IF NOT EXISTS STUDENTS(
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        S_NAME TEXT NOT NULL,
        S_SURNAME TEXT NOT NULL,
        S_MAIL TEXT NOT NULL UNIQUE
    )
`);

app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
});

app.post("/students", (req, res) => {
    const { S_NAME, S_SURNAME, S_MAIL } = req.body;

    if (!S_NAME || !S_SURNAME || !S_MAIL) {
        return res.status(400).json({
            error: "Bad Request",
            message: "All fields are required."
        });
    }

    const query = `INSERT INTO STUDENTS (S_NAME, S_SURNAME, S_MAIL) VALUES (?, ?, ?)`;

    db.run(query, [S_NAME, S_SURNAME, S_MAIL], function (err) {
        if (err) {
            if (err.message.includes("SQLITE_CONSTRAINT")) {
                return res.status(409).json({
                    error: "Constraint Violation",
                    message: "Mail already exists."
                });
            }
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            message: "Student added",
            id: this.lastID
        });
    });
});

app.get("/students", (req, res) => {
    db.all(`SELECT * FROM STUDENTS`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.put("/students/:id", (req, res) => {
    const { id } = req.params;
    const { S_NAME, S_SURNAME, S_MAIL } = req.body;

    const query = `UPDATE STUDENTS SET S_NAME=?, S_SURNAME=?, S_MAIL=? WHERE ID=?`;

    db.run(query, [S_NAME, S_SURNAME, S_MAIL, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Student updated" });
    });
});

app.delete("/students/:id", (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM STUDENTS WHERE ID=?`, [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Student deleted" });
    });
});