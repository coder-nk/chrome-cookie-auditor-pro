# Local Network (Intranet) Setup Guide

Deploy the Cookie Auditor Server on your local network so anyone connected to your network can access it.

## 🏠 Overview

This setup allows:
- ✅ Server runs on your machine
- ✅ Anyone on your WiFi/LAN can access the dashboard
- ✅ All devices on the network can send audit reports
- ✅ Data stored in Supabase (persistent) or locally (in-memory)

---

## 📋 Prerequisites

1. **Server Machine** (your computer)
   - Node.js installed (v14 or higher)
   - Connected to your local network
   
2. **Client Devices** (other computers on network)
   - Connected to the same WiFi/LAN
   - Chrome browser with Cookie Auditor extension

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
cd audit-server
npm install
```

### Step 2: Configure Supabase (Optional but Recommended)

If you want persistent storage (data survives server restarts):

1. Create `.env` file in `audit-server/` folder (already exists)
2. Add your Supabase credentials:
   ```
   SUPABASE_URL=https://onxaphgsqodiqctawlzm.supabase.co
   SUPABASE_ANON_KEY=sb_publishable_8xSyapTbCsvzyze1uVybOw_b8B3gSYGPublishable
   ```

**Without Supabase:** Server will use in-memory storage (data lost on restart)

### Step 3: Start the Server

```bash
cd audit-server
node server.js
```

Or use the test script:
```bash
./test-local.sh
```

You'll see output like:
```
╔════════════════════════════════════════════════════╗
║   Cookie Auditor Dashboard Server                 ║
╚════════════════════════════════════════════════════╝

✓ Server running on port 3000
✓ Storage: Supabase (persistent)

📍 Access Points:
   
   Local Machine:
   • http://localhost:3000
   
   Network Access:
   • http://192.168.1.100:3000
   • http://10.0.0.5:3000

📱 For Chrome Extension Configuration:
   Use: http://192.168.1.100:3000/audit-report
```

**Note down your network IP address** (e.g., `192.168.1.100`)

### Step 4: Test Dashboard Access

From **any device on your network**:

1. Open a browser
2. Go to: `http://YOUR_SERVER_IP:3000`
   - Example: `http://192.168.1.100:3000`
3. You should see the Cookie Auditor Dashboard

### Step 5: Configure Chrome Extension (Each Device)

On **each device** where you want to use the extension:

1. Open Chrome and go to `chrome://extensions`
2. Load the Cookie Auditor extension (if not already installed)
3. Click the extension icon → gear icon (Options)
4. Set the server URL:
   ```
   http://YOUR_SERVER_IP:3000/audit-report
   ```
   Example: `http://192.168.1.100:3000/audit-report`
5. Enable "Enable audit reporting"
6. Set a unique device name (e.g., "John's Laptop", "Lab Computer 1")
7. Save settings

### Step 6: Test the Setup

From any device with the extension:

1. Visit a website (e.g., cdac.in)
2. Click **Scan now** in the extension popup
3. Open the dashboard at `http://YOUR_SERVER_IP:3000`
4. You should see the audit report appear!

---

## 🔥 Firewall Configuration

If other devices can't connect, you may need to allow port 3000:

### Linux (Ubuntu/Debian)
```bash
sudo ufw allow 3000/tcp
sudo ufw status
```

