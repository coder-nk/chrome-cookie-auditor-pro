
importScripts("../config.js");

const KEYS = {
  settings: "cap_settings",
  inventory: "cap_inventory",
  events: "cap_events",
  testCookies: "cap_test_cookies",
  meta: "cap_meta"
};

const DEFAULTS = globalThis.AUDIT_DEFAULTS || {
  domains: [],
  testCookiePrefix: "",
  excludedCookieNames: [],
  maxEvents: 2000,
  auditServerUrl: "http://localhost:3000/audit-report",
  enableAuditReporting: false,
  deviceName: "",
  localStorageConfig: {
    saveCookieValues: true,
    saveCookieMetadata: true,
    saveDomains: true,
    savePaths: true,
    saveExpirations: true,
    saveEvents: true
  },
  emailReportConfig: {
    includeCookieValues: false,
    includeCookieNames: true,
    includeDomains: true,
    includePaths: false,
    includeCookieCount: true,
    includeDomainCount: true,
    includeTimestamps: true,
    includeBrowserInfo: true,
    includeDeviceName: true,
    includeEvents: true,
    includeEventDetails: false,
    includeCookieAttributes: false,
    maxCookieNamesInReport: 50,
    maxDomainsInReport: 20,
    maxEventsInReport: 10
  }
};

let queue = Promise.resolve();

// --------------------------------------------------
// DOMAIN HELPERS
// Empty domains array means ALL websites.
// --------------------------------------------------

function cleanDomain(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^\.+|\.+$/g, "");
}

function domainMatches(cookieDomain, allowedDomain) {
  const c = cleanDomain(cookieDomain);
  const a = cleanDomain(allowedDomain);

  return Boolean(a && (c === a || c.endsWith("." + a)));
}

function isAllowedDomain(cookie, settings) {
  if (!settings.domains.length) return true;

  return settings.domains.some(domain =>
    domainMatches(cookie?.domain, domain)
  );
}

// --------------------------------------------------
// SETTINGS
// --------------------------------------------------

async function getSettings() {
  const data = await chrome.storage.local.get(KEYS.settings);
  const saved = data[KEYS.settings] || {};

  return {
    // Empty array = all accessible websites
    domains: Array.isArray(saved.domains)
      ? saved.domains.map(cleanDomain).filter(Boolean)
      : [...DEFAULTS.domains],

    testCookiePrefix:
      typeof saved.testCookiePrefix === "string"
        ? saved.testCookiePrefix
        : DEFAULTS.testCookiePrefix,

    excludedCookieNames: Array.isArray(saved.excludedCookieNames)
      ? saved.excludedCookieNames
          .map(x => String(x).trim().toLowerCase())
          .filter(Boolean)
      : [...DEFAULTS.excludedCookieNames],

    maxEvents: Number.isInteger(saved.maxEvents)
      ? Math.min(10000, Math.max(100, saved.maxEvents))
      : DEFAULTS.maxEvents,
    
    // Audit reporting settings
    auditServerUrl: saved.auditServerUrl || DEFAULTS.auditServerUrl,
    enableAuditReporting: Boolean(saved.enableAuditReporting),
    deviceName: saved.deviceName || DEFAULTS.deviceName || "Unknown Device",
    
    // Local storage configuration
    localStorageConfig: {
      ...DEFAULTS.localStorageConfig,
      ...(saved.localStorageConfig || {})
    },
    
    // Email report configuration
    emailReportConfig: {
      ...DEFAULTS.emailReportConfig,
      ...(saved.emailReportConfig || {})
    }
  };
}

// --------------------------------------------------
// COOKIE FILTERING
// --------------------------------------------------

function isExcluded(cookie, settings) {
  return settings.excludedCookieNames.includes(
    String(cookie?.name || "").toLowerCase()
  );
}

// --------------------------------------------------
// COOKIE IDENTIFICATION
// --------------------------------------------------

function cookieId(cookie) {
  return [
    cookie.storeId || "0",
    cookie.domain || "",
    cookie.path || "/",
    cookie.name || "",
    cookie.partitionKey
      ? JSON.stringify(cookie.partitionKey)
      : ""
  ].join("|");
}

// --------------------------------------------------
// COOKIE METADATA
// --------------------------------------------------

function metadata(cookie) {
  return {
    name: cookie.name,
    domain: cookie.domain,
    path: cookie.path,

    secure: Boolean(cookie.secure),
    httpOnly: Boolean(cookie.httpOnly),

    sameSite: cookie.sameSite || "unspecified",

    session: Boolean(cookie.session),
    hostOnly: Boolean(cookie.hostOnly),

    expirationDate: cookie.expirationDate ?? null,

    storeId: cookie.storeId || "0",

    partitioned: Boolean(cookie.partitionKey),
    partitionKey: cookie.partitionKey ?? null
  };
}

