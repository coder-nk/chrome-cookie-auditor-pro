// Default settings. Runtime settings can be changed from Options.
// Keep this list limited to domains you own or are explicitly authorized to audit.
globalThis.AUDIT_DEFAULTS = Object.freeze({
  domains: ["cdac.in"],
  testCookiePrefix: "",
  excludedCookieNames: [
    "",
  ],
  maxEvents: 2000,
  
  // Audit reporting settings
  auditServerUrl: "http://10.184.40.106:3001/audit-report",
  enableAuditReporting: true,
  deviceName: "",  // Set your device name in Options
  
  // Local storage configuration - what gets saved locally
  localStorageConfig: {
    saveCookieValues: true,        // Save all cookie values locally
    saveCookieMetadata: true,      // Save cookie attributes (secure, httpOnly, etc.)
    saveDomains: true,             // Save domain information
    savePaths: true,               // Save path information
    saveExpirations: true,         // Save expiration dates
    saveEvents: true               // Save cookie change events
  },
  
  // Email report configuration - what gets sent to email
  emailReportConfig: {
    includeCookieValues: true,            // ✅ Send cookie values
    includeCookieNames: true,             // ✅ Send cookie names
    includeDomains: true,                 // ✅ Send domain names
    includePaths: false,                  // ❌ Don't send paths
    includeCookieCount: true,             // ✅ Send counts
    includeDomainCount: true,             // ✅ Send domain counts
    includeTimestamps: true,              // ✅ Send timestamps
    includeBrowserInfo: true,             // ✅ Send browser version
    includeDeviceName: true,              // ✅ Send device identifier
    includeEvents: true,                  // ✅ Send event summaries
    includeEventDetails: false,           // ❌ Don't send detailed event info
    includeCookieAttributes: true,        // ✅ Send secure/httpOnly flags
    maxCookieNamesInReport: 50,           // Limit cookie names in email
    maxDomainsInReport: 20,               // Limit domains in email
    maxEventsInReport: 10                 // Limit events in email
  }
});
