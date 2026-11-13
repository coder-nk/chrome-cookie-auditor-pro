# Quick Configuration Reference

## TL;DR

- **Local Storage:** ALWAYS saves ALL cookie data (including values)
- **Email Reports:** YOU choose what gets sent

## Recommended Safe Configuration

In Options page, check ONLY these boxes:

```
✓ Enable audit reporting
✓ Include cookie names (without values)
✓ Include domain names
✓ Include recent events summary
✓ Include counts (cookies, domains)
✓ Include timestamps
✓ Include browser information

✗ Include cookie VALUES
✗ Include cookie paths
✗ Include cookie attributes
✗ Include detailed event information
```

**Result:** Email reports show activity without exposing sensitive cookie values.

## Configuration Presets

### Preset 1: Minimal (Activity Only)
```javascript
// In config.js emailReportConfig:
includeCookieValues: false,
includeCookieNames: false,
includeDomains: true,
includePaths: false,
includeCookieCount: true,
includeDomainCount: true,
includeTimestamps: true,
includeBrowserInfo: true,
includeEvents: false,
includeCookieAttributes: false
```

**Email shows:** Device had activity on 3 domains with 15 cookies total.

### Preset 2: Safe Audit (Recommended)
```javascript
// In config.js emailReportConfig:
includeCookieValues: false,        // ✓ Safe
includeCookieNames: true,          // ✓ Safe
includeDomains: true,              // ✓ Safe
includePaths: false,               // ✓ Safe
includeCookieCount: true,          // ✓ Safe
includeDomainCount: true,          // ✓ Safe
includeTimestamps: true,           // ✓ Safe
includeBrowserInfo: true,          // ✓ Safe
includeEvents: true,               // ✓ Safe
includeCookieAttributes: false     // ✓ Safe
```

**Email shows:** Activity summary with cookie names, domains, and event types. No values.

### Preset 3: Detailed (No Values)
```javascript
// In config.js emailReportConfig:
includeCookieValues: false,        // ✓ Safe
includeCookieNames: true,          // ✓ Safe
includeDomains: true,              // ✓ Safe
includePaths: true,                // ✓ Safe
includeCookieCount: true,          // ✓ Safe
includeDomainCount: true,          // ✓ Safe
includeTimestamps: true,           // ✓ Safe
includeBrowserInfo: true,          // ✓ Safe
includeEvents: true,               // ✓ Safe
includeEventDetails: true,         // ✓ Safe
includeCookieAttributes: true      // ✓ Safe
```

**Email shows:** Detailed metadata without exposing actual cookie values.

### Preset 4: Full Data ⚠️ (With Values)
```javascript
// In config.js emailReportConfig:
includeCookieValues: true,         // ⚠️ SENSITIVE
includeCookieNames: true,
includeDomains: true,
includePaths: true,
includeCookieCount: true,
includeDomainCount: true,
includeTimestamps: true,
includeBrowserInfo: true,
includeEvents: true,
includeEventDetails: true,
includeCookieAttributes: true
```

**Email shows:** Everything including sensitive cookie values. ⚠️ Use with caution!

## Email Subject Lines

| Configuration | Subject Line |
|--------------|--------------|
| Without values | `Cookie Audit: Home-Laptop - 11/13/2026, 10:30 AM` |
| With values ⚠️ | `⚠️ [SENSITIVE] Cookie Audit: Home-Laptop - 11/13/2026, 10:30 AM` |

## Quick Setup Steps

1. **Install audit server:**
   ```bash
   cd audit-server
   npm install
   # Edit server.js with Gmail credentials
   npm start
   ```

2. **Configure extension:**
   - Open Options
   - Enable audit reporting
   - Set device name (e.g., "My-Laptop")
   - Choose checkboxes (see presets above)
   - Save settings

3. **Test:**
   - Visit website
   - Click "Scan now"
   - Check email

## When to Use Each Preset

| Use Case | Preset | Why |
|----------|--------|-----|
| Multi-device monitoring | Minimal | Just need to know which devices are active |
| Security auditing | Safe Audit | Track activity without exposing credentials |
| Debugging cookie issues | Detailed (No Values) | Need metadata but not values |
| Test environment logging | Full Data ⚠️ | Need everything including test cookie values |

## Data Flow Diagram

```
Cookie Scan → ┬→ Local Storage (ALL data always)
              │
              └→ Email Report (configured data only)
```

## Security Checklist

Before enabling "Include cookie VALUES":

- [ ] Is this for test cookies only?
- [ ] Do I control the email infrastructure?
- [ ] Do I need values in email vs. local export?
- [ ] Have I considered email interception risks?
- [ ] Am I aware this includes authentication tokens?

If ANY answer is NO → Keep "Include cookie VALUES" unchecked!

## Common Configurations

### Home User (Personal Audit)
```
Device: Home-Laptop
✓ Cookie names
✓ Domains
✓ Events
✓ Counts
✗ Values
```

### Security Team (Multi-Device)
```
Device: Team-Member-1, Team-Member-2, etc.
✓ Cookie names
✓ Domains
✓ Events
✓ Counts
✓ Browser info
✗ Values
```

### Test Environment
```
Device: Test-Server-1
✓ Cookie names
✓ Domains
✓ Events
✓ Detailed events
✓ Attributes
✓ Paths
? Values (only if needed)
```

## Command Reference

### Start audit server:
```bash
cd audit-server
npm start
```

### Test without extension:
```bash
cd audit-server
node test-report.js
```

### Check what's configured:
1. Open extension Options
2. Look at checkboxes under "Email Report Configuration"

### Change configuration:
1. Open extension Options
2. Check/uncheck boxes
3. Click "Save settings"

## Files Reference

| File | Purpose |
|------|---------|
| `config.js` | Default configuration |
| `CONFIGURATION_GUIDE.md` | Detailed guide |
| `QUICK_CONFIG.md` | This file |
| `AUDIT_SETUP.md` | Initial setup |
| `options.html` | UI for configuration |
