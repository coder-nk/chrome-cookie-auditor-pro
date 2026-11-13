# Setup Checklist

Use this checklist to set up audit reporting in 5 minutes.

## ☑️ Prerequisites

- [ ] Chrome browser installed
- [ ] Node.js and npm installed
- [ ] Gmail account with 2FA enabled

---

## 📧 Step 1: Gmail Setup (2 minutes)

- [ ] Go to https://myaccount.google.com/security
- [ ] Enable 2-Step Verification (if not already enabled)
- [ ] Go to "2-Step Verification" → "App passwords"
- [ ] Generate app password for "Mail"
- [ ] Copy the 16-character password (save it temporarily)

---

## 🖥️ Step 2: Audit Server Setup (2 minutes)

- [ ] Open terminal
- [ ] Navigate to project: `cd chrome-cookie-auditor-pro/audit-server`
- [ ] Install dependencies: `npm install`
- [ ] Edit `server.js`:
  - [ ] Replace `YOUR_EMAIL@gmail.com` with your Gmail address (2 places)
  - [ ] Replace `YOUR_APP_PASSWORD` with app password from Step 1
- [ ] Start server: `npm start`
- [ ] Verify output: "Audit server running on port 3000" ✓

**Keep this terminal window open!**

---

## 🔧 Step 3: Extension Configuration (1 minute)

- [ ] Open Chrome
- [ ] Load extension if not already loaded (chrome://extensions → Load unpacked)
- [ ] Click Cookie Auditor Pro icon
- [ ] Click gear icon (Settings/Options)
- [ ] Scroll to "Audit Reporting" section
- [ ] Check "☑ Enable audit reporting"
- [ ] Enter device name (e.g., "My-Laptop")
- [ ] Verify server URL is `http://localhost:3000/audit-report`

### Choose Configuration:

#### Option A: Safe (Recommended) ✓
- [ ] ☑ Include cookie names (without values)
- [ ] ☑ Include domain names
- [ ] ☐ Include cookie VALUES (keep UNCHECKED)
- [ ] ☐ Include cookie paths
- [ ] ☐ Include cookie attributes
- [ ] ☑ Include recent events summary
- [ ] ☐ Include detailed event information
- [ ] ☑ Include counts (cookies, domains)
- [ ] ☑ Include timestamps
- [ ] ☑ Include browser information

#### Option B: Full Data (Advanced) ⚠️
- [ ] ☑ Check ALL boxes including "Include cookie VALUES"
- [ ] Accept warning dialog

- [ ] Click "Save settings"
- [ ] Wait for confirmation message

---

## ✅ Step 4: Test (1 minute)

- [ ] Visit a test website (e.g., https://cdac.in)
- [ ] Click Cookie Auditor Pro icon
- [ ] Click "Scan now" button
- [ ] Wait 5 seconds
- [ ] Check email at snithish006@gmail.com
- [ ] Verify you received audit report ✓

### Expected Email:
```
From: [Your Gmail]
To: snithish006@gmail.com
Subject: Cookie Audit: [Your Device Name] - [Date/Time]

Cookie Audit Report
==================

Device: [Your Device Name]
Timestamp: [Current Time]
Browser: Chrome [Version]

Activity Summary:
- Total Cookies: [Number]
- Domains Monitored: [Number]
...
```

- [ ] Email received? ✓ Success!
- [ ] No email? See troubleshooting below

---

## 🔍 Troubleshooting

### No email received?

**Check 1: Server Running?**
- [ ] Terminal shows "Audit server running on port 3000"
- [ ] No error messages in terminal
- [ ] If not running: `npm start` in audit-server folder

**Check 2: Gmail Configuration?**
- [ ] Used App Password (not regular password)
- [ ] Email address correct in server.js (2 places)
- [ ] App password correct in server.js

**Check 3: Extension Configuration?**
- [ ] "Enable audit reporting" is checked
- [ ] Device name is filled in
- [ ] Server URL is correct
- [ ] Settings saved successfully

**Check 4: Spam Folder?**
- [ ] Check spam/junk folder in snithish006@gmail.com

**Check 5: Server Logs?**
- [ ] Look at terminal running audit server
- [ ] Any error messages?
- [ ] "Error sending report"? = Gmail config issue
- [ ] No output? = Extension not sending

### Still not working?

**Test the server directly:**
```bash
# In audit-server folder
node test-report.js
```

- [ ] Email received? ✓ Server works, check extension config
- [ ] Error message? See error and fix Gmail config

---

## 📊 Verify Local Storage (Always Works)

Even if email reports don't work, local storage always does:

- [ ] Visit any website
- [ ] Click extension icon
- [ ] Click "Scan now"
- [ ] See cookies listed in popup? ✓
- [ ] Can export to JSON? ✓

**Local storage is independent of email reporting!**

---

## 🎯 Quick Reference

### Start Audit Server
```bash
cd chrome-cookie-auditor-pro/audit-server
npm start
```

### Stop Audit Server
Press `Ctrl+C` in the terminal

### Test Email (Without Extension)
```bash
cd chrome-cookie-auditor-pro/audit-server
node test-report.js
```

### View Extension Settings
1. Click extension icon
2. Click gear icon
3. Scroll to "Audit Reporting"

### Disable Email Reports
1. Open extension Options
2. Uncheck "Enable audit reporting"
3. Click "Save settings"

---

## 📝 Configuration Saved Checklist

After setup, verify these are configured:

- [ ] ✓ Gmail app password configured in server.js
- [ ] ✓ Email address configured in server.js (2 places)
- [ ] ✓ Audit server running (terminal open)
- [ ] ✓ Extension loaded in Chrome
- [ ] ✓ "Enable audit reporting" checked
- [ ] ✓ Device name entered
- [ ] ✓ Email report options selected
- [ ] ✓ Settings saved
- [ ] ✓ Test email received

**Status: □ Not Started | ◐ In Progress | ✓ Complete**

---

## 🚀 Daily Usage

Once set up, daily usage is simple:

1. **Start audit server** (once per day)
   ```bash
   cd chrome-cookie-auditor-pro/audit-server
   npm start
   ```

2. **Use Chrome normally**
   - Extension automatically monitors cookies
   - Local storage always captures everything

3. **Trigger reports** (optional)
   - Click extension → "Scan now"
   - Or wait for automatic scans

4. **Check email**
   - Receive reports at snithish006@gmail.com
   - Review activity summaries

5. **Deep analysis** (when needed)
   - Open extension popup
   - View all cookies with values
   - Export to JSON

**That's it!** The extension runs in the background and sends reports according to your configuration.

---

## 📖 Next Steps

After successful setup:

- [ ] Read [QUICK_CONFIG.md](QUICK_CONFIG.md) for configuration presets
- [ ] Review [CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md) for detailed options
- [ ] Bookmark this checklist for future reference

---

## ✅ Setup Complete!

If you've checked all the boxes above:

✓ Gmail configured  
✓ Audit server running  
✓ Extension configured  
✓ Test email received  

**You're all set!** The extension will now:
- Save ALL cookie data locally (always)
- Send configured reports to snithish006@gmail.com
- Track activity across devices (using device names)

Enjoy your cookie auditing! 🍪
