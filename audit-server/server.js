// Cookie Auditor Dashboard Server with Local SQLite Database
// Run with: node server.js
// Access dashboard at: http://localhost:3000

const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');

const app = express();

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite database
const dbPath = process.env.DB_PATH || path.join(__dirname, 'audit_data.db');
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS audit_reports (
    id TEXT PRIMARY KEY,
    received_at TEXT NOT NULL,
    device_name TEXT,
    cookie_count INTEGER DEFAULT 0,
    domain_count INTEGER DEFAULT 0,
    browser_info TEXT,
    timestamp TEXT,
    domains TEXT,
    cookies TEXT,
    events TEXT,
    raw_data TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_received_at ON audit_reports(received_at DESC);
  CREATE INDEX IF NOT EXISTS idx_device_name ON audit_reports(device_name);
`);

console.log('✓ SQLite database initialized:', dbPath);

// Endpoint to receive audit reports
app.post('/audit-report', async (req, res) => {
  try {
    const report = req.body;
    
    // Prepare report data
    const reportData = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      received_at: new Date().toISOString(),
      device_name: report.deviceName || 'Unknown',
      cookie_count: report.cookieCount || 0,
      domain_count: report.domainCount || 0,
      browser_info: JSON.stringify(report.browserInfo || {}),
      timestamp: report.timestamp || new Date().toISOString(),
      domains: JSON.stringify(report.domains || []),
      cookies: JSON.stringify(report.cookiesWithValues || report.cookies || []),
      events: JSON.stringify(report.recentEvents || report.events || []),
      raw_data: JSON.stringify(report)
    };

    // Insert into SQLite
    const stmt = db.prepare(`
      INSERT INTO audit_reports 
      (id, received_at, device_name, cookie_count, domain_count, browser_info, timestamp, domains, cookies, events, raw_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      reportData.id,
      reportData.received_at,
      reportData.device_name,
      reportData.cookie_count,
      reportData.domain_count,
      reportData.browser_info,
      reportData.timestamp,
      reportData.domains,
      reportData.cookies,
      reportData.events,
      reportData.raw_data
    );

    console.log(`✓ Report saved to database from ${reportData.device_name} - ${reportData.cookie_count} cookies`);

    res.json({ 
      success: true, 
      message: 'Audit report saved to local database',
      reportId: reportData.id,
      storage: 'sqlite'
    });

  } catch (error) {
    console.error('Error receiving report:', error);
    res.status(500).json({ 
      error: 'Failed to process report',
      details: error.message 
    });
  }
});

// Get all reports
app.get('/api/reports', async (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM audit_reports ORDER BY received_at DESC LIMIT 1000');
    const rows = stmt.all();
    
    // Parse JSON fields
    const reports = rows.map(row => ({
      ...row,
      browser_info: JSON.parse(row.browser_info || '{}'),
      domains: JSON.parse(row.domains || '[]'),
      cookies: JSON.parse(row.cookies || '[]'),
      events: JSON.parse(row.events || '[]'),
      raw_data: JSON.parse(row.raw_data || '{}')
    }));
    
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get single report
app.get('/api/reports/:id', async (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM audit_reports WHERE id = ?');
    const row = stmt.get(req.params.id);
    
    if (!row) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    // Parse JSON fields
    const report = {
      ...row,
      browser_info: JSON.parse(row.browser_info || '{}'),
      domains: JSON.parse(row.domains || '[]'),
      cookies: JSON.parse(row.cookies || '[]'),
      events: JSON.parse(row.events || '[]'),
      raw_data: JSON.parse(row.raw_data || '{}')
    };
    
    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Delete report
app.delete('/api/reports/:id', async (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM audit_reports WHERE id = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// Clear all reports
app.delete('/api/reports', async (req, res) => {
  try {
    db.prepare('DELETE FROM audit_reports').run();
    res.json({ success: true, message: 'All reports cleared from database' });
  } catch (error) {
    console.error('Error clearing reports:', error);
    res.status(500).json({ error: 'Failed to clear reports' });
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        device_name,
        cookie_count,
        domains,
        received_at
      FROM audit_reports 
      ORDER BY received_at DESC
    `);
    const rows = stmt.all();
    
    // Parse domains and calculate stats
    const devices = [...new Set(rows.map(r => r.device_name))];
    const totalCookies = rows.reduce((sum, r) => sum + (r.cookie_count || 0), 0);
    
    const allDomains = [];
    rows.forEach(r => {
      try {
        const domains = JSON.parse(r.domains || '[]');
        allDomains.push(...domains);
      } catch (e) {}
    });
    const uniqueDomains = [...new Set(allDomains)];
    
    const lastReport = rows[0] ? {
      ...rows[0],
      domains: JSON.parse(rows[0].domains || '[]')
    } : null;
    
    res.json({
      totalReports: rows.length,
      devices: devices.length,
      deviceList: devices,
      totalCookies,
      uniqueDomains: uniqueDomains.length,
      lastReport,
      storage: 'sqlite',
      dbPath: dbPath
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces

app.listen(PORT, HOST, () => {
  // Get local network IP
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  const localIPs = [];
  
  Object.keys(networkInterfaces).forEach(interfaceName => {
    networkInterfaces[interfaceName].forEach(iface => {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIPs.push(iface.address);
      }
    });
  });

  console.log(`
╔════════════════════════════════════════════════════╗
║   Cookie Auditor Dashboard Server                 ║
╚════════════════════════════════════════════════════╝

✓ Server running on port ${PORT}
✓ Storage: SQLite Database (persistent)
✓ Database: ${dbPath}

📍 Access Points:
   
   Local Machine:
   • http://localhost:${PORT}
   
   Network Access:${localIPs.length > 0 ? localIPs.map(ip => `
   • http://${ip}:${PORT}`).join('') : `
   • No network interface found`}

📱 For Chrome Extension Configuration:
   ${localIPs.length > 0 ? `Use: http://${localIPs[0]}:${PORT}/audit-report` : `Use: http://localhost:${PORT}/audit-report`}

Ready to receive audit reports from any device on your network...
  `);
});
