# Projekt: System Logowania i Rejestracji

## Opis projektu

Aplikacja webowa napisana w Node.js z wykorzystaniem Express.js, umożliwiająca rejestrację użytkowników oraz logowanie z bezpiecznym przechowywaniem haseł w bazie danych MySQL.

## Technologie

- **Node.js** - środowisko uruchomieniowe JavaScript
- **Express.js** - framework webowy
- **MySQL** - baza danych
- **bcryptjs** - biblioteka do hashowania haseł
- **mysql2/promise** - sterownik MySQL z obsługą Promise

## Struktura projektu

```
project/
├── server.js           # Główny plik serwera
├── public/
│   ├── login.html      # Strona logowania
│   ├── rejestracja.html # Strona rejestracji
│   └── style.css       # Arkusz stylów
└── README.md
```

## Szczegółowa dokumentacja kodu

### server.js

#### Importy i konfiguracja (linie 1-13)

```javascript
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
```

[**Linie 1-4**](server.js:1): Import niezbędnych modułów:
- `express` - framework do tworzenia serwera HTTP
- `mysql2/promise` - asynchroniczny sterownik MySQL
- `bcryptjs` - biblioteka do bezpiecznego hashowania haseł
- `path` - moduł do operacji na ścieżkach plików

```javascript
const app = express();
const PORT = 3000;
```

