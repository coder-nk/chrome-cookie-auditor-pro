// Vercel Serverless Function for receiving audit reports with Supabase
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

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

  if (!supabase) {
    return res.status(500).json({ 
      error: 'Supabase not configured',
      message: 'Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables'
    });
  }

  try {
    const report = req.body;
    
    // Prepare report data
    const reportData = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      received_at: new Date().toISOString(),
      device_name: report.deviceName || 'Unknown',
      cookie_count: report.cookieCount || 0,
      domain_count: report.domainCount || 0,
      browser_info: report.browserInfo || {},
      timestamp: report.timestamp || new Date().toISOString(),
      domains: report.domains || [],
      // Store cookie values if provided (cookiesWithValues includes values, cookies is just names)
      cookies: report.cookiesWithValues || report.cookies || [],
      events: report.recentEvents || report.events || [],
      raw_data: report
    };

    // Save to Supabase
    const { data, error } = await supabase
      .from('audit_reports')
      .insert([reportData])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log(`✓ Report saved from ${reportData.device_name} - ${reportData.cookie_count} cookies`);

    res.status(200).json({ 
      success: true, 
      message: 'Audit report saved to database',
      reportId: data[0].id,
      storage: 'supabase'
    });

  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).json({ 
      error: 'Failed to save report',
      details: error.message
    });
  }
};
