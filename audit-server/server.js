// Cookie Auditor Dashboard Server with Supabase
// Run with: node server.js
// Access dashboard at: http://localhost:3000

const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

let supabase = null;

// Initialize Supabase if credentials are provided
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✓ Supabase connected');
} else {
  console.warn('⚠️  Supabase credentials not found. Using in-memory storage (data will be lost on restart)');
  console.warn('⚠️  Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables for persistent storage');
}

// Fallback in-memory storage if Supabase is not configured
const memoryReports = [];
const MAX_REPORTS = 1000;

// Endpoint to receive audit reports
app.post('/audit-report', async (req, res) => {
  try {
    const report = req.body;
    
    // Add metadata
    const reportData = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      received_at: new Date().toISOString(),
      device_name: report.deviceName || 'Unknown',
      cookie_count: report.cookieCount || 0,
      domain_count: report.domainCount || 0,
      browser_info: report.browserInfo || {},
      timestamp: report.timestamp || new Date().toISOString(),
      domains: report.domains || [],
      cookies: report.cookies || [],
      events: report.events || [],
      raw_data: report
    };

    // Store in Supabase or memory
    if (supabase) {
      const { data, error } = await supabase
        .from('audit_reports')
        .insert([reportData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log(`✓ Report saved to Supabase from ${reportData.device_name} - ${reportData.cookie_count} cookies`);
      
      res.json({ 
        success: true, 
        message: 'Audit report saved to database',
        reportId: data[0].id,
        storage: 'supabase'
      });
    } else {
      // Fallback to memory
      memoryReports.unshift(reportData);
      
      if (memoryReports.length > MAX_REPORTS) {
        memoryReports.length = MAX_REPORTS;
      }

      console.log(`✓ Report stored in memory from ${reportData.device_name} - ${reportData.cookie_count} cookies`);

      res.json({ 
        success: true, 
        message: 'Audit report received (in-memory storage)',
        reportId: reportData.id,
        storage: 'memory',
        warning: 'Data will be lost on server restart. Configure Supabase for persistence.'
      });
    }

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
    if (supabase) {
      const { data, error } = await supabase
        .from('audit_reports')
        .select('*')
        .order('received_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      res.json(data);
    } else {
      res.json(memoryReports);
    }
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get single report
app.get('/api/reports/:id', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('audit_reports')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Report not found' });
        }
        throw error;
      }

      res.json(data);
    } else {
      const report = memoryReports.find(r => r.id === req.params.id);
      if (report) {
        res.json(report);
      } else {
        res.status(404).json({ error: 'Report not found' });
      }
    }
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Delete report
app.delete('/api/reports/:id', async (req, res) => {
  try {
    if (supabase) {
      const { error } = await supabase
        .from('audit_reports')
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;

      res.json({ success: true });
    } else {
      const index = memoryReports.findIndex(r => r.id === req.params.id);
      if (index !== -1) {
        memoryReports.splice(index, 1);
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Report not found' });
      }
    }
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// Clear all reports
app.delete('/api/reports', async (req, res) => {
  try {
    if (supabase) {
      const { error } = await supabase
        .from('audit_reports')
        .delete()
        .neq('id', ''); // Delete all

      if (error) throw error;

      res.json({ success: true, message: 'All reports cleared from database' });
    } else {
      memoryReports.length = 0;
      res.json({ success: true, message: 'All reports cleared from memory' });
    }
  } catch (error) {
    console.error('Error clearing reports:', error);
    res.status(500).json({ error: 'Failed to clear reports' });
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    let reports = [];
    
    if (supabase) {
      const { data, error } = await supabase
        .from('audit_reports')
        .select('device_name, cookie_count, domains, received_at')
        .order('received_at', { ascending: false });

      if (error) throw error;
      reports = data;
    } else {
      reports = memoryReports;
    }

    const devices = [...new Set(reports.map(r => r.device_name))];
    const totalCookies = reports.reduce((sum, r) => sum + (r.cookie_count || 0), 0);
    const allDomains = reports.flatMap(r => r.domains || []);
    const domains = [...new Set(allDomains)];
    
    res.json({
      totalReports: reports.length,
      devices: devices.length,
      deviceList: devices,
      totalCookies,
      uniqueDomains: domains.length,
      lastReport: reports[0] || null,
      storage: supabase ? 'supabase' : 'memory'
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
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
✓ Storage: ${supabase ? 'Supabase (persistent)' : 'Memory (temporary)'}

${!supabase ? `
⚠️  Configure Supabase for persistent storage:
   1. Create account at https://supabase.com
   2. Create a new project
   3. Set environment variables:
      - SUPABASE_URL=your_project_url
      - SUPABASE_ANON_KEY=your_anon_key
` : ''}
Ready to receive audit reports...
  `);
});
