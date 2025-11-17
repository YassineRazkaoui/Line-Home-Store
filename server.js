// server.js

const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors'); 

const app = express();
// Use port defined by environment variable (Render) or default to 3000 (Local)
const port = process.env.PORT || 3000; 

// --- Server Security Configuration ---
const ADMIN_SECRET_KEY = 'admin-line-2025'; 

// --- Middlewares ---
app.use(cors()); 
app.use(bodyParser.json({ limit: '50mb' })); 
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' })); 
app.use(express.static('./')); 

// --- Database Connection Configuration (Uses environment variables) ---
const dbConfig = {
    // Render provides these variables. Fallback values are for local testing.
    host: process.env.MYSQL_HOST || '127.0.0.1', 
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '200120', 
    database: process.env.MYSQL_DATABASE || 'linehomestore' 
};

let dbConnection;

async function connectDB() {
    try {
        dbConnection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to MySQL Database!');
    } catch (err) {
        console.error('❌ Failed to connect to database:', err.stack);
        // Do not exit the process immediately on Render, let it retry or crash gracefully
        // For local testing: process.exit(1); 
    }
}

connectDB();

// --- API Endpoints ---

// Handles root URL
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/catalogue.html');
});

/**
 * 💾 POST Route: Add New Article (RESTRICTED)
 */
app.post('/api/articles', async (req, res) => {
    const { name, code, price, category, image, adminKey } = req.body;
    
    // 1. Authorization Check
    if (adminKey !== ADMIN_SECRET_KEY) {
        return res.status(401).send({ message: 'Authorization Failed: Invalid admin key.' });
    }
    
    // 2. Data Validation
    if (!name || !code || !price || !category || !image) {
        return res.status(400).send({ message: 'Missing required article fields.' });
    }

    try {
        const query = `
            INSERT INTO products (name, code, price, category, image)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [name, code, price, category, image];

        await dbConnection.execute(query, values);
        
        res.status(201).send({ message: `Article "${name}" saved successfully!` });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).send({ message: `Product Code Bar "${code}" already exists.` });
        }
        console.error('Error adding article:', error);
        res.status(500).send({ message: 'Failed to add article due to server error.' });
    }
});


/**
 * 🌐 GET Route: Fetch All Articles
 */
app.get('/api/articles', async (req, res) => {
    try {
        const [rows] = await dbConnection.query('SELECT * FROM products');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).send({ message: 'Failed to fetch articles.' });
    }
});


// --- Start Server ---
app.listen(port, () => {
    console.log(`🌍 Server running on port ${port}`);
    console.log(`Access website locally via: http://localhost:${port}/`); 
});