// --------------------------------------------------
// COOKIE RECORD
// Values are retained locally for authorized audits.
// --------------------------------------------------

function cookieRecord(cookie) {
  return {
    ...metadata(cookie),
    value: cookie.value
  };
}

// --------------------------------------------------
// STORAGE HELPERS
// --------------------------------------------------

async function setMeta(patch) {
  const data = await chrome.storage.local.get(KEYS.meta);

  await chrome.storage.local.set({
    [KEYS.meta]: {
      ...(data[KEYS.meta] || {}),
      ...patch
    }
  });
}

async function appendEvent(event, settings) {
  const data = await chrome.storage.local.get(KEYS.events);

  const events = Array.isArray(data[KEYS.events])
    ? data[KEYS.events]
    : [];

  events.unshift({
    at: new Date().toISOString(),
    ...event
  });

  events.length = Math.min(events.length, settings.maxEvents);

  await chrome.storage.local.set({
    [KEYS.events]: events
  });
}

async function readState() {
  return chrome.storage.local.get([
    KEYS.inventory,
    KEYS.events,
    KEYS.testCookies,
    KEYS.meta
  ]);
}

// --------------------------------------------------
// CHANGE COUNTER
// --------------------------------------------------

function countChanges(current, previous) {
  const keys = new Set([
    ...Object.keys(current),
    ...Object.keys(previous)
  ]);

  let changed = 0;

  for (const key of keys) {
    if (
      JSON.stringify(current[key]) !==
      JSON.stringify(previous[key])
    ) {
      changed++;
    }
  }

  return changed;
}

// --------------------------------------------------
// AUDIT REPORTING (NON-SENSITIVE DATA ONLY)
// --------------------------------------------------

async function sendAuditReport(scanResult, settings, inventory, events) {
  if (!settings.enableAuditReporting || !settings.auditServerUrl) {
    return;
  }

  try {
    const emailConfig = settings.emailReportConfig;
    const report = {};
    
    // Device identification
    if (emailConfig.includeDeviceName) {
      report.deviceName = settings.deviceName;
    }
    
    // Timestamps
    if (emailConfig.includeTimestamps) {
      report.timestamp = new Date().toISOString();
    }
    
    // Browser info
    if (emailConfig.includeBrowserInfo) {
      report.browserInfo = `Chrome ${navigator.userAgent.split('Chrome/')[1]?.split(' ')[0] || 'Unknown'}`;
    }
    
    // Activity counts
    if (emailConfig.includeCookieCount) {
      report.cookieCount = scanResult.inventoryCount;
    }
    
    if (emailConfig.includeDomainCount) {
      report.domainCount = scanResult.domainCount;
    }
    
    report.scanReason = scanResult.reason || 'unknown';
    report.changesDetected = scanResult.inventoryChanged || 0;
    
    // Cookie data based on configuration
    const inventoryArray = Object.values(inventory);
    
    if (emailConfig.includeCookieNames) {
      const cookieNames = inventoryArray.map(c => c.name);
      report.cookieNames = cookieNames.slice(0, emailConfig.maxCookieNamesInReport || 50);
      
      if (cookieNames.length > report.cookieNames.length) {
        report.cookieNamesTruncated = true;
        report.totalCookieNames = cookieNames.length;
      }
    }
    
    if (emailConfig.includeCookieValues) {
      // Only include if explicitly enabled
      const cookiesWithValues = inventoryArray.map(c => ({
        name: c.name,
        value: c.value,
        domain: c.domain
      }));
      report.cookiesWithValues = cookiesWithValues.slice(0, emailConfig.maxCookieNamesInReport || 50);
    }
    
    if (emailConfig.includeDomains) {
      const domains = [...new Set(inventoryArray.map(c => c.domain))];
      report.domains = settings.domains.length > 0 
        ? settings.domains 
        : domains.slice(0, emailConfig.maxDomainsInReport || 20);
      
      if (domains.length > (emailConfig.maxDomainsInReport || 20)) {
        report.domainsTruncated = true;
        report.totalDomains = domains.length;
      }
    }
    
    if (emailConfig.includePaths) {
      const paths = [...new Set(inventoryArray.map(c => c.path))];
      report.paths = paths.slice(0, 20);
    }
    
    if (emailConfig.includeCookieAttributes) {
      // Include cookie metadata like secure, httpOnly, etc.
      report.cookieAttributes = inventoryArray.slice(0, 20).map(c => ({
        name: c.name,
        secure: c.secure,
        httpOnly: c.httpOnly,
        sameSite: c.sameSite,
        session: c.session
      }));
    }
    
    // Events
    if (emailConfig.includeEvents && events.length > 0) {
      const maxEvents = emailConfig.maxEventsInReport || 10;
      const recentEvents = events.slice(0, maxEvents);
      
      if (emailConfig.includeEventDetails) {
        report.recentEvents = recentEvents.map(e => ({
          type: e.type,
          cookieName: e.cookie?.name || 'unknown',
          domain: e.cookie?.domain || 'unknown',
          path: e.cookie?.path,
          timestamp: e.at,
          cause: e.cause
        }));
      } else {
        // Basic event info only
        report.recentEvents = recentEvents.map(e => ({
          type: e.type,
          cookieName: e.cookie?.name || 'unknown',
          domain: e.cookie?.domain || 'unknown',
          timestamp: e.at
        }));
      }
      
      if (events.length > maxEvents) {
        report.eventsTruncated = true;
        report.totalEvents = events.length;
      }
    }
    
    // Add configuration summary to report
    report.reportConfig = {
      includesValues: emailConfig.includeCookieValues,
      includesAttributes: emailConfig.includeCookieAttributes,
      includesFullEventDetails: emailConfig.includeEventDetails
    };
    
    report.note = emailConfig.includeCookieValues 
      ? 'WARNING: This report includes cookie values'
      : 'Cookie values are NOT included - metadata only';

    // Send to audit server
    const response = await fetch(settings.auditServerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(report)
    });

    if (!response.ok) {
      throw new Error(`Audit report failed: ${response.status}`);
    }

    console.log('Audit report sent successfully');

  } catch (error) {
    console.error('Failed to send audit report:', error);
    // Don't fail the main scan if reporting fails
  }
}

