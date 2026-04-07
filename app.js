require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./Octagon/db.js');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = userResult.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Passwords match, create JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Middleware to check for manager role
const requireManager = (req, res, next) => {
    if (req.user.role !== 'manager') {
        return res.status(403).json({ error: 'Access denied. Manager role required.' });
    }
    next();
};

// Example protected route for manager
app.get('/api/manager/data', authenticateToken, requireManager, (req, res) => {
    res.json({ message: `Welcome manager ${req.user.username}! Here is your secret data.` });
});

// Example protected route for cashier
app.get('/api/cashier/data', authenticateToken, (req, res) => {
    if (req.user.role !== 'cashier' && req.user.role !== 'manager') {
        return res.status(403).json({ error: 'Access denied. Cashier or Manager role required.' });
    }
    res.json({ message: `Welcome ${req.user.role} ${req.user.username}! Here is your data.` });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});