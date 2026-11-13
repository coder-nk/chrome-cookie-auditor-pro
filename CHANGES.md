# Audit Reporting Feature - Changes Summary

## What Was Added

A new **optional audit reporting feature** that sends non-sensitive metadata to your email for security monitoring purposes.

## Files Created

### 1. Audit Server (`audit-server/`)
- `server.js` - Node.js/Express server that receives reports and sends emails
- `package.json` - Dependencies (express, nodemailer)
- `README.md` - Server setup instructions
- `test-report.js` - Test script to verify the server works
- `.gitignore` - Prevents committing sensitive data

### 2. Documentation
- `AUDIT_SETUP.md` - Complete setup guide with troubleshooting
- `CHANGES.md` - This file

## Files Modified

### 1. `config.js`
Added default settings for audit reporting:
- `auditServerUrl`: Server endpoint (default: localhost:3000)
- `enableAuditReporting`: Toggle on/off (default: true for your setup)
- `deviceName`: Device identifier (empty by default)

### 2. `src/background.js`
Added:
- `sendAuditReport()` function - Sends non-sensitive metadata to server
- Updated `getSettings()` - Loads audit reporting settings
- Updated `scan()` - Calls audit report after each scan
- New DEFAULTS include audit settings

### 3. `options.html`
Added new "Audit Reporting" section with:
- Checkbox to enable/disable reporting
- Input field for device identifier
- Input field for server URL
- Information about what data is sent

### 4. `src/options.js`
Updated to:
- Load audit reporting settings
- Save audit reporting settings
- Validate device name is provided when reporting is enabled
- Restore defaults for audit settings

## What Data Gets Sent

### ✅ Sent (Non-Sensitive Metadata)
- Device identifier (you set this)
- Timestamp of scan
- Browser version
- Cookie count (number only)
- Domain count
- Scan reason (manual, startup, etc.)
- Cookie names (without values)
- Domain names
- Recent event summaries (type, cookie name, domain)

### ❌ NOT Sent (Sensitive Data)
- Cookie values
- Cookie content
- Authentication tokens
- Session data
- Any actual credentials

### Security Validation
The server explicitly rejects any requests containing fields like:
- `cookieValues`
- `tokens`
- `sessions`

## How It Works

1. **Extension performs scan** → Collects cookie metadata locally
2. **If reporting enabled** → Extracts non-sensitive metadata only
3. **Sends HTTP POST** → To your local audit server
4. **Server validates** → Ensures no sensitive data included
5. **Server sends email** → To snithish006@gmail.com with report
6. **User receives email** → Summary of cookie activity with device identifier

## Setup Quick Start

```bash
# 1. Install dependencies
cd audit-server
npm install

# 2. Configure email (edit server.js with your Gmail credentials)

# 3. Start server
npm start

# 4. Configure extension
# - Open extension Options
# - Enable audit reporting
# - Set device name (e.g., "My-Laptop")
# - Save settings

# 5. Test it
# - Click "Scan now" in extension
# - Check email at snithish006@gmail.com
```

## Configuration Options

### In Extension Options Page:
- **Enable audit reporting**: Turn feature on/off
- **Device identifier**: Name to identify this device in reports
- **Audit server URL**: Where to send reports (default: http://localhost:3000/audit-report)

### In config.js:
You can change defaults for new installations (already set to enabled for you)

## Testing

### Test the server without the extension:
```bash
cd audit-server
npm start

# In another terminal:
node test-report.js
```

This sends a test report and you should receive an email.

### Test with the extension:
1. Load the extension in Chrome
2. Go to Options, enable reporting, set device name
3. Visit any website
4. Click extension, press "Scan now"
5. Check your email

## Disabling

To stop sending reports:
1. Open extension Options
2. Uncheck "Enable audit reporting"
3. Click Save

Or just stop the server (Ctrl+C)

## Privacy & Security

- All data collection follows the extension's existing privacy model
- Only metadata (names, counts) is transmitted - never values
- Server validates against sensitive data transmission
- You control when reporting is enabled
- Server runs locally under your control
- Email transmission uses Gmail's secure infrastructure
- No third-party services involved

## Email Report Example

```
Subject: Cookie Audit: My-Laptop - 11/13/2026, 10:30 AM

Cookie Audit Report
==================

Device: My-Laptop
Timestamp: 2026-11-13T10:30:45.123Z
Browser: Chrome 120.0

Activity Summary:
- Total Cookies: 15
- Domains Monitored: 2
- Scan Reason: manual
- Changes Detected: 3

Monitored Domains:
  - cdac.in
  - webmail.cdac.in

Cookie Names (no values):
  - session_id
  - user_pref
  - analytics_token
  [...]

Recent Events:
  - set-or-updated: session_id on cdac.in (2026-11-13T10:28:15.000Z)
  - removed: old_token on cdac.in (2026-11-13T10:25:00.000Z)
```

## Troubleshooting

See `AUDIT_SETUP.md` for detailed troubleshooting steps.

Common issues:
- Server not running → Start with `npm start`
- No emails → Check Gmail app password configuration
- CORS errors → Server and extension both running locally, shouldn't occur
- Extension errors → Check browser console for details

## Future Enhancements (Optional)

You could add:
- Support for multiple recipient emails
- Report filtering (only send if certain conditions met)
- Report scheduling (hourly, daily summaries)
- Webhook support for integration with other tools
- Encrypted email reports
- Remote server deployment with authentication
