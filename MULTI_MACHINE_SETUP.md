# Multi-Machine Setup - Quick Guide

## Current Situation

**Extension sends to:** `http://localhost:3000/audit-report`

**This means:**
- ✅ Works on the machine running the server
- ❌ Does NOT work on other machines (localhost is different on each machine)

## Make It Work on All Machines

You need to deploy the server to a **public URL** so all machines can access it.

---

## Quick Setup (5 Minutes) - Railway

### Step 1: Deploy Server

1. Go to https://railway.app
2. Sign up (free)
3. Click "New Project"
4. Select "Deploy from GitHub" (or upload folder)
5. Point to the `audit-server` folder
6. Click "Deploy"
7. Wait 2 minutes...
8. Copy your URL: `https://cookie-auditor-xxx.up.railway.app`

### Step 2: Update Extension on ALL Machines

On **every machine** where you install the extension:

1. Open Chrome → Extensions → Cookie Auditor Pro → Options
2. Scroll to "Audit Reporting"
3. Change "Audit server URL" from:
   ```
   http://localhost:3000/audit-report
   ```
   To:
   ```
   https://cookie-auditor-xxx.up.railway.app/audit-report
   ```
   (use YOUR URL from Railway)
4. Set a unique device name:
   - Machine 1: "Home-Laptop"
   - Machine 2: "Work-PC"
   - Machine 3: "Test-Server"
5. Click "Save settings"

### Step 3: Test

1. On Machine 1: Click extension → "Scan now"
2. On Machine 2: Click extension → "Scan now"
3. Open dashboard: `https://cookie-auditor-xxx.up.railway.app`
4. You should see reports from BOTH machines!

---

## How It Works

```
                    ☁️ Your Server
              (Railway/Heroku/VPS)
        https://your-server.com/audit-report
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   💻 Machine 1   💻 Machine 2   💻 Machine 3
   Home-Laptop    Work-PC        Office-Desktop
   
   Extension      Extension      Extension
   sends data →   sends data →   sends data →
   
   All appear in the same dashboard! 🎉
```

---

## Alternative Options

### Option 1: Local Network Only (Free, No Internet Required)

If all machines are on the same WiFi/network:

1. Find your IP: `ifconfig` or `ipconfig` → e.g., `192.168.1.100`
2. Start server on one machine: `npm start`
3. On other machines, change server URL to:
   ```
   http://192.168.1.100:3000/audit-report
   ```

**Pros:** Free, fast, secure
**Cons:** Only works on same network

### Option 2: Your Own Server (Full Control)

If you have a VPS:

1. SSH to your server
2. Install Node.js
3. Upload `audit-server` folder
4. Install: `npm install`
5. Start: `pm2 start server.js`
6. Setup domain: `your-domain.com`
7. Use URL: `https://your-domain.com/audit-report`

**Pros:** Full control, custom domain
**Cons:** Requires VPS, more setup

### Option 3: Heroku (Popular)

```bash
cd audit-server
heroku create cookie-auditor
git push heroku main
```

Use URL: `https://cookie-auditor.herokuapp.com/audit-report`

---

## What Each Machine Needs

### On Every Machine:

1. **Install extension** (same .zip file)
2. **Configure Options:**
   - ✅ Set UNIQUE device name (so you can tell them apart)
   - ✅ Set SAME server URL (so they all send to one place)
   - ✅ Enable audit reporting
   - ✅ Configure what data to send (same or different)

### Example Configuration:

**Machine 1 (Home Laptop):**
```
Device name: Home-Laptop
Server URL: https://your-server.com/audit-report
Enable reporting: ✓
```

**Machine 2 (Work PC):**
```
Device name: Work-PC
Server URL: https://your-server.com/audit-report  ← SAME URL
Enable reporting: ✓
```

**Machine 3 (Test Server):**
```
Device name: Test-Server
Server URL: https://your-server.com/audit-report  ← SAME URL
Enable reporting: ✓
```

---

## Dashboard View

When you open the dashboard, you'll see:

```
📊 Statistics:
- Total Reports: 127
- Devices: 3 (Home-Laptop, Work-PC, Test-Server)
- Total Cookies: 1,543
- Unique Domains: 45

📱 Recent Reports:

┌──────────────────────────────────────┐
│ 📱 Home-Laptop                       │
│ 🕐 2026-11-13 10:30 AM              │
│ 🍪 45 cookies on 12 domains         │
│ 📊 3 changes detected                │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ 📱 Work-PC                           │
│ 🕐 2026-11-13 10:28 AM              │
│ 🍪 32 cookies on 8 domains          │
│ 📊 1 change detected                 │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ 📱 Test-Server                       │
│ 🕐 2026-11-13 10:25 AM              │
│ 🍪 67 cookies on 15 domains         │
│ 📊 12 changes detected               │
└──────────────────────────────────────┘
```

You can:
- 🔍 Search/filter by device
- 📥 Export all data
- 🔄 Auto-refresh every 5 seconds
- 🗑️ Delete individual reports

---

## Security Notes

### Public Server (Railway/Heroku)

**Current:** No authentication (anyone with URL can access)

**To Add Authentication:**
See `DEPLOY_GUIDE.md` for adding API keys

**Recommended:**
- Use HTTPS (automatic on Railway/Heroku)
- Don't send cookie values (keep it metadata only)
- Use strong device names (not personal info)

### Local Network

- Safer (not exposed to internet)
- Only accessible on your network
- No HTTPS needed for localhost

---

## Troubleshooting

### "Failed to fetch" error

**Problem:** Extension can't reach server

**Solution:**
1. Check server URL is correct
2. Make sure server is running
3. For remote servers, must use HTTPS
4. Check no typos in URL

### Dashboard shows no reports

**Problem:** Server running but no data

**Solution:**
1. Check extension Options → "Enable audit reporting" is checked
2. Click "Scan now" in extension
3. Check browser console for errors
4. Verify device name is set

### Reports from only one machine

**Problem:** Only seeing one device

**Solution:**
1. Check ALL machines have same server URL
2. Check ALL machines have different device names
3. Check "Enable audit reporting" is checked on all machines
4. Try clicking "Scan now" on each machine

---

## Summary

✅ **For Single Machine:** Use `http://localhost:3000` (current setup)

✅ **For Multiple Machines:** Deploy server publicly
- Easiest: Railway.app (free tier)
- Best for home: Local network (same WiFi)
- Best for production: Own VPS

✅ **All Machines:** Update server URL to your deployed address

✅ **Dashboard:** Access from anywhere at your server URL

---

## Next Steps

1. Choose deployment option (Railway recommended for start)
2. Deploy server (5 minutes)
3. Get your URL
4. Update extension on all machines
5. Open dashboard and see data from all machines!

Need help? See `DEPLOY_GUIDE.md` for detailed instructions.
