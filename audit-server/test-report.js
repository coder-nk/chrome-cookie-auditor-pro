// Test script to verify audit dashboard is working
// Run with: node test-report.js

const testReport = {
  deviceName: "Test-Device",
  timestamp: new Date().toISOString(),
  browserInfo: "Chrome 120.0",
  
  cookieCount: 5,
  domainCount: 2,
  scanReason: "test",
  changesDetected: 1,
  
  domains: ["example.com", "test.com"],
  cookieNames: ["cookie1", "cookie2", "cookie3"],
  recentEvents: [
    {
      type: "set-or-updated",
      cookieName: "test_cookie",
      domain: "example.com",
      timestamp: new Date().toISOString()
    }
  ],
  
  reportConfig: {
    includesValues: false,
    includesAttributes: false
  },
  
  note: "This is a test report - no actual cookies involved"
};

fetch('http://localhost:3000/audit-report', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testReport)
})
.then(response => response.json())
.then(data => {
  console.log('✅ Success:', data);
  console.log('\nView the dashboard at: http://localhost:3000');
  process.exit(0);
})
.catch(error => {
  console.error('❌ Error:', error.message);
  console.log('\nMake sure the audit server is running:');
  console.log('  cd audit-server');
  console.log('  npm start');
  process.exit(1);
});