### Linux (Fedora/RHEL)
```bash
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

### Windows
1. Open "Windows Defender Firewall"
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → TCP → Specific port: 3000
5. Allow the connection

### macOS
```bash
# macOS usually allows local network connections by default
# If issues, check System Preferences → Security & Privacy → Firewall
```

---

## 📊 Network Topology

```
                    ┌─────────────────┐
                    │  Your Router    │
                    │  192.168.1.1    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
      ┌───────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
      │ Server PC    │ │ Laptop 1 │ │ Laptop 2   │
      │ 192.168.1.100│ │192.168.1.│ │192.168.1.  │
      │              │ │    101   │ │    102     │
      │ [Dashboard]  │ │          │ │            │
      │ [Supabase]   │ │[Extension│ │[Extension] │
      └──────────────┘ └──────────┘ └────────────┘
           ▲                │              │
           │                │              │
           └────────────────┴──────────────┘
                Audit Reports Flow
```

---

## 🔧 Troubleshooting

### Problem: Can't access from other devices

**Solution 1: Check server is listening on 0.0.0.0**
- The server is configured to listen on all interfaces
- Verify in the startup message

**Solution 2: Check firewall**
```bash
# Test from another device
curl http://YOUR_SERVER_IP:3000/api/stats

# Should return JSON with statistics
```

**Solution 3: Verify same network**
```bash
# On server machine
ip addr show  # Linux
ipconfig      # Windows

# On client machine - should be same subnet
```

### Problem: Extension can't send reports

**Check:**
1. Extension configured with correct URL: `http://IP:3000/audit-report`
2. "Enable audit reporting" is checked
3. Device name is set
4. Server is running (check terminal)

**Test manually:**
```bash
# From any device on network
curl -X POST http://YOUR_SERVER_IP:3000/audit-report \
  -H "Content-Type: application/json" \
  -d '{"deviceName":"Test","cookieCount":5}'

# Should return: {"success":true,...}
```

### Problem: Data lost after restart

**Cause:** Not using Supabase - in-memory storage only

**Solution:** Set up Supabase credentials in `.env` file

---

## 🎯 Best Practices

### For Development/Testing
- Use in-memory storage (no Supabase needed)
- Run server when needed
- Stop with `Ctrl+C`

### For Production/Long-term Use
- ✅ Set up Supabase for persistent storage
- ✅ Run server as a service (see below)
- ✅ Use static IP for server machine
- ✅ Document the server IP for users

---

## 🏃 Run Server as a Background Service

### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start server with PM2
cd audit-server
pm2 start server.js --name cookie-auditor

# Set to start on boot
pm2 startup
pm2 save

# Useful PM2 commands
pm2 status           # Check status
pm2 logs            # View logs
pm2 restart cookie-auditor
pm2 stop cookie-auditor
```

### Using systemd (Linux)

Create `/etc/systemd/system/cookie-auditor.service`:

```ini
[Unit]
Description=Cookie Auditor Server
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/path/to/chrome-cookie-auditor-pro/audit-server
Environment=NODE_ENV=production
Environment=SUPABASE_URL=https://onxaphgsqodiqctawlzm.supabase.co
Environment=SUPABASE_ANON_KEY=sb_publishable_8xSyapTbCsvzyze1uVybOw_b8B3gSYGPublishable
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable cookie-auditor
sudo systemctl start cookie-auditor
sudo systemctl status cookie-auditor
```

---

## 📱 Mobile Device Access

The dashboard is mobile-responsive! Access from:
- Phones
- Tablets
- Any device with a browser on your network

Just navigate to: `http://YOUR_SERVER_IP:3000`

---

## 🔒 Security Considerations

Since this is local network only:
- ✅ Not exposed to the internet
- ✅ Only accessible on your LAN/WiFi
- ⚠️  Anyone on your network can access
- 💡 Consider adding authentication for sensitive environments

---

## 📈 Monitoring

View real-time activity:
- Server logs show each report received
- Dashboard shows all reports and statistics
- Supabase Table Editor shows all data

---

## 🎓 Quick Reference

| What | URL Format | Example |
|------|-----------|---------|
| Dashboard | `http://IP:3000` | `http://192.168.1.100:3000` |
| API Endpoint | `http://IP:3000/audit-report` | `http://192.168.1.100:3000/audit-report` |
| Statistics | `http://IP:3000/api/stats` | `http://192.168.1.100:3000/api/stats` |
| All Reports | `http://IP:3000/api/reports` | `http://192.168.1.100:3000/api/reports` |

---

**Need Help?** 
- Check server logs in the terminal
- Test with `curl` commands
- Verify firewall settings
- Ensure all devices on same network
