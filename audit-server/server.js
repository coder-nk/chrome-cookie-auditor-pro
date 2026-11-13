// Cookie Auditor Dashboard Server
// Run with: node server.js
// Access dashboard at: http://localhost:3000

const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store reports in memory (for demo - use database in production)
const reports = [];
const MAX_REPORTS = 1000;

// Endpoint to receive audit reports
app.post('/audit-report', async (req, res) => {
  try {
    const report = req.body;
    
    // Add metadata
    report.id = Date.now() + Math.random().toString(36).substr(2, 9);
    report.receivedAt = new Date().toISOString();
    
    // Store report
    reports.unshift(report);
    
    // Keep only last MAX_REPORTS
    if (reports.length > MAX_REPORTS) {
      reports.length = MAX_REPORTS;
    }

    console.log(`✓ Report received from ${report.deviceName || 'Unknown'} - ${report.cookieCount || 0} cookies`);

    res.json({ 
      success: true, 
      message: 'Audit report received',
      reportId: report.id
    });

  } catch (error) {
    console.error('Error receiving report:', error);
    res.status(500).json({ 
      error: 'Failed to process report' 
    });
  }
});

// Get all reports
app.get('/api/reports', (req, res) => {
  res.json(reports);
});

// Get single report
app.get('/api/reports/:id', (req, res) => {
  const report = reports.find(r => r.id === req.params.id);
  if (report) {
    res.json(report);
  } else {
    res.status(404).json({ error: 'Report not found' });
  }
});

// Delete report
app.delete('/api/reports/:id', (req, res) => {
  const index = reports.findIndex(r => r.id === req.params.id);
  if (index !== -1) {
    reports.splice(index, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Report not found' });
  }
});

// Clear all reports
app.delete('/api/reports', (req, res) => {
  reports.length = 0;
  res.json({ success: true, message: 'All reports cleared' });
});

// Get statistics
app.get('/api/stats', (req, res) => {
  const devices = [...new Set(reports.map(r => r.deviceName))];
  const totalCookies = reports.reduce((sum, r) => sum + (r.cookieCount || 0), 0);
  const domains = [...new Set(reports.flatMap(r => r.domains || []))];
  
  res.json({
    totalReports: reports.length,
    devices: devices.length,
    deviceList: devices,
    totalCookies,
    uniqueDomains: domains.length,
    lastReport: reports[0] || null
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║   Cookie Auditor Dashboard Server                 ║
╚════════════════════════════════════════════════════╝

✓ Server running on port ${PORT}
✓ Dashboard: http://localhost:${PORT}
✓ API endpoint: http://localhost:${PORT}/audit-report

Ready to receive audit reports...
  `);
});
