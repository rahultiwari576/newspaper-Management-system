import { initDatabase } from './dbAdapter.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function verifySetup() {
    console.log('🔍 Verifying setup...\n');
    
    const dbPath = join(__dirname, '../../database/newspaper.db');
    const dbDir = join(__dirname, '../../database');
    
    // Check if database directory exists
    if (!fs.existsSync(dbDir)) {
        console.log('📁 Creating database directory...');
        fs.mkdirSync(dbDir, { recursive: true });
        console.log('✅ Database directory created\n');
    }
    
    // Check if database file exists
    const dbExists = fs.existsSync(dbPath);
    console.log(`📊 Database file: ${dbExists ? '✅ Exists' : '❌ Not found'}`);
    
    if (dbExists) {
        try {
            const db = await initDatabase(dbPath);
            
            // Check tables
            const tables = db.prepare(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name NOT LIKE 'sqlite_%'
                ORDER BY name
            `).all();
            
            console.log(`\n📋 Tables found: ${tables.length}`);
            tables.forEach(table => {
                const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
                console.log(`   - ${table.name}: ${count.count} records`);
            });
            
            // Check for users
            const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
            console.log(`\n👤 Users: ${userCount.count}`);
            
            if (userCount.count > 0) {
                const users = db.prepare('SELECT name, email, role FROM users LIMIT 3').all();
                console.log('   Sample users:');
                users.forEach(user => {
                    console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
                });
            }
            
            db.close();
            console.log('\n✅ Setup verification complete!');
            console.log('\n💡 Next steps:');
            console.log('   1. Run: npm run dev');
            console.log('   2. Open: http://localhost:5173');
            console.log('   3. Login with: admin@newspaper.com / password123');
        } catch (error) {
            console.error('❌ Error reading database:', error.message);
            console.log('\n💡 Try running: npm run seed');
        }
    } else {
        console.log('\n💡 Database not found. Run: npm run seed');
    }
}

verifySetup();

