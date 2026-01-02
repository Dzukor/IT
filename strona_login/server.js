const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = 3000;

const dbConfig = {
    host: 'ip',
    user: 'database_user',
    password: 'password',
    database: 'website'
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.redirect('/login');
});

// LOGIN PAGE
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

// LOGIN
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Brak danych');
    }

    try {
        const connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(
            'SELECT password FROM users WHERE name = ?',
            [username]
        );

        await connection.end();

        if (rows.length === 0) {
            return res.status(401).send('Nieprawidłowe dane logowania');
        }

        const ok = await bcrypt.compare(password, rows[0].password);
        if (!ok) {
            return res.status(401).send('Nieprawidłowe dane logowania');
        }

        res.send(`Zalogowano: ${username}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Błąd serwera');
    }
});

// REGISTER PAGE
app.get('/rejestracja', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/rejestracja.html'));
});

// REGISTER
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password || password.length < 8) {
        return res.status(400).send('Niepoprawne dane');
    }

    try {
        const connection = await mysql.createConnection(dbConfig);

        const [users] = await connection.execute(
            'SELECT id FROM users WHERE name = ?',
            [username]
        );

        if (users.length > 0) {
            await connection.end();
            return res.status(409).send('Użytkownik już istnieje');
        }

        const hash = await bcrypt.hash(password, 10);

        await connection.execute(
            'INSERT INTO users (name, password) VALUES (?, ?)',
            [username, hash]
        );

        await connection.end();
        res.status(201).send('Użytkownik utworzony');
    } catch (err) {
        console.error(err);
        res.status(500).send('Błąd serwera');
    }
});

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