// --------------------------------------------------
// GLOBAL COOKIE SCAN
// --------------------------------------------------

async function scan(reason = "manual") {
  const settings = await getSettings();

  const inventory = {};
  const testCookies = {};
  const perDomain = {};
  const errors = [];

  try {
    // Get all cookies accessible to this extension.
    const cookies = await chrome.cookies.getAll({});

    for (const cookie of cookies) {
      try {
        if (!isAllowedDomain(cookie, settings)) continue;
        if (isExcluded(cookie, settings)) continue;

        const id = cookieId(cookie);
        const record = cookieRecord(cookie);

        // Store metadata AND cookie value.
        inventory[id] = record;

        // Maintain the existing storage key for compatibility
        // with the existing popup/options code.
        testCookies[id] = record;

        const domain = cleanDomain(cookie.domain) || "unknown";

        if (!perDomain[domain]) {
          perDomain[domain] = {
            count: 0,
            status: "ok"
          };
        }

        perDomain[domain].count++;

      } catch (error) {
        errors.push(
          `${cookie?.domain || "unknown"}: ${error?.message || String(error)}`
        );
      }
    }

  } catch (error) {
    errors.push(error?.message || String(error));
  }

  // Read previous inventory.
  const previous = await chrome.storage.local.get([
    KEYS.inventory,
    KEYS.testCookies,
    KEYS.events
  ]);

  const oldInventory = previous[KEYS.inventory] || {};
  const oldTests = previous[KEYS.testCookies] || {};

  // Remove excluded or out-of-scope entries from historical events.
  const oldEvents = Array.isArray(previous[KEYS.events])
    ? previous[KEYS.events]
    : [];

  const safeEvents = oldEvents.filter(item => {
    const cookie = item.cookie;

    if (!cookie) return false;

    const excluded = settings.excludedCookieNames.includes(
      String(cookie.name || "").toLowerCase()
    );

    return !excluded && isAllowedDomain(cookie, settings);
  }).slice(0, settings.maxEvents);

  if (safeEvents.length !== oldEvents.length) {
    await chrome.storage.local.set({
      [KEYS.events]: safeEvents
    });
  }

  const inventoryChanged = countChanges(inventory, oldInventory);
  const testChanged = countChanges(testCookies, oldTests);

  // Save all cookie values locally.
  await chrome.storage.local.set({
    [KEYS.inventory]: inventory,
    [KEYS.testCookies]: testCookies
  });

  await setMeta({
    lastScanAt: new Date().toISOString(),
    lastScanReason: reason,

    inventoryCount: Object.keys(inventory).length,
    testCookieCount: Object.keys(testCookies).length,

    excludedNames: settings.excludedCookieNames.length,

    // Empty means all accessible websites.
    domains: settings.domains,

    allWebsites: settings.domains.length === 0,

    perDomain,

    inventoryChanged,
    testChanged,

    lastError: errors.length
      ? errors.join(" | ")
      : null
  });

  const scanResult = {
    ok: errors.length === 0,
    inventoryCount: Object.keys(inventory).length,
    testCookieCount: Object.keys(testCookies).length,
    domainCount: Object.keys(perDomain).length,
    errors,
    reason,
    inventoryChanged,
    testChanged
  };

  // Send audit report (non-sensitive data only)
  await sendAuditReport(scanResult, settings, inventory, safeEvents);

  return scanResult;
}

