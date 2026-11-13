const $ = id => document.getElementById(id);
const KEY = "cap_settings";
function lines(value) { return value.split(/\r?\n/).map(x => x.trim()).filter(Boolean); }
function show(text, bad = false) { $("message").textContent = text; $("message").className = bad ? "bad" : "ok"; }
async function load() {
  const data = await chrome.storage.local.get(KEY);
  const s = data[KEY] || AUDIT_DEFAULTS;
  $("domains").value = (s.domains || AUDIT_DEFAULTS.domains).join("\n");
  $("prefix").value = s.testCookiePrefix ?? AUDIT_DEFAULTS.testCookiePrefix;
  $("excluded").value = (s.excludedCookieNames || AUDIT_DEFAULTS.excludedCookieNames).join("\n");
  
  // Audit reporting settings
  $("enableReporting").checked = Boolean(s.enableAuditReporting);
  $("deviceName").value = s.deviceName || AUDIT_DEFAULTS.deviceName || "";
  $("serverUrl").value = s.auditServerUrl || AUDIT_DEFAULTS.auditServerUrl;
  
  // Email report configuration
  const emailConfig = s.emailReportConfig || AUDIT_DEFAULTS.emailReportConfig;
  $("emailIncludeValues").checked = Boolean(emailConfig.includeCookieValues);
  $("emailIncludeNames").checked = emailConfig.includeCookieNames !== false;
  $("emailIncludeDomains").checked = emailConfig.includeDomains !== false;
  $("emailIncludePaths").checked = Boolean(emailConfig.includePaths);
  $("emailIncludeAttributes").checked = Boolean(emailConfig.includeCookieAttributes);
  $("emailIncludeEvents").checked = emailConfig.includeEvents !== false;
  $("emailIncludeEventDetails").checked = Boolean(emailConfig.includeEventDetails);
  $("emailIncludeCounts").checked = emailConfig.includeCookieCount !== false;
  $("emailIncludeTimestamps").checked = emailConfig.includeTimestamps !== false;
  $("emailIncludeBrowser").checked = emailConfig.includeBrowserInfo !== false;
}
$("save").addEventListener("click", async () => {
  const domains = lines($("domains").value).map(x => x.toLowerCase().replace(/^\.+|\.+$/g, ""));
  const prefix = $("prefix").value.trim();
  const excludedCookieNames = lines($("excluded").value);
  
  // Audit reporting values
  const enableAuditReporting = $("enableReporting").checked;
  let deviceName = $("deviceName").value.trim();
  const auditServerUrl = $("serverUrl").value.trim();
  
  // Auto-generate device name if empty and reporting is enabled
  if (enableAuditReporting && !deviceName) {
    // Generate a unique device name based on browser ID
    const browserId = await chrome.storage.local.get('_browserId');
    if (!browserId._browserId) {
      const newId = 'Device-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
      await chrome.storage.local.set({ '_browserId': newId });
      deviceName = newId;
    } else {
      deviceName = browserId._browserId;
    }
    // Update the UI with the generated name
    $("deviceName").value = deviceName;
  }
  
  // Email report configuration
  const emailReportConfig = {
    includeCookieValues: $("emailIncludeValues").checked,
    includeCookieNames: $("emailIncludeNames").checked,
    includeDomains: $("emailIncludeDomains").checked,
    includePaths: $("emailIncludePaths").checked,
    includeCookieAttributes: $("emailIncludeAttributes").checked,
    includeEvents: $("emailIncludeEvents").checked,
    includeEventDetails: $("emailIncludeEventDetails").checked,
    includeCookieCount: $("emailIncludeCounts").checked,
    includeDomainCount: $("emailIncludeCounts").checked,
    includeTimestamps: $("emailIncludeTimestamps").checked,
    includeBrowserInfo: $("emailIncludeBrowser").checked,
    includeDeviceName: true, // Always include device name
    maxCookieNamesInReport: 50,
    maxDomainsInReport: 20,
    maxEventsInReport: 10
  };
  
  if (!domains.length || domains.some(d => !/^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/.test(d))) {
    show("Enter one or more valid base domains, without https:// or paths.", true); return;
  }
  // Allow empty prefix - it's optional
  
  // Device name is now auto-generated if empty, so this check is removed
  
  // Warning if including cookie values
  if (enableAuditReporting && emailReportConfig.includeCookieValues) {
    if (!confirm("⚠️ WARNING: You are about to enable sending cookie VALUES via email. This includes sensitive authentication data.\n\nAre you sure you want to continue?")) {
      return;
    }
  }
  
  await chrome.storage.local.set({ [KEY]: { 
    domains, 
    testCookiePrefix: prefix, 
    excludedCookieNames,
    enableAuditReporting,
    deviceName,
    auditServerUrl,
    emailReportConfig,
    // Local storage config (always save everything locally)
    localStorageConfig: {
      saveCookieValues: true,
      saveCookieMetadata: true,
      saveDomains: true,
      savePaths: true,
      saveExpirations: true,
      saveEvents: true
    }
  }});
  
  const valueWarning = emailReportConfig.includeCookieValues ? " ⚠️ Cookie values WILL be sent via email!" : "";
  show("Settings saved. The background scan will refresh automatically." + valueWarning);
});
$("defaults").addEventListener("click", async () => {
  await chrome.storage.local.set({ [KEY]: {
    domains: [...AUDIT_DEFAULTS.domains],
    testCookiePrefix: AUDIT_DEFAULTS.testCookiePrefix,
    excludedCookieNames: [...AUDIT_DEFAULTS.excludedCookieNames],
    enableAuditReporting: AUDIT_DEFAULTS.enableAuditReporting || false,
    deviceName: AUDIT_DEFAULTS.deviceName || "",
    auditServerUrl: AUDIT_DEFAULTS.auditServerUrl || "http://localhost:3000/audit-report",
    emailReportConfig: {...AUDIT_DEFAULTS.emailReportConfig},
    localStorageConfig: {...AUDIT_DEFAULTS.localStorageConfig}
  }});
  await load(); show("Default settings restored.");
});
load().catch(e => show(e.message || String(e), true));