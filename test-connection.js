#!/usr/bin/env node

/**
 * Test script to verify Vercel + Supabase connection
 * Sends a sample audit report to check if data is stored correctly
 */

const https = require('https');

// Your Vercel endpoint
const VERCEL_URL = 'https://chrome-cookie-auditor-pro.vercel.app/audit-report';

// Sample audit report data
const testReport = {
  deviceName: 'Test Device (Connection Test)',
  timestamp: new Date().toISOString(),
  browserInfo: 'Chrome Test',
  cookieCount: 3,
  domainCount: 2,
  scanReason: 'connection-test',
  changesDetected: 0,
  
  // Cookie names
  cookieNames: ['test_cookie_1', 'test_cookie_2', 'session_test'],
  
  // Cookie values (if enabled)
  cookiesWithValues: [
    {
      name: 'test_cookie_1',
      value: 'test_value_abc123',
      domain: '.example.com'
    },
    {
      name: 'test_cookie_2',
      value: 'test_value_xyz789',
      domain: '.test-domain.com'
    },
    {
      name: 'session_test',
      value: 'session_token_test',
      domain: '.cdac.in'
    }
  ],
  
  // Domains
  domains: ['example.com', 'test-domain.com'],
  
  // Recent events
  recentEvents: [
    {
      type: 'set-or-updated',
      cookieName: 'test_cookie_1',
      domain: 'example.com',
      timestamp: new Date().toISOString()
    }
  ],
  
  reportConfig: {
    includesValues: true,
    includesAttributes: true,
    includesFullEventDetails: false
  },
  
  note: 'This is a test report to verify Vercel-Supabase connection'
};

console.log('═══════════════════════════════════════════════════════');
console.log('  Cookie Auditor - Connection Test');
console.log('═══════════════════════════════════════════════════════');
console.log('');
console.log('Testing connection to:', VERCEL_URL);
console.log('');
console.log('Sending test report with:');
console.log('  - Device: Test Device');
console.log('  - Cookies: 3');
console.log('  - Domains: 2');
console.log('');
console.log('Please wait...');
console.log('');

// Parse URL
const url = new URL(VERCEL_URL);
const postData = JSON.stringify(testReport);

const options = {
  hostname: url.hostname,
  port: 443,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('───────────────────────────────────────────────────────');
    console.log('Response Status:', res.statusCode);
    console.log('───────────────────────────────────────────────────────');
    
    try {
      const response = JSON.parse(data);
      console.log('Response Data:');
      console.log(JSON.stringify(response, null, 2));
      console.log('');
      
      if (res.statusCode === 200 && response.success) {
        console.log('✅ SUCCESS! Connection test passed!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Go to your Supabase dashboard:');
        console.log('   https://onxaphgsqodiqctawlzm.supabase.co');
        console.log('');
        console.log('2. Navigate to: Table Editor → audit_reports');
        console.log('');
        console.log('3. You should see a new row with:');
        console.log('   - device_name: "Test Device (Connection Test)"');
        console.log('   - cookie_count: 3');
        console.log('   - Click the row to see full cookie values!');
        console.log('');
        console.log('Report ID:', response.reportId);
        if (response.storage) {
          console.log('Storage Type:', response.storage);
        }
      } else {
        console.log('⚠️  Warning: Request completed but may have issues');
        console.log('Check the response above for details');
      }
    } catch (e) {
      console.log('Raw Response:', data);
    }
    
    console.log('═══════════════════════════════════════════════════════');
  });
});

req.on('error', (error) => {
  console.error('❌ ERROR:', error.message);
  console.log('');
  console.log('Possible issues:');
  console.log('1. Vercel deployment not ready yet');
  console.log('2. Environment variables not set in Vercel');
  console.log('3. Network connection issue');
  console.log('4. Supabase table not created yet');
  console.log('');
  console.log('Try:');
  console.log('- Check Vercel deployment status');
  console.log('- Verify environment variables are set');
  console.log('- Run the SQL to create the audit_reports table');
  console.log('═══════════════════════════════════════════════════════');
});

req.write(postData);
req.end();