// --------------------------------------------------
// QUEUE
// --------------------------------------------------

function enqueue(task) {
  queue = queue.then(task, task);
  return queue;
}

// --------------------------------------------------
// REAL-TIME COOKIE MONITORING
// --------------------------------------------------

chrome.cookies.onChanged.addListener(info => {
  enqueue(async () => {
    const cookie = info.cookie;

    if (!cookie) return;

    const settings = await getSettings();

    if (!isAllowedDomain(cookie, settings)) return;
    if (isExcluded(cookie, settings)) return;

    const id = cookieId(cookie);

    const event = {
      type: info.removed
        ? "removed"
        : "set-or-updated",

      cause: info.cause || "unknown",

      // Event history stores metadata, not credential values.
      cookie: metadata(cookie)
    };

    await appendEvent(event, settings);

    const data = await chrome.storage.local.get([
      KEYS.inventory,
      KEYS.testCookies
    ]);

    const inventory = data[KEYS.inventory] || {};
    const tests = data[KEYS.testCookies] || {};

    if (info.removed) {
      delete inventory[id];
      delete tests[id];

    } else {
      const record = cookieRecord(cookie);

      // Capture every non-excluded cookie value.
      inventory[id] = record;
      tests[id] = record;
    }

    await chrome.storage.local.set({
      [KEYS.inventory]: inventory,
      [KEYS.testCookies]: tests
    });

    await setMeta({
      lastCookieEventAt: new Date().toISOString(),

      inventoryCount: Object.keys(inventory).length,
      testCookieCount: Object.keys(tests).length
    });

  }).catch(error => {
    setMeta({
      lastError: error?.message || String(error)
    });
  });
});

// --------------------------------------------------
// MESSAGE HANDLERS
// --------------------------------------------------

chrome.runtime.onMessage.addListener(
  (message, _sender, sendResponse) => {

    // Manual scan
    if (message?.type === "CAP_SCAN") {
      enqueue(() => scan("manual"))
        .then(sendResponse)
        .catch(error => {
          sendResponse({
            error: error?.message || String(error)
          });
        });

      return true;
    }

    // Clear inventory
    if (message?.type === "CAP_CLEAR") {
      enqueue(async () => {
        await chrome.storage.local.remove([
          KEYS.inventory,
          KEYS.events,
          KEYS.testCookies
        ]);

        await setMeta({
          inventoryCount: 0,
          testCookieCount: 0,
          clearedAt: new Date().toISOString()
        });

        return {
          ok: true
        };
      })
        .then(sendResponse)
        .catch(error => {
          sendResponse({
            error: error?.message || String(error)
          });
        });

      return true;
    }

    // Get current statistics
    if (message?.type === "CAP_GET_STATE") {
      enqueue(async () => {
        const data = await readState();

        return {
          inventory: data[KEYS.inventory] || {},
          events: data[KEYS.events] || [],
          testCookies: data[KEYS.testCookies] || {},
          meta: data[KEYS.meta] || {}
        };
      })
        .then(sendResponse)
        .catch(error => {
          sendResponse({
            error: error?.message || String(error)
          });
        });

      return true;
    }
  }
);

// --------------------------------------------------
// SETTINGS UPDATE
// --------------------------------------------------

chrome.storage.onChanged.addListener((changes, area) => {
  if (
    area === "local" &&
    changes[KEYS.settings]
  ) {
    enqueue(() => scan("settings-updated"))
      .catch(error => {
        setMeta({
          lastError: error?.message || String(error)
        });
      });
  }
});

// --------------------------------------------------
// EXTENSION LIFECYCLE
// --------------------------------------------------

chrome.runtime.onInstalled.addListener(() => {
  enqueue(() => scan("installed-or-updated"))
    .catch(error => {
      setMeta({
        lastError: error?.message || String(error)
      });
    });
});

chrome.runtime.onStartup.addListener(() => {
  enqueue(() => scan("browser-startup"))
    .catch(error => {
      setMeta({
        lastError: error?.message || String(error)
      });
    });
});

// Initial service-worker scan
enqueue(() => scan("worker-started"))
  .catch(error => {
    setMeta({
      lastError: error?.message || String(error)
    });
  });

