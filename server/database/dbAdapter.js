import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let SQL;
let db;
let currentDbPath;

// Create a compatibility adapter for sql.js to work like better-sqlite3
function createAdapter(sqliteDb) {
    return {
        prepare: (sql) => {
            // Return an object with methods that create new statements each time
            return {
                get: (...params) => {
                    const stmt = sqliteDb.prepare(sql);
                    try {
                        if (params.length > 0) {
                            stmt.bind(params);
                        }
                        const result = stmt.step();
                        if (result) {
                            const row = stmt.getAsObject();
                            stmt.free();
                            return row;
                        }
                        stmt.free();
                        return undefined;
                    } catch (e) {
                        stmt.free();
                        throw e;
                    }
                },
                all: (...params) => {
                    const stmt = sqliteDb.prepare(sql);
                    try {
                        if (params.length > 0) {
                            stmt.bind(params);
                        }
                        const rows = [];
                        while (stmt.step()) {
                            rows.push(stmt.getAsObject());
                        }
                        stmt.free();
                        return rows;
                    } catch (e) {
                        stmt.free();
                        throw e;
                    }
                },
                run: (...params) => {
                    const stmt = sqliteDb.prepare(sql);
                    try {
                        if (params.length > 0) {
                            stmt.bind(params);
                        }
                        stmt.step();
                        stmt.free();
                        
                        // Get last insert rowid
                        let lastRowId = null;
                        try {
                            const result = sqliteDb.exec('SELECT last_insert_rowid() as id');
                            if (result && result[0] && result[0].values && result[0].values[0]) {
                                lastRowId = Number(result[0].values[0][0]);
                            }
                        } catch (e) {
                            // Ignore if can't get rowid
                        }
                        
                        return {
                            lastInsertRowid: lastRowId,
                            changes: sqliteDb.getRowsModified()
                        };
                    } catch (e) {
                        stmt.free();
                        throw e;
                    }
                }
            };
        },
        exec: (sql) => {
            try {
                return sqliteDb.exec(sql);
            } catch (e) {
                // sql.js exec returns results, but we need to handle errors
                throw e;
            }
        },
        pragma: (pragma) => {
            // Handle both 'foreign_keys = ON' and 'PRAGMA foreign_keys = ON'
            const pragmaStr = pragma.includes('PRAGMA') ? pragma : `PRAGMA ${pragma}`;
            sqliteDb.exec(pragmaStr);
        },
        close: () => {
            // Save before closing
            if (currentDbPath) {
                const data = sqliteDb.export();
                const buffer = Buffer.from(data);
                fs.writeFileSync(currentDbPath, buffer);
            }
        }
    };
}

export async function initDatabase(dbFilePath) {
    if (!SQL) {
        SQL = await initSqlJs();
    }
    
    const dbPath = dbFilePath || path.join(__dirname, '../../database/newspaper.db');
    currentDbPath = dbPath;
    
    // Ensure directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
    
    if (fs.existsSync(dbPath)) {
        const buffer = fs.readFileSync(dbPath);
        db = new SQL.Database(buffer);
        console.log('📂 Loaded existing database from:', dbPath);
    } else {
        db = new SQL.Database();
        console.log('📂 Created new database at:', dbPath);
    }
    
    // Enable foreign keys
    db.exec('PRAGMA foreign_keys = ON;');
    
    return createAdapter(db);
}

export function saveDatabase() {
    if (db && currentDbPath) {
        try {
            const data = db.export();
            const buffer = Buffer.from(data);
            fs.writeFileSync(currentDbPath, buffer);
            console.log('💾 Database saved to:', currentDbPath);
        } catch (error) {
            console.error('❌ Error saving database:', error);
        }
    }
}

export function getDatabase() {
    return createAdapter(db);
}

