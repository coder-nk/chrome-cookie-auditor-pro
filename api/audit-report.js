// Vercel Serverless Function for receiving audit reports
// Note: In-memory storage won't persist. Consider using Vercel KV or a database.

let reports = [];
const MAX_REPORTS = 100;

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const report = req.body;
    
    // Add metadata
    report.id = Date.now() + Math.random().toString(36).substr(2, 9);
    report.receivedAt = new Date().toISOString();
    
    // Store report (WARNING: This is temporary in serverless environment)
    reports.unshift(report);
    
    if (reports.length > MAX_REPORTS) {
      reports.length = MAX_REPORTS;
    }

    console.log(`✓ Report received from ${report.deviceName || 'Unknown'} - ${report.cookieCount || 0} cookies`);

    res.status(200).json({ 
      success: true, 
      message: 'Audit report received (Note: Data may not persist in serverless environment)',
      reportId: report.id,
      warning: 'Consider using a database for persistent storage'
    });

  } catch (error) {
    console.error('Error receiving report:', error);
    res.status(500).json({ 
      error: 'Failed to process report' 
    });
  }
};
