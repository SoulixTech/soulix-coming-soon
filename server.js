// Node.js Express Server with SQLite Database
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Initialize SQLite Database
const db = new sqlite3.Database('./subscribers.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    // Create subscribers table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        user_agent TEXT
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Subscribers table ready');
      }
    });
  }
});

// API Endpoint: Subscribe email
app.post('/api/subscribe', (req, res) => {
  const { email } = req.body;
  
  // Validate email
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }
  
  // Get client info
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  // Insert into database
  const query = `INSERT INTO subscribers (email, ip_address, user_agent) VALUES (?, ?, ?)`;
  
  db.run(query, [email, ipAddress, userAgent], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({
          success: false,
          message: 'This email is already subscribed!'
        });
      }
      console.error('Database error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to save email. Please try again.'
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Thank you! We\'ll notify you when we launch! 🚀',
      subscriberId: this.lastID
    });
  });
});

// API Endpoint: Get all subscribers (admin)
app.get('/api/subscribers', (req, res) => {
  const query = `SELECT id, email, subscribed_at FROM subscribers ORDER BY subscribed_at DESC`;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch subscribers'
      });
    }
    
    res.json({
      success: true,
      count: rows.length,
      subscribers: rows
    });
  });
});

// API Endpoint: Get subscriber count
app.get('/api/subscribers/count', (req, res) => {
  const query = `SELECT COUNT(*) as count FROM subscribers`;
  
  db.get(query, [], (err, row) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to get count'
      });
    }
    
    res.json({
      success: true,
      count: row.count
    });
  });
});

// API Endpoint: Delete subscriber (admin)
app.delete('/api/subscribers/:email', (req, res) => {
  const email = req.params.email;
  const query = `DELETE FROM subscribers WHERE email = ?`;
  
  db.run(query, [email], function(err) {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete subscriber'
      });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Subscriber deleted successfully'
    });
  });
});

// Email validation helper
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Serve HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running!`);
  console.log(`📍 Open: http://localhost:${PORT}`);
  console.log(`💾 Database: subscribers.db\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('\n✅ Database connection closed');
    }
    process.exit(0);
  });
});
