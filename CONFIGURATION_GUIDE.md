# Configuration Guide: Local Storage vs Email Reports

This extension now has separate configurations for:
1. **What gets saved locally** (on your computer)
2. **What gets sent in email reports** (to snithish006@gmail.com)

## Quick Summary

### Local Storage (Always Enabled)
✅ **ALL cookie data is ALWAYS saved locally**, including:
- Cookie values (full data)
- Cookie metadata (secure, httpOnly, sameSite, etc.)
- Domains and paths
- Expiration dates
- Cookie change events

This data stays on your computer in Chrome's extension storage and is available for:
- Viewing in the extension popup
- Exporting to JSON files
- Your own security analysis

### Email Reports (Configurable)
🔧 **YOU choose what gets sent via email**, options include:
- Cookie names (without values) ✓ Recommended
- Cookie VALUES ⚠️ Not recommended - sensitive data
- Domain names ✓ Recommended
- Cookie paths
- Cookie attributes (secure, httpOnly, etc.)
- Event summaries ✓ Recommended
- Detailed event information
- Activity counts ✓ Recommended
- Timestamps ✓ Recommended
- Browser information ✓ Recommended

## Configuration in Options Page

### 1. Enable Audit Reporting
Check the "Enable audit reporting" checkbox to turn on email reports.

### 2. Set Device Identifier
Enter a name like:
- "Home-Laptop"
- "Office-PC"
- "Test-Server-1"

This helps you identify which device generated each report.

### 3. Email Report Configuration

#### Safe Configuration (Recommended):
```
✓ Include cookie names (without values)
✓ Include domain names
✗ Include cookie VALUES (keep unchecked)
✗ Include cookie paths
✗ Include cookie attributes
✓ Include recent events summary
✗ Include detailed event information
✓ Include counts (cookies, domains)
✓ Include timestamps
✓ Include browser information
```

**Email will contain:**
- Device: Home-Laptop
- 15 cookies found on 3 domains
- Cookie names: session_id, user_pref, analytics_token
- Domains: cdac.in, webmail.cdac.in
- Recent activity: 3 cookies added, 1 removed
- NO sensitive values

#### Full Data Configuration (Use with caution):
```
✓ Include cookie names (without values)
✓ Include domain names
✓ Include cookie VALUES ⚠️
✓ Include cookie paths
✓ Include cookie attributes
✓ Include recent events summary
✓ Include detailed event information
✓ Include counts (cookies, domains)
✓ Include timestamps
✓ Include browser information
```

**Email will contain:**
- Everything from safe configuration PLUS
- ⚠️ Actual cookie values (authentication tokens, session IDs, etc.)
- Cookie paths and attributes
- Detailed event causes and metadata

**⚠️ WARNING:** This includes sensitive authentication data!

## Configuration in code (config.js)

You can also edit `config.js` to set defaults:

### Local Storage Config
```javascript
localStorageConfig: {
  saveCookieValues: true,        // Always save values locally
  saveCookieMetadata: true,      // Always save attributes
  saveDomains: true,             // Always save domains
  savePaths: true,               // Always save paths
  saveExpirations: true,         // Always save expiration dates
  saveEvents: true               // Always save change events
}
```

**Note:** Local storage is always enabled for all fields. These settings are for future extensibility.

### Email Report Config
```javascript
emailReportConfig: {
  // What to include in email reports
  includeCookieValues: false,       // ❌ Don't send values (RECOMMENDED)
  includeCookieNames: true,         // ✅ Send names only
  includeDomains: true,             // ✅ Send domain names
  includePaths: false,              // ❌ Don't send paths
  includeCookieCount: true,         // ✅ Send counts
  includeDomainCount: true,         // ✅ Send domain counts
  includeTimestamps: true,          // ✅ Send timestamps
  includeBrowserInfo: true,         // ✅ Send browser version
  includeDeviceName: true,          // ✅ Send device identifier
  includeEvents: true,              // ✅ Send event summaries
  includeEventDetails: false,       // ❌ Don't send detailed events
  includeCookieAttributes: false,   // ❌ Don't send secure/httpOnly flags
  
  // Limits
  maxCookieNamesInReport: 50,       // Max 50 cookie names per email
  maxDomainsInReport: 20,           // Max 20 domains per email
  maxEventsInReport: 10             // Max 10 recent events per email
}
```

## Example Email Reports

### Safe Configuration Email:
```
Subject: Cookie Audit: Home-Laptop - 11/13/2026, 10:30 AM

Cookie Audit Report
==================

Device: Home-Laptop
Timestamp: 2026-11-13T10:30:45.123Z
Browser: Chrome 120.0

Activity Summary:
- Total Cookies: 15
- Domains Monitored: 3
- Scan Reason: manual
- Changes Detected: 2

Monitored Domains:
  - cdac.in
  - webmail.cdac.in
  - mail.cdac.in

Cookie Names (no values):
  - JSESSIONID
  - session_tracker
  - user_preferences
  - analytics_id
  - auth_token
  ... and 10 more

Recent Events:
  - set-or-updated: session_tracker on cdac.in (2026-11-13T10:28:15.000Z)
  - removed: old_cookie on cdac.in (2026-11-13T10:25:00.000Z)

Report Configuration:
  - Includes Cookie Values: NO ✓
  - Includes Cookie Attributes: NO
  - Includes Full Event Details: NO

Cookie values are NOT included - metadata only
---
Generated by Cookie Auditor Pro
```