[**Linia 6**](server.js#L6): Inicjalizacja aplikacji Express  
[**Linia 7**](server.js#L7): Definicja portu nasłuchiwania serwera

```javascript
const dbConfig = {
    host: 'ip',
    user: 'database_user',
    password: 'password',
    database: 'website'
};
```

[**Linie 9-14**](server.js#L9): Konfiguracja połączenia z bazą danych MySQL
- `host` - adres IP serwera bazy danych
- `user` - nazwa użytkownika bazy danych
- `password` - hasło dostępu do bazy
- `database` - nazwa używanej bazy danych

⚠️ **UWAGA BEZPIECZEŃSTWA**: Dane uwierzytelniające powinny być przechowywane w zmiennych środowiskowych, a nie w kodzie!

#### Middleware (linie 15-17)

```javascript
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
```

[**Linia 15**](server.js#L15): Middleware do parsowania danych z formularzy (application/x-www-form-urlencoded)  
[**Linia 16**](server.js#L16): Middleware do parsowania danych JSON  
[**Linia 17**](server.js#L17): Serwowanie plików statycznych z katalogu `public`

#### Routing - Strona główna (linie 19-21)

```javascript
app.get('/', (req, res) => {
    res.redirect('/login');
});
```

[**Linie 19-21**](server.js#L19): Przekierowanie z głównej ścieżki `/` na stronę logowania

#### Endpoint - Strona logowania (linie 23-26)

```javascript
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});
```

[**Linie 24-26**](server.js#L24): Obsługa żądania GET na `/login`, zwraca plik HTML z formularzem logowania

#### Endpoint - Logowanie użytkownika (linie 28-59)

```javascript
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
```

[**Linia 29**](server.js#L29): Definicja asynchronicznej funkcji obsługującej POST na `/login`  
[**Linia 30**](server.js#L30): Destrukturyzacja danych z ciała żądania (username i password)

```javascript
    if (!username || !password) {
        return res.status(400).send('Brak danych');
    }
```

[**Linie 31-33**](server.js#L31): Walidacja - sprawdzenie czy oba pola zostały wypełnione, w przeciwnym razie zwrot błędu 400

```javascript
    try {
        const connection = await mysql.createConnection(dbConfig);
```

[**Linia 35**](server.js#L35): Rozpoczęcie bloku try-catch do obsługi błędów  
[**Linia 36**](server.js#L36): Utworzenie asynchronicznego połączenia z bazą danych

```javascript
        const [rows] = await connection.execute(
            'SELECT password FROM users WHERE name = ?',
            [username]
        );
```

[**Linie 38-41**](server.js#L38): Wykonanie zapytania SQL pobierającego hasło użytkownika:
- Używa prepared statement (znak `?`) dla bezpieczeństwa przed SQL Injection
- Zwraca tablicę wyników w zmiennej `rows`

```javascript
        await connection.end();
```

[**Linia 43**](server.js#L43): Zamknięcie połączenia z bazą danych

```javascript
        if (rows.length === 0) {
            return res.status(401).send('Nieprawidłowe dane logowania');
        }
```

[**Linie 45-47**](server.js#L45): Sprawdzenie czy użytkownik istnieje w bazie, jeśli nie - zwrot błędu 401 (Unauthorized)

```javascript
        const ok = await bcrypt.compare(password, rows[0].password);
        if (!ok) {
            return res.status(401).send('Nieprawidłowe dane logowania');
        }
```

[**Linie 49-52**](server.js#L49): Porównanie podanego hasła z zahashowanym hasłem z bazy:
- `bcrypt.compare()` automatycznie obsługuje salt zapisany w hashu
- Jeśli hasła nie pasują - zwrot błędu 401

```javascript
        res.send(`Zalogowano: ${username}`);
```

[**Linia 54**](server.js#L54): Potwierdzenie pomyślnego logowania

```javascript
    } catch (err) {
        console.error(err);
        res.status(500).send('Błąd serwera');
    }
```

[**Linie 55-58**](server.js#L55): Obsługa błędów - logowanie błędu i zwrot statusu 500 (Internal Server Error)

#### Endpoint - Strona rejestracji (linie 61-64)

```javascript
app.get('/rejestracja', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/rejestracja.html'));
});
```

[**Linie 62-64**](server.js#L62): Obsługa żądania GET na `/rejestracja`, zwraca plik HTML z formularzem rejestracji

#### Endpoint - Rejestracja użytkownika (linie 66-100)

```javascript
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
```

[**Linia 67**](server.js#L67): Definicja asynchronicznej funkcji obsługującej POST na `/register`  
[**Linia 68**](server.js#L68): Destrukturyzacja danych z formularza

```javascript
    if (!username || !password || password.length < 8) {
        return res.status(400).send('Niepoprawne dane');
    }
```

[**Linie 70-72**](server.js#L70): Walidacja danych:
- Sprawdzenie czy pola nie są puste
- Sprawdzenie czy hasło ma minimum 8 znaków

```javascript
    try {
        const connection = await mysql.createConnection(dbConfig);
```

[**Linia 74**](server.js#L74): Rozpoczęcie bloku try-catch  
[**Linia 75**](server.js#L75): Nawiązanie połączenia z bazą danych

```javascript
        const [users] = await connection.execute(
            'SELECT id FROM users WHERE name = ?',
            [username]
        );

        if (users.length > 0) {
            await connection.end();
            return res.status(409).send('Użytkownik już istnieje');
        }
```

[**Linie 77-84**](server.js#L77): Sprawdzenie czy użytkownik już istnieje:
- Zapytanie SQL sprawdzające istnienie użytkownika o podanej nazwie
- Jeśli użytkownik istnieje - zamknięcie połączenia i zwrot błędu 409 (Conflict)

```javascript
        const hash = await bcrypt.hash(password, 10);
```

[**Linia 86**](server.js#L86): Hashowanie hasła z użyciem bcrypt:
- Parametr `10` określa liczbę rund hashowania (cost factor)
- Wyższa wartość = większe bezpieczeństwo, ale dłuższy czas przetwarzania

```javascript
        await connection.execute(
            'INSERT INTO users (name, password) VALUES (?, ?)',
            [username, hash]
        );
```

[**Linie 88-91**](server.js#L88): Wstawienie nowego użytkownika do bazy danych:
- Zapisuje nazwę użytkownika i zahashowane hasło
- Używa prepared statement dla bezpieczeństwa

```javascript
        await connection.end();
        res.status(201).send('Użytkownik utworzony');
```

[**Linia 93**](server.js#L93): Zamknięcie połączenia z bazą  
[**Linia 94**](server.js#L94): Zwrot statusu 201 (Created) z komunikatem o sukcesie

```javascript
    } catch (err) {
        console.error(err);
        res.status(500).send('Błąd serwera');
    }
```

[**Linie 95-98**](server.js#L95): Obsługa błędów podczas rejestracji

#### Start serwera (linie 102-104)

```javascript
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
```

[**Linie 102-104**](server.js#L102): Uruchomienie serwera na zdefiniowanym porcie z wyświetleniem adresu URL w konsoli

### login.html

#### Struktura dokumentu (linie 1-9)

```html
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <link rel="stylesheet" href="style.css">
</head>
```

[**Linia 2**](./public/login.html#L2): Język dokumentu ustawiony na polski  
[**Linia 4**](./public/login.html#L4): Kodowanie znaków UTF-8  
[**Linia 5**](./public/login.html#L5): Meta tag dla responsywności  
[**Linia 7**](./public/login.html#L7): Podłączenie arkusza stylów CSS

#### Formularz logowania (linie 10-18)

```html
<form action="/login" method="POST">
    <input type="text" name="username" placeholder="Nazwa użytkownika" required>
    <br><br>
    <input type="password" name="password" placeholder="Hasło" required>
    <br><br>
    <button type="submit">Zaloguj</button>
</form>
```

[**Linia 10**](./public/login.html#L10): Formularz wysyłający dane metodą POST na endpoint `/login`  
[**Linia 11**](./public/login.html#L11): Pole tekstowe dla nazwy użytkownika z walidacją `required`  
[**Linia 13**](./public/login.html#L13): Pole typu password dla hasła (znaki są maskowane)  
[**Linia 15**](./public/login.html#L15): Przycisk submit wysyłający formularz

```html
<a href="rejestracja.html">Zarejestruj się</a>
```

[**Linia 18**](./public/login.html#L18): Link przekierowujący na stronę rejestracji

### rejestracja.html

#### Struktura dokumentu (linie 1-8)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rejestracja</title>
</head>
```

[**Linia 2**](./public/rejestracja.html#L2): Język dokumentu (powinien być `pl` dla spójności)  
[**Linia 6**](./public/rejestracja.html#L6): Tytuł strony "Rejestracja"

#### Formularz rejestracji (linie 9-16)

```html
<form action="/register" method="POST">
    <input type="text" name="username" placeholder="Nazwa użytkownika" required>
    <br><br>
    <input type="password" name="password" placeholder="Hasło" required>
    <br><br>
    <button type="submit">Zarejestruj się</button>
</form>
```

[**Linia 9**](./public/rejestracja.html#L9): Formularz wysyłający dane metodą POST na endpoint `/register`  
[**Linia 10**](./public/rejestracja.html#L10): Pole tekstowe dla nazwy użytkownika  
[**Linia 12**](./public/rejestracja.html#L12): Pole password dla hasła  
[**Linia 14**](./public/rejestracja.html#L14): Przycisk submit do wysłania formularza

## Wymagania systemowe

- Node.js (wersja 14 lub nowsza)
- MySQL Server (wersja 5.7 lub nowsza)
- npm (Node Package Manager)

## Instalacja

1. Sklonuj repozytorium lub skopiuj pliki projektu
2. Zainstaluj zależności:
```bash
npm install express mysql2 bcryptjs
```

3. Utwórz bazę danych MySQL:
```sql
CREATE DATABASE website;
USE website;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
### Konfiguracja
W /etc/my.cnf.d/mariadb-server.cnf należy dodać 
```bash
bind-address=0.0.0.0 #LUB ADRES SERWERA Z NODE.JS
```

4. Skonfiguruj parametry połączenia w `server.js` (linie 9-14)

## Uruchomienie

```bash
node server.js
```

Aplikacja będzie dostępna pod adresem: `http://localhost:3000`

## Bezpieczeństwo

### Zaimplementowane mechanizmy:
- ✅ Hashowanie haseł z użyciem bcrypt
- ✅ Prepared statements chroniące przed SQL Injection
- ✅ Walidacja długości hasła (minimum 8 znaków)
- ✅ Sprawdzanie unikalności nazwy użytkownika

### Rekomendowane usprawnienia:
- ⚠️ Przechowywanie danych uwierzytelniających w zmiennych środowiskowych (`.env`)
- ⚠️ Implementacja sesji użytkownika (np. express-session, JWT)
- ⚠️ Dodanie HTTPS
- ⚠️ Rate limiting dla endpointów logowania/rejestracji
- ⚠️ Walidacja siły hasła (wielkie/małe litery, cyfry, znaki specjalne)
- ⚠️ Implementacja CSRF protection
- ⚠️ Dodanie logowania prób logowania
- ⚠️ Implementacja mechanizmu odzyskiwania hasła

## API Endpoints

### POST /login
Logowanie użytkownika

**Request body:**
```json
{
  "username": "nazwa_uzytkownika",
  "password": "haslo"
}
```

**Odpowiedzi:**
- `200` - Pomyślne logowanie
- `400` - Brak wymaganych danych
- `401` - Nieprawidłowe dane logowania
- `500` - Błąd serwera

### POST /register
Rejestracja nowego użytkownika

**Request body:**
```json
{
  "username": "nazwa_uzytkownika",
  "password": "haslo_min_8_znakow"
}
```

**Odpowiedzi:**
- `201` - Użytkownik utworzony pomyślnie
- `400` - Niepoprawne dane (za krótkie hasło lub brak danych)
- `409` - Użytkownik już istnieje
- `500` - Błąd serwera

## Licencja

Projekt edukacyjny - brak licencji