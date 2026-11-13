# Audit Reporting Setup Guide

This extension now supports sending **non-sensitive audit metadata** to your email for security monitoring.

## What Gets Sent

✅ **Sent (Non-sensitive):**
- Device name/identifier
- Timestamp of activity
- Number of cookies found
- Cookie names (without values)
- Domain names being monitored
- Activity summary (scans, changes)
- Recent event types

❌ **NOT Sent (Sensitive):**
- Cookie values
- Authentication tokens
- Session data
- Any actual cookie content

## Setup Instructions

### Step 1: Set Up Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Enable 2-Factor Authentication (if not already enabled)
3. Go to Security → 2-Step Verification → App passwords
4. Generate a new app password for "Mail"
5. Copy the 16-character password (you'll need it in Step 3)

### Step 2: Install Audit Server

Open a terminal and run:

```bash
cd audit-server
npm install
```

### Step 3: Configure Email Settings

Edit `audit-server/server.js`:

```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',        // Your Gmail address
    pass: 'xxxx xxxx xxxx xxxx'          // App password from Step 1
  }
});
```

Also update the `from` field in the mailOptions:

```javascript
from: 'your-email@gmail.com',
to: 'snithish006@gmail.com',
```

### Step 4: Start the Audit Server

```bash
cd audit-server
npm start
```

You should see:
```
Audit server running on port 3000
Ready to receive audit reports
```

Keep this terminal window open while using the extension.

### Step 5: Configure Extension

1. Click the Cookie Auditor Pro extension icon
2. Click the gear/settings icon (or right-click → Options)
3. Scroll to "Audit Reporting" section
4. Check "Enable audit reporting"
5. Set your device identifier (e.g., "Home-Laptop", "Office-PC")
6. Verify server URL is: `http://localhost:3000/audit-report`
7. Click "Save settings"

### Step 6: Test It

1. Visit a website (e.g., https://cdac.in)
2. Click the extension and press "Scan now"
3. Check your email (snithish006@gmail.com) for the audit report

## Example Email Report

```
Cookie Audit Report
==================

Device: Home-Laptop
Timestamp: 2026-11-13T10:30:45.123Z
Browser: Chrome 120.0.6099.129

Activity Summary:
- Total Cookies: 15
- Domains Monitored: 3
- Scan Reason: manual
- Changes Detected: 2

Monitored Domains:
  - cdac.in
  - webmail.cdac.in

Cookie Names (no values):
  - session_tracker
  - user_preferences
  - analytics_id
  ...

Recent Events:
  - set-or-updated: session_tracker on cdac.in (2026-11-13T10:28:15.000Z)
  - removed: old_cookie on cdac.in (2026-11-13T10:25:00.000Z)

---
This is an automated security audit report.
No sensitive cookie values are included.
```

## Troubleshooting

### "Error sending report" in console

1. **Check server is running**: Look for "Audit server running on port 3000"
2. **Check URL**: Make sure extension settings have correct URL
3. **Check firewall**: Ensure port 3000 is not blocked

### No emails received

1. **Check Gmail app password**: Make sure you used the app password, not your regular password
2. **Check spam folder**: First emails might go to spam
3. **Check server logs**: Look at the terminal running the audit server for errors
4. **Test email settings**: See if nodemailer reports any authentication errors

### "Service_worker (Inactive)" in Chrome

This is normal - Chrome wakes the service worker when needed. Audit reports will still be sent.

## Security Notes

- The audit server only accepts metadata (no cookie values)
- Requests containing `cookieValues`, `tokens`, or `sessions` fields are rejected
- All data stays local until explicitly reported
- You control when reporting is enabled via the Options page
- The server validates that no sensitive data is included before sending emails

## Alternative: Remote Server

If you want to run the audit server on a remote machine:

1. Deploy `audit-server` to your server
2. Update extension settings with your server URL (e.g., `https://your-domain.com/audit-report`)
3. **Use HTTPS in production** (not HTTP)
4. Consider adding authentication to the endpoint

## Disabling Audit Reports

To stop sending reports:

1. Open extension Options
2. Uncheck "Enable audit reporting"
3. Click "Save settings"

Or stop the audit server:
- Press Ctrl+C in the terminal running the server
