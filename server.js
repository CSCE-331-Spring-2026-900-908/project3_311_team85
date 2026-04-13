import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pkg from 'pg'; 
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

// Middleware
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'dist'))); 


// ==========================================
//               API ROUTES
// ==========================================

// --- INVENTORY & MENU ---

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


// --- REPORTING ROUTES ---

// 1. Get Sales Report (Date Range)
app.get('/api/reports/sales', async (req, res) => {
  const { start, end } = req.query;
  try {
    const sql = `
      SELECT m.item_name, COUNT(oi.menu_id) as quantity_sold, SUM(m.price) as total_revenue 
      FROM menu m 
      JOIN order_items oi ON m.id = oi.menu_id 
      JOIN orders o ON oi.order_id = o.id 
      WHERE DATE(o.order_timestamp) BETWEEN $1 AND $2 
      GROUP BY m.id, m.item_name 
      ORDER BY quantity_sold DESC
    `;
    const result = await pool.query(sql, [start, end]);
    res.json(result.rows);
  } catch (err) {
    console.error('Sales Report SQL Error:', err.message);
    console.error('Full error:', err);
    res.status(500).json({ error: 'Server error generating sales report: ' + err.message });
  }
});

// 2. Get X-Report (Current Day Hourly Breakdown)
app.get('/api/reports/xreport', async (req, res) => {
  try {
    const hourlySql = `
      SELECT EXTRACT(HOUR FROM order_timestamp) as hour, 
      COUNT(*) as order_count, 
      SUM(total_amount) as total_sales 
      FROM orders 
      WHERE DATE(order_timestamp) = CURRENT_DATE 
      GROUP BY EXTRACT(HOUR FROM order_timestamp)
      ORDER BY hour
    `;
    const result = await pool.query(hourlySql);
    res.json(result.rows);
  } catch (err) {
    console.error('X-Report SQL Error:', err.message);
    console.error('Full error:', err);
    res.status(500).json({ error: 'Server error generating X-Report: ' + err.message });
  }
});

// 3. Generate & Save Z-Report (End of Day)
app.post('/api/reports/zreport', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Note: total_amount replaces total_price here to match your PostgreSQL schema
    const dailySql = `SELECT COUNT(*) as total_orders, COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE DATE(order_timestamp) = CURRENT_DATE`;
    const rs = await client.query(dailySql);
    
    const total_orders = rs.rows[0].total_orders;
    const total_revenue = rs.rows[0].total_revenue;
    const taxAmount = total_revenue * 0.0825;

    // Save to Z-Report Table
    const insertZReport = `INSERT INTO z_reports (report_date, total_orders, total_revenue, tax_amount) VALUES (CURRENT_DATE, $1, $2, $3)`;
    await client.query(insertZReport, [total_orders, total_revenue, taxAmount]);

    await client.query('COMMIT');
    res.json({ message: 'Z-Report Generated', data: { total_orders, total_revenue, taxAmount } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Z-Report SQL Error:', err.message);
    console.error('Full error:', err);
    res.status(500).json({ error: 'Server error generating Z-Report: ' + err.message });
  } finally {
    client.release();
  }
});


// --- MANAGER ACTION ROUTES ---

// 4. Add New Menu Item & Ingredients
app.post('/api/menu', async (req, res) => {
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

// --- CASHIER CHECKOUT ROUTE ---

app.post('/api/checkout', async (req, res) => {
  // req.body.total_price is what the React frontend sends, but we map it to total_amount in SQL
  const { total_price, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN'); 

    // Uses total_amount to match your PostgreSQL schema
    const orderInsertQuery = `
      INSERT INTO orders (total_amount) 
      VALUES ($1) 
      RETURNING id; -- Ensure 'id' matches your orders table primary key
    `;
    const orderResult = await client.query(orderInsertQuery, [total_price]);
    const orderId = orderResult.rows[0].id;

    const orderItemsInsertQuery = `
      INSERT INTO order_items (order_id, menu_id) 
      VALUES ($1, $2);
    `;
    
    for (let item of items) {
      await client.query(orderItemsInsertQuery, [orderId, item.id]);
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

// Catch-all route to hand frontend routing over to React Router
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`TAMU SQL: listening on port ${PORT}`);
});