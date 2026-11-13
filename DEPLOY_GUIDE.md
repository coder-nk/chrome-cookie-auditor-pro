# Deployment Guide: Multi-Machine Setup

## Problem

Currently, the extension sends data to `http://localhost:3000/audit-report`, which only works on the machine running the server.

## Solution

Deploy the server to a public URL so all machines can access it.

---

## Option 1: Deploy to Heroku (Free Tier Available)

### Step 1: Prepare for Deployment

1. **Add a Procfile:**
   ```bash
   cd audit-server
   echo "web: node server.js" > Procfile
   ```

2. **Update server.js to use PORT from environment:**
   The server already uses `process.env.PORT`, so it's ready!

3. **Create .gitignore:**
   ```bash
   echo "node_modules/" > .gitignore
   ```

### Step 2: Deploy to Heroku

```bash
# Install Heroku CLI if not installed
# Visit: https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
cd audit-server
heroku create cookie-auditor-dashboard

# Deploy
git init
git add .
git commit -m "Initial commit"
git push heroku main

# Your dashboard will be at:
# https://cookie-auditor-dashboard.herokuapp.com
```

### Step 3: Update Extension Configuration

1. Open extension Options
2. Change server URL to: `https://cookie-auditor-dashboard.herokuapp.com/audit-report`
3. Save settings

Now ANY machine with the extension can send data!

---

## Option 2: Deploy to Railway (Easy & Free)

1. **Visit Railway.app**: https://railway.app
2. **Sign up** with GitHub
3. **Create New Project** → Deploy from GitHub
4. **Point to** `audit-server` folder
5. **Get your URL**: e.g., `https://cookie-auditor-production.up.railway.app`

**Update extension:**
- Change server URL to: `https://YOUR-APP.up.railway.app/audit-report`

---

## Option 3: Deploy to Your Own VPS

If you have a VPS (DigitalOcean, AWS, etc.):

### Setup

```bash
# SSH into your server
ssh user@your-server.com

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone your code
git clone your-repo
cd audit-server

# Install dependencies
npm install

# Install PM2 (process manager)
sudo npm install -g pm2

# Start server
pm2 start server.js --name cookie-auditor

# Make it start on boot
pm2 startup
pm2 save
```

### Setup Nginx (for HTTPS)

```bash
# Install Nginx
sudo apt-get install nginx

# Install Certbot for SSL
sudo apt-get install certbot python3-certbot-nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/cookie-auditor
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/cookie-auditor /etc/nginx/sites-enabled/

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Restart Nginx
sudo systemctl restart nginx
```

**Update extension:**
- Change server URL to: `https://your-domain.com/audit-report`

---

## Option 4: Use ngrok (Quick Test - Not for Production)

For quick testing across machines:

```bash
# Install ngrok
# Visit: https://ngrok.com/download

# Start your local server
cd audit-server
npm start

# In another terminal, expose it
ngrok http 3000

# You'll get a URL like:
# https://abc123.ngrok.io
```

**Update extension:**
- Change server URL to: `https://abc123.ngrok.io/audit-report`

⚠️ **Warning**: ngrok URLs change every time you restart. Not suitable for permanent use.

---

## Option 5: Local Network Only

If all machines are on the same network:

### Step 1: Find Your IP Address

```bash
# Linux/Mac
ifconfig | grep "inet "

# Windows
ipconfig

# Look for something like: 192.168.1.100
```

### Step 2: Update Server to Accept External Connections

The server already listens on `0.0.0.0`, so it's ready!

### Step 3: Configure Firewall

```bash
# Linux
sudo ufw allow 3000

# Mac
# System Preferences → Security & Privacy → Firewall → Options
# Add port 3000

# Windows
# Firewall settings → Advanced → Inbound Rules → New Rule
# Allow port 3000
```

### Step 4: Update Extension on Other Machines

On other machines in your network:
- Open extension Options
- Change server URL to: `http://192.168.1.100:3000/audit-report`
  (replace with your actual IP)

---

## Recommended Setup by Use Case

### Home Use (2-3 computers)
→ **Option 5: Local Network**
- Free
- Fast
- Secure (not exposed to internet)
- Requires all machines on same network

### Small Team (5-10 people)
→ **Option 2: Railway.app** or **Option 1: Heroku**
- Free tier available
- Easy setup
- HTTPS included
- Works from anywhere

### Production / Large Scale
→ **Option 3: Own VPS**
- Full control
- Better performance
- Custom domain
- Scalable

### Quick Testing
→ **Option 4: ngrok**
- Instant setup
- Good for demos
- Not for permanent use

