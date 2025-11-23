import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export default function authRouter(db) {
    const router = express.Router();

    // Register
    router.post('/register', async (req, res) => {
        try {
            const { name, email, password, role = 'admin' } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ error: 'Name, email, and password are required' });
            }

            // Check if user already exists
            const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
            if (existingUser) {
                return res.status(400).json({ error: 'User with this email already exists' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert user
            const result = db.prepare(`
                INSERT INTO users (name, email, password, role)
                VALUES (?, ?, ?, ?)
            `).run(name, email, hashedPassword, role);

            const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(result.lastInsertRowid);

            // Generate token
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.status(201).json({
                message: 'User registered successfully',
                user,
                token
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Login
    router.post('/login', async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            // Find user
            const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Check if user is active
            if (!user.is_active) {
                return res.status(401).json({ error: 'Account is deactivated' });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Generate token
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Check auth status
    router.get('/me', (req, res) => {
        try {
            const authHeader = req.headers.authorization;
            console.log('Auth header:', authHeader);
            
            if (!authHeader) {
                return res.status(401).json({ error: 'No token provided' });
            }

            const token = authHeader.replace('Bearer ', '').trim();
            
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }

            let decoded;
            try {
                decoded = jwt.verify(token, JWT_SECRET);
                console.log('Token decoded:', decoded);
            } catch (jwtError) {
                console.error('JWT verification error:', jwtError.message);
                return res.status(401).json({ error: 'Invalid token: ' + jwtError.message });
            }

            // Convert id to number if it's a string
            const userId = typeof decoded.id === 'string' ? parseInt(decoded.id, 10) : decoded.id;
            const user = db.prepare('SELECT id, name, email, role, is_active FROM users WHERE id = ?').get(userId);
            console.log('User found:', user, 'for userId:', userId, 'decoded.id:', decoded.id);

            if (!user) {
                console.error('User not found for id:', userId);
                // List all users for debugging
                const allUsers = db.prepare('SELECT id, name, email FROM users').all();
                console.log('All users in database:', allUsers);
                return res.status(401).json({ error: 'User not found' });
            }

            // Check is_active - SQLite stores as integer (0 or 1)
            const isActive = user.is_active === 1 || user.is_active === true || user.is_active === '1';
            if (!isActive) {
                console.error('User is inactive:', user);
                return res.status(401).json({ error: 'Account is deactivated' });
            }

            res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        } catch (error) {
            console.error('Auth check error:', error);
            res.status(401).json({ error: 'Invalid token: ' + error.message });
        }
    });

    return router;
}

