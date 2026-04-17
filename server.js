import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pkg from 'pg'; 
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import session from 'express-session';
import { GoogleGenerativeAI } from '@google/generative-ai';
const { Pool } = pkg;

// Load environment variables from .env
dotenv.config();

// Initialize PostgreSQL Connection Pool
const pool = new Pool({
  host: 'csce-315-db.engr.tamu.edu', 
  database: 'team_85_db',            
  user: process.env.DB_USER,         
  password: process.env.DB_PASSWORD, 
  port: 5432,                        
  ssl: {
    rejectUnauthorized: false       
  }
});

// Test Database Connection on Startup
pool.connect()
  .then(() => console.log('Successfully logged into TAMU database!'))
  .catch(err => console.error('Login failed:', err.message));

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth2 Strategy
const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${backendUrl}/auth/google/callback`
}, (accessToken, refreshToken, profile, done) => {
  return done(null, {
    id: profile.id,
    email: profile.emails[0].value,
    name: profile.displayName,
    avatar: profile.photos[0].value
  });
}));

// Serialize and deserialize user for session management
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Middleware to check if user is authenticated (For Manager Routes)
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Unauthorized: Manager access required.' });
};

// Middleware
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'dist'))); 

// ==========================================
//           AUTHENTICATION ROUTES
// ==========================================

// Google OAuth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to manager view on frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/manager`);
  }
);

app.get('/auth/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});

// API route to check authentication status
app.get('/api/auth/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        email: req.user.email,
        name: req.user.name,
        avatar: req.user.avatar
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// ==========================================
//    SHARED ROUTES (MENU & INVENTORY)
// ==========================================
// FIXED: Removed 'ensureAuthenticated' so the Cashier POS can load the menu!

app.get('/api/inventory', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory ORDER BY id ASC'); 
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.get('/api/menu', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu ORDER BY id ASC'); 
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
//        AI CHATBOT ROUTE
// ==========================================

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API Key is not configured on the server.' });
  }

  try {
    // 1. Fetch menu data for context
    const menuResult = await pool.query('SELECT item_name, price FROM menu ORDER BY id ASC');
    const menuItems = menuResult.rows.map(item => `${item.item_name} ($${Number(item.price).toFixed(2)})`).join(', ');

    // 2. Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // 3. Create context-aware prompt
    const prompt = `You are a helpful and friendly AI assistant for a restaurant kiosk. 
    Here is the current menu with prices: ${menuItems}. 
    Please answer the customer's question based on this menu. Keep answers concise, friendly, and helpful. 
    Customer: ${message}`;

    // 4. Get response
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    res.json({ response: text });
  } catch (err) {
    console.error('Gemini API Error:', err.message);
    res.status(500).json({ error: 'Failed to generate a response. Please try again later.' });
  }
});

// ==========================================
//        MANAGER ROUTES (PROTECTED)
// ==========================================

// 1. Get Sales Report (Date Range)
app.get('/api/reports/sales', async (req, res) => {
  const { start, end } = req.query;
  try {
    const sql = `
      SELECT m.item_name, COUNT(oi.menu_id) as quantity_sold, SUM(m.price) as total_revenue 
      FROM menu m 
      JOIN order_items oi ON m.id = oi.menu_id 
      JOIN orders o ON oi.order_id = o.order_id  -- FIXED: o.order_id instead of o.id
      WHERE DATE(o.order_time) BETWEEN $1 AND $2 -- FIXED: order_time
      GROUP BY m.id, m.item_name 
      ORDER BY quantity_sold DESC
    `;
    const result = await pool.query(sql, [start, end]);
    res.json(result.rows);
  } catch (err) {
    console.error("Sales Report SQL Error:", err.message);
    res.status(500).json({ error: 'Server error generating sales report' });
  }
});

// 2. Get X-Report (Current Day Hourly Breakdown)
app.get('/api/reports/xreport', async (req, res) => {
  try {
    const hourlySql = `
      SELECT EXTRACT(HOUR FROM order_time) as hour, -- FIXED: order_time
      COUNT(*) as order_count, 
      SUM(total_price) as total_sales -- FIXED: total_price
      FROM orders 
      WHERE DATE(order_time) = CURRENT_DATE -- FIXED: order_time
      GROUP BY hour ORDER BY hour
    `;
    const result = await pool.query(hourlySql);
    res.json(result.rows);
  } catch (err) {
    console.error("X-Report SQL Error:", err.message);
    res.status(500).json({ error: 'Server error generating X-Report' });
  }
});

// 3. Generate & Save Z-Report (End of Day)
app.post('/api/reports/zreport', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const dailySql = `SELECT COUNT(*) as total_orders, COALESCE(SUM(total_price), 0) as total_revenue FROM orders WHERE DATE(order_time) = CURRENT_DATE`;
    const rs = await client.query(dailySql);
    
    const total_orders = rs.rows[0].total_orders;
    const total_revenue = rs.rows[0].total_revenue;
    const taxAmount = total_revenue * 0.0825;

    const insertZReport = `INSERT INTO z_reports (report_date, total_orders, total_revenue, tax_amount) VALUES (CURRENT_DATE, $1, $2, $3)`;
    await client.query(insertZReport, [total_orders, total_revenue, taxAmount]);

    await client.query('COMMIT');
    res.json({ message: 'Z-Report Generated', data: { total_orders, total_revenue, taxAmount } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Z-Report SQL Error:", err.message);
    res.status(500).json({ error: 'Server error generating Z-Report' });
  } finally {
    client.release();
  }
});

// 4. Add New Menu Item & Ingredients
app.post('/api/menu', ensureAuthenticated, async (req, res) => {
  const { itemName, price, ingredientsText } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const insertMenu = `INSERT INTO menu (item_name, price) VALUES ($1, $2) RETURNING id`;
    const menuResult = await client.query(insertMenu, [itemName, price]);
    const newMenuId = menuResult.rows[0].id;

    if (ingredientsText) {
      const lines = ingredientsText.split('\n');
      for (let line of lines) {
        const parts = line.split(',');
        if (parts.length >= 2) {
          const invName = parts[0].trim();
          const qty = parseFloat(parts[1].trim());

          const findInv = `SELECT id FROM inventory WHERE item_name = $1`;
          const invRs = await client.query(findInv, [invName]);
          
          if (invRs.rows.length > 0) {
            const invId = invRs.rows[0].id;
            const insertIng = `INSERT INTO menu_ingredients (menu_id, inventory_id, quantity_used) VALUES ($1, $2, $3)`;
            await client.query(insertIng, [newMenuId, invId, qty]);
          }
        }
      }
    }
    
    await client.query('COMMIT');
    res.json({ success: true, message: 'Menu item added successfully!' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: 'Server error adding menu item' });
  } finally {
    client.release();
  }
});