---

## Security Considerations

### For Public Deployments (Option 1, 2, 3)

**1. Add Authentication:**

Update `server.js`:
```javascript
// Add this before routes
const API_KEY = process.env.API_KEY || 'your-secret-key';

app.use((req, res, next) => {
  const key = req.headers['x-api-key'];
  if (key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

Update extension `config.js`:
```javascript
auditServerUrl: "https://your-server.com/audit-report",
auditApiKey: "your-secret-key"  // Add this
```

Update `background.js`:
```javascript
// In sendAuditReport function
const response = await fetch(settings.auditServerUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': settings.auditApiKey  // Add this
  },
  body: JSON.stringify(report)
});
```

**2. Use HTTPS:**
- Required for production
- Protects data in transit
- Use Let's Encrypt (free SSL)

**3. Rate Limiting:**

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/audit-report', limiter);
```

**4. Use Database:**

Instead of in-memory storage:
```bash
npm install mongodb
```

This persists data across server restarts.

---

## Configuration Summary

After deployment, update these in the extension:

### All Machines Need:

1. **Extension Options** → Audit Reporting → Server URL
   - Change from: `http://localhost:3000/audit-report`
   - Change to: `https://your-deployed-url.com/audit-report`

2. **Save Settings**

3. **Test**: Click "Scan now" and check the dashboard

### Each Machine Can Have:

- Different device names (e.g., "Laptop-1", "Laptop-2", "Desktop-1")
- Same or different configurations
- Same server URL (so all data goes to one dashboard)

---

## Multi-Machine Workflow

```
┌─────────────────────────────────────────────────────────┐
│                   Public Server                         │
│           https://your-server.com:443                   │
│                                                         │
│   ┌─────────────────────────────────────────────┐     │
│   │     Cookie Auditor Dashboard                │     │
│   │     - Receives from all machines            │     │
│   │     - Shows device identification           │     │
│   │     - Aggregates all reports                │     │
│   └─────────────────────────────────────────────┘     │
└──────────────────▲──────────────▲──────────────▲───────┘
                   │              │              │
         ┌─────────┴──────┐  ┌───┴──────┐  ┌────┴─────┐
         │ Machine A      │  │ Machine B│  │ Machine C│
         │ Device: Home-PC│  │ Device: │  │ Device:  │
         │ Extension ✓    │  │ Laptop-1 │  │ Office   │
         │ Sends to server│  │ Ext ✓    │  │ Ext ✓    │
         └────────────────┘  └──────────┘  └──────────┘
```

All machines send to the same server, and you see everything in one dashboard!

---

## Testing Multi-Machine Setup

1. **Deploy server** (choose option above)
2. **Get your public URL**
3. **Update extension on Machine 1:**
   - Device name: "Machine-1"
   - Server URL: your public URL
   - Save and scan
4. **Install extension on Machine 2:**
   - Device name: "Machine-2"
   - Server URL: same public URL
   - Save and scan
5. **Open dashboard:**
   - See reports from both machines!
   - Filter by device name

---

## Troubleshooting

### Extension can't connect to server

**Check 1**: Is server URL correct?
- Should be `https://your-domain.com/audit-report`
- Not `https://your-domain.com` (missing /audit-report)

**Check 2**: Is server running?
- Visit `https://your-domain.com` in browser
- Should see the dashboard

**Check 3**: HTTPS?
- Extension requires HTTPS for remote servers
- Localhost can use HTTP

### Dashboard not showing reports

**Check 1**: Server logs
- Check server console for incoming requests
- Look for "✓ Report received" messages

**Check 2**: CORS issues?
- Server already allows all origins
- Check browser console for errors

### Different machines show different data

This is correct! Each machine:
- Stores ALL cookies locally (in its own Chrome)
- Sends configured data to server (based on its settings)
- Dashboard shows reports from ALL machines

---

## Cost Estimates

| Option | Cost | Pros | Cons |
|--------|------|------|------|
| Local Network | Free | Fast, secure | Same network only |
| Heroku | Free tier available | Easy | Limited free hours |
| Railway | Free tier: $5 credit/month | Very easy | Credit runs out |
| VPS | $5-10/month | Full control | More setup |
| ngrok | Free for testing | Instant | URL changes |

---

## Quick Start: Railway Deployment (Easiest)

1. Visit https://railway.app
2. Sign up with GitHub
3. New Project → Deploy from GitHub
4. Select your repository
5. Add `audit-server` as root directory
6. Deploy!
7. Copy your URL
8. Update all extensions with new URL

**Done!** All machines can now send data to one dashboard.
