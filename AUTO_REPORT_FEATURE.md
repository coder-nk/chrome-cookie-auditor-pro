# Automatic Reporting Feature

## 🚀 Zero Setup Required!

The extension now automatically sends audit reports every 2 minutes **without any configuration needed**.

## ✨ How It Works

### 1. **Auto-Enabled**
- Audit reporting is enabled by default
- No need to check any boxes
- Works immediately after installing the extension

### 2. **Auto-Generated Device Name**
- Each machine gets a unique device identifier automatically
- Format: `Device-{timestamp}-{random}`
- Example: `Device-m3k9p2x-7j4n2`
- No manual setup required

### 3. **Automatic Reporting**
- Scans cookies every 2 minutes
- Compares with previous scan
- **Only sends if data has changed** (smart reporting)
- Includes full cookie values and metadata

### 4. **Change Detection**
The extension tracks:
- Cookie count changes
- Domain count changes
- New/removed cookies
- Cookie name changes

**Result:** Server only receives updates when something actually changes!

## 📊 What Gets Sent

Every 2 minutes (if changes detected):
- ✅ Device identifier (auto-generated)
- ✅ Cookie count
- ✅ Domain count
- ✅ Cookie names
- ✅ **Cookie VALUES** (full data)
- ✅ Cookie attributes (secure, httpOnly, etc.)
- ✅ Domains list
- ✅ Recent cookie events
- ✅ Timestamp
- ✅ Browser info

## 🎯 Installation - Super Simple!

### On Any Machine:

1. **Copy Extension Folder** to the machine
2. **Open Chrome:** `chrome://extensions`
3. **Enable Developer Mode** (top right toggle)
4. **Click "Load unpacked"**
5. **Select the extension folder**
6. **Done!** ✅

That's it! The extension starts reporting automatically.

## 📈 View Reports

**Dashboard:** http://10.184.40.106:3001

- See reports from all machines
- Real-time updates
- Filter by device
- Search cookies and domains

## ⚙️ Advanced Configuration (Optional)

If you want to customize (not required):

1. Click extension icon
2. Click gear icon (Options)
3. You can:
   - Change device name (from auto-generated to custom)
   - Add/remove domains to monitor
   - Disable cookie values (send names only)
   - Exclude specific cookies

But remember: **The defaults work great without any changes!**

## 🔍 Technical Details

### Timing
- **First Report:** 10 seconds after extension loads
- **Subsequent Reports:** Every 2 minutes
- **Condition:** Only if data changed

### Change Detection Algorithm
```javascript
// Compares:
- inventoryCount
- domainCount  
- cookieNames (sorted list)

// If ANY changed → Send report
// If SAME → Skip report (no network traffic)
```

### Network Efficiency
- No unnecessary reports
- Minimal bandwidth usage
- Only sends actual changes

## 🐛 Troubleshooting

### "No reports appearing"

**Check:**
1. Server is running: http://10.184.40.106:3001
2. Extension is loaded (check `chrome://extensions`)
3. Wait 10 seconds for first report
4. Check browser console for errors:
   - `chrome://extensions` → Extension details → Service worker → Console

### "Reports but no data"

The extension only reports when cookies exist. Try:
1. Visit a website (e.g., cdac.in)
2. Wait 2 minutes
3. Check dashboard

### "Want to force a report now"

1. Click extension icon
2. Click **"Scan now"**
3. Report sent immediately

## 📝 Logs

Check extension console to see automatic reporting in action:

```
chrome://extensions → Cookie Auditor Pro → Service worker
```

You'll see:
```
Automatic reporting started (every 120 seconds)
Data changed, sending automatic report...
✓ Audit report sent successfully
```

Or:
```
No changes detected, skipping report
```

## 🎉 Benefits

✅ **Zero configuration** - works out of the box  
✅ **Automatic device naming** - no manual setup  
✅ **Smart reporting** - only sends when needed  
✅ **Full data capture** - complete cookie information  
✅ **Network efficient** - change detection prevents spam  
✅ **Multi-machine ready** - same setup everywhere  

## 🔒 Privacy Note

This extension is designed for **internal network monitoring**. All data:
- Stays on your local network (10.184.40.106)
- Not sent to external servers
- Stored in local SQLite database
- Fully under your control

---

**Questions?** Check the server logs or dashboard for real-time activity!