// ==========================================
//        CASHIER CHECKOUT ROUTE
// ==========================================
app.post('/api/checkout', async (req, res) => {
  const { total_price, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN'); 

    // FIXED: total_price and order_time, RETURNING order_id
    const orderInsertQuery = `
      INSERT INTO orders (total_price, order_time) 
      VALUES ($1, NOW()) 
      RETURNING order_id;
    `;
    const orderResult = await client.query(orderInsertQuery, [total_price]);
    const orderId = orderResult.rows[0].order_id;

    const orderItemsInsertQuery = `INSERT INTO order_items (order_id, menu_id) VALUES ($1, $2);`;
    
    for (let item of items) {
      await client.query(orderItemsInsertQuery, [orderId, item.id]);

      await client.query(`
        UPDATE inventory i
        SET quantity = i.quantity - mi.quantity_used
        FROM menu_ingredients mi
        WHERE i.id = mi.inventory_id AND mi.menu_id = $1
      `, [item.id]);

      const iceUnits = item.ice === '120%' ? 3 : item.ice === '100%' ? 2 : item.ice === '50%' ? 1 : 0;
      if (iceUnits > 0) {
        await client.query(`UPDATE inventory SET quantity = quantity - $1 WHERE item_name ILIKE '%Ice%'`, [iceUnits]);
      }

      const sugarUnits = item.sugar === '120%' ? 3 : item.sugar === '100%' ? 2 : item.sugar === '50%' ? 1 : 0;
      if (sugarUnits > 0) {
        await client.query(`UPDATE inventory SET quantity = quantity - $1 WHERE item_name ILIKE '%Sugar%'`, [sugarUnits]);
      }

      if (item.toppings && item.toppings.length > 0) {
        for (let topping of item.toppings) {
          await client.query(`UPDATE inventory SET quantity = quantity - 1 WHERE item_name ILIKE $1`, [`%${topping.name}%`]);
        }
      }
    }

    await client.query('COMMIT'); 
    res.status(201).json({ message: 'Order submitted successfully', orderId: orderId });

  } catch (err) {
    await client.query('ROLLBACK'); 
    console.error('Checkout error:', err.message);
    res.status(500).json({ error: 'Server error during checkout' });
  } finally {
    client.release();
  }
});

// ==========================================
// Catch-all route to hand frontend routing over to React Router
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`TAMU SQL: listening on port ${PORT}`);
});