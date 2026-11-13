# Quick Start - Local Network Setup

## 🚀 For Server Machine (10.184.40.106)

Server is already running! ✅

- Dashboard: http://10.184.40.106:3001
- Database: SQLite (persistent storage)
- Port: 3001

---

## 📱 For Client Machines (Other Computers)

### Step 1: Test Connection First

1. On the client machine, open this file in a browser:
   ```
   test-client.html
   ```
   (Copy it to the client machine or host it on the server)

2. Click all test buttons:
   - ✅ Test Dashboard Access
   - ✅ Get Server Stats  
   - ✅ Send Test Report

3. All should show ✅ SUCCESS

If any test fails, see **TROUBLESHOOTING.md**

### Step 2: Install Extension

1. Download/copy the extension folder to client machine
2. Open Chrome: `chrome://extensions`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the extension folder
6. Extension should appear

### Step 3: Configure Extension

1. Click extension icon
2. Click gear icon (⚙️ Options)
3. Configure:
   - **Server URL:** `http://10.184.40.106:3001/audit-report`
   - **Enable audit reporting:** ✅ Check this
   - **Device name:** Leave empty (auto-generates) or enter custom name
   - **Domains:** Add sites to audit (e.g., `cdac.in`)
   - **Cookie Values:** ✅ Check to send values (default: enabled)
4. Click **Save Settings**

### Step 4: Test Extension

1. Visit a site (e.g., cdac.in)
2. Click extension icon
3. Click **Scan now**
4. Should see success message

### Step 5: View Dashboard

Open in any browser: http://10.184.40.106:3001

You should see reports from all devices! 🎉

---

## ⚡ Quick Reference

| Item | Value |
|------|-------|
| Server IP | 10.184.40.106 |
| Dashboard URL | http://10.184.40.106:3001 |
| API Endpoint | http://10.184.40.106:3001/audit-report |
| Port | 3001 |
| Storage | SQLite (audit_data.db) |

---

## 🔧 Common Issues

### "Can't reach server"
- Check firewall on server machine
- Verify both machines on same network
- Try: `ping 10.184.40.106`

### "Extension not sending data"
1. Open extension console: `chrome://extensions` → Details → Service Worker
2. Check for errors
3. Verify settings are saved
4. Try manual scan

### Need more help?
See **TROUBLESHOOTING.md** for detailed debugging steps.

---

## 📊 Viewing Data

### Dashboard (Web UI)
http://10.184.40.106:3001

### Database (SQLite)
```bash
cd audit-server
sqlite3 audit_data.db
sqlite> SELECT device_name, cookie_count, received_at FROM audit_reports;
```

### Server Logs
Check the terminal where server is running for real-time logs.

---

## 🛑 Stop Server

Press `Ctrl+C` in the server terminal

## 🔄 Restart Server

```bash
cd audit-server
PORT=3001 HOST=0.0.0.0 node server.js
```

Or use the start script:
```bash
./start-local-server.sh
```
