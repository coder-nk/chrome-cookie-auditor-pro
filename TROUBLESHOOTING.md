# Troubleshooting Guide - Extension Not Sending Data

## Quick Checklist for Other Machines

### 1. ✅ Check Server is Running
From the **server machine** (10.184.40.106):
```bash
# Should show server running on port 3001
ps aux | grep "node server.js"
```

### 2. ✅ Test Network Connectivity
From the **client machine** (different computer):
```bash
# Test if server is reachable
curl http://10.184.40.106:3001/api/stats

# Should return JSON with statistics
```

If this fails, check:
- Firewall on server machine
- Both machines are on the same network
- Server IP is correct (10.184.40.106)

### 3. ✅ Check Extension Configuration
On the **client machine**:

1. Open Chrome → `chrome://extensions`
2. Find "Cookie Auditor Pro"
3. Click **Details**
4. Check "Allow access to file URLs" is OFF (not needed)
5. Go back and click the extension icon
6. Click gear icon (Options)
7. Verify:
   - ✅ "Enable audit reporting" is **checked**
   - ✅ Server URL is: `http://10.184.40.106:3001/audit-report`
   - ✅ Device name shows (auto-generated or custom)
   - ✅ Domain list includes the sites you want to audit (e.g., `cdac.in`)

8. Click **Save Settings**

### 4. ✅ Check Extension Console for Errors
On the **client machine**:

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Find "Cookie Auditor Pro"
4. Click **background page** or **service worker**
5. Check Console tab for errors

Common errors:
- `Failed to fetch` → Network issue, check firewall
- `CORS error` → Server needs to allow CORS (we'll fix this)
- `Device identifier is required` → Reload extension after updating code

### 5. ✅ Test Sending Report
On the **client machine**:

1. Open the extension popup
2. Click **Scan now**
3. Check for success message
4. Go to `http://10.184.40.106:3001` in browser
5. Should see the report appear on dashboard

---

## Detailed Troubleshooting Steps

### Step 1: Verify Server Configuration

**Check server logs on 10.184.40.106:**
```bash
# The server should show this at startup
✓ Server running on port 3001
✓ Storage: SQLite Database (persistent)
📍 Network Access:
   • http://10.184.40.106:3001
```

### Step 2: Test from Client Machine

**From the client machine**, open browser and try:

1. **Test Dashboard Access:**
   - Go to: `http://10.184.40.106:3001`
   - Should see the Cookie Auditor Dashboard

2. **Test API Endpoint:**
   - Open browser console (F12)
   - Run this in console:
   ```javascript
   fetch('http://10.184.40.106:3001/api/stats')
     .then(r => r.json())
     .then(data => console.log('Server response:', data))
     .catch(err => console.error('Connection error:', err));
   ```
   - Should show server statistics

3. **Test Sending Report:**
   - Run this in browser console:
   ```javascript
   fetch('http://10.184.40.106:3001/audit-report', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       deviceName: 'Test from Client',
       cookieCount: 5,
       timestamp: new Date().toISOString()
     })
   })
   .then(r => r.json())
   .then(data => console.log('Success:', data))
   .catch(err => console.error('Error:', err));
   ```
   - Should return: `{success: true, ...}`

### Step 3: Check Firewall (Server Machine)

**Linux (Ubuntu/Debian):**
```bash
# Check if port 3001 is allowed
sudo ufw status

# Allow port 3001 if not already allowed
sudo ufw allow 3001/tcp
```

**Linux (Fedora/RHEL):**
```bash
# Check firewall status
sudo firewall-cmd --list-all

# Allow port 3001
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

### Step 4: Check Extension Permissions

The extension needs permission to access `http://10.184.40.106:*`

**Check manifest.json:**
```json
{
  "host_permissions": [
    "https://cdac.in/*",
    "https://*.cdac.in/*",
    "http://10.184.40.106/*"  // ← Should be here
  ]
}
```

If missing, add it and reload extension.

### Step 5: Enable Reporting Step-by-Step

On **each client machine**:

1. **Reload the extension:**
   - `chrome://extensions`
   - Click reload button (🔄) on Cookie Auditor Pro

2. **Open Options:**
   - Click extension icon
   - Click gear icon

3. **Configure:**
   - Check ✅ "Enable audit reporting"
   - Server URL: `http://10.184.40.106:3001/audit-report`
   - Device name: Leave empty (auto-generates) or enter custom name
   - Click **Save Settings**

4. **Test:**
   - Visit a site in your domain list (e.g., cdac.in)
   - Click extension icon
   - Click **Scan now**
   - Should see success message

5. **Verify on Dashboard:**
   - Open: `http://10.184.40.106:3001`
   - Should see new report

---

## Common Issues & Solutions

### Issue 1: "Failed to fetch" or "Network request failed"

**Cause:** Can't reach the server

**Solutions:**
1. Verify server is running: `ps aux | grep node`
2. Check firewall on server machine
3. Ping server: `ping 10.184.40.106`
4. Verify same network: Check IP subnet

### Issue 2: Reports not appearing on dashboard

**Cause:** Extension not sending or server not saving

**Check:**
1. Open extension background console (`chrome://extensions` → Details → background page)
2. Look for errors
3. Check server logs for "Report saved" messages
4. Verify SQLite database file exists: `ls -lh audit-server/audit_data.db`

### Issue 3: "Device identifier is required"

**Cause:** Old extension code before auto-generate feature

**Solution:**
1. Pull latest code from GitHub
2. Reload extension on all machines
3. Clear settings and save again

### Issue 4: CORS error

**Cause:** Browser blocking cross-origin requests

**Solution:**
The server already allows CORS, but if you see this:
- Make sure URL is `http://` not `https://`
- Check server is actually running
- Try from browser console first

### Issue 5: Extension not loading on client machines

**Solution:**
1. On client machine, download the extension folder
2. Open `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the folder
6. Configure as above

---

## Testing Commands

### Test from Server Machine (10.184.40.106)
```bash
# Test locally
curl http://localhost:3001/api/stats

# Test via network IP
curl http://10.184.40.106:3001/api/stats
```

### Test from Client Machine
```bash
# Test network connectivity
ping 10.184.40.106

# Test HTTP access
curl http://10.184.40.106:3001/api/stats

# Send test report
curl -X POST http://10.184.40.106:3001/audit-report \
  -H "Content-Type: application/json" \
  -d '{"deviceName":"Test Client","cookieCount":10}'
```

---

## Need More Help?

Check server logs:
```bash
# View server output
cd audit-server
tail -f nohup.out  # if running with nohup
# or just check terminal where server is running
```

Check database:
```bash
# Install sqlite3 if needed
sudo apt-get install sqlite3  # Ubuntu/Debian

# Query database
cd audit-server
sqlite3 audit_data.db "SELECT device_name, cookie_count, received_at FROM audit_reports ORDER BY received_at DESC LIMIT 10;"
```

Check extension storage:
1. `chrome://extensions` → Cookie Auditor Pro → Details
2. Click "Inspect views: background page"
3. In console, run:
```javascript
chrome.storage.local.get(null, (data) => console.log(data));
```
