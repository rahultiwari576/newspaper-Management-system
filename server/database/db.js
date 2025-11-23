import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database/database.sqlite');

let SQL;
let db;

// Initialize SQL.js and load/create database
async function initDatabase() {
    if (!SQL) {
        SQL = await initSqlJs();
    }
    
    if (fs.existsSync(dbPath)) {
        const buffer = fs.readFileSync(dbPath);
        db = new SQL.Database(buffer);
    } else {
        db = new SQL.Database();
        // Ensure directory exists
        const dbDir = path.dirname(dbPath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
    }
    
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON;');
    
    return db;
}

// Save database to file
function saveDatabase() {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
}

// Get database instance
async function getDb() {
    if (!db) {
        await initDatabase();
    }
    return db;
}

// Export functions
export default {
    getDb,
    saveDatabase,
    initDatabase,
};