### Full Data Configuration Email (with values):
```
Subject: ⚠️ [SENSITIVE] Cookie Audit: Home-Laptop - 11/13/2026, 10:30 AM

Cookie Audit Report
==================

Device: Home-Laptop
Timestamp: 2026-11-13T10:30:45.123Z
Browser: Chrome 120.0

Activity Summary:
- Total Cookies: 15
- Domains Monitored: 3
- Scan Reason: manual
- Changes Detected: 2

Monitored Domains:
  - cdac.in
  - webmail.cdac.in

Cookie Names (with values below):
  - session_tracker
  - user_preferences
  - auth_token

Cookie Paths:
  - /
  - /admin
  - /api

⚠️ COOKIE VALUES (SENSITIVE DATA):
  - session_tracker on cdac.in: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  - user_preferences on cdac.in: theme=dark&lang=en
  - auth_token on cdac.in: Bearer abc123xyz789...

Cookie Attributes:
  - session_tracker: secure=true, httpOnly=true, sameSite=Strict, session=false
  - user_preferences: secure=false, httpOnly=false, sameSite=Lax, session=true

Recent Events:
  - set-or-updated: session_tracker on cdac.in (/) [explicit] (2026-11-13T10:28:15.000Z)
  - removed: old_cookie on cdac.in (/) [expired] (2026-11-13T10:25:00.000Z)

Report Configuration:
  - Includes Cookie Values: YES ⚠️
  - Includes Cookie Attributes: YES
  - Includes Full Event Details: YES

WARNING: This report includes cookie values
---
Generated by Cookie Auditor Pro
```

## Security Recommendations

### For Security Auditing (Recommended):
1. ✅ Keep cookie values in local storage only
2. ✅ Send only cookie names and domains via email
3. ✅ Use device identifiers to track multiple machines
4. ✅ Review full data locally using the extension popup or JSON export
5. ✅ Keep email reports as lightweight activity summaries

### When to Include Cookie Values in Email:
- ⚠️ Only for test cookies you created (use the test prefix)
- ⚠️ Only when you control the email infrastructure end-to-end
- ⚠️ Only when you need immediate remote visibility
- ⚠️ Never for production authentication cookies

### Email Security:
- Emails marked with `⚠️ [SENSITIVE]` in subject when values are included
- Gmail encryption in transit (TLS)
- Consider using encrypted email if sending sensitive data
- Regularly purge old email reports

## How the Separation Works

```
┌─────────────────────────────────────┐
│   Extension Scans Cookies           │
│   (collects ALL data)               │
└──────────────┬──────────────────────┘
               │
               ├─────────────────┐
               │                 │
               ▼                 ▼
    ┌──────────────────┐   ┌─────────────────┐
    │ Local Storage    │   │ Email Report    │
    │ (ALL data)       │   │ (configured)    │
    │                  │   │                 │
    │ ✓ Cookie values  │   │ ? Cookie values │
    │ ✓ Metadata       │   │ ? Metadata      │
    │ ✓ Events         │   │ ? Events        │
    │ ✓ Everything     │   │ ? You choose    │
    └──────────────────┘   └─────────────────┘
           │                       │
           ▼                       ▼
    Stays on your PC      Sent to snithish006@gmail.com
```

## Testing Your Configuration

1. Set your desired configuration in Options
2. Click "Save settings"
3. Visit a test website (e.g., https://cdac.in)
4. Click extension icon → "Scan now"
5. Check your email to see what data was included
6. Adjust configuration if needed

## Changing Configuration

You can change email report settings at any time:
1. Open extension Options
2. Modify checkboxes under "Email Report Configuration"
3. Click "Save settings"
4. Next scan will use new settings

**Note:** Changing settings does NOT affect locally stored data (always kept) or previously sent emails.

## Questions?

**Q: Can I turn off local storage of cookie values?**
A: No, the extension always saves all data locally. That's its core purpose. You control what gets sent via email.

**Q: If I uncheck "Include cookie VALUES", are they still saved locally?**
A: YES! Local storage is separate. All data is always saved locally.

**Q: Can I export cookie values even if I don't send them via email?**
A: YES! Use the "Export JSON" button in the extension popup to get all local data.

**Q: What happens if I accidentally enable "Include cookie VALUES"?**
A: The extension will show a warning confirmation. If you proceed, emails will include sensitive data. You can change it back anytime.

**Q: How do I know if an email contains sensitive data?**
A: The subject line will start with `⚠️ [SENSITIVE]` and the email body will have a warning section.
