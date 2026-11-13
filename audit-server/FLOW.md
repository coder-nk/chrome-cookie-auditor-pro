# Audit Reporting Flow

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Chrome Browser                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │   Cookie Auditor Pro Extension                      │   │
│  │                                                      │   │
│  │  1. Scans cookies from websites                     │   │
│  │  2. Stores ALL cookie data locally (with values)    │   │
│  │  3. Extracts ONLY metadata (no values)              │   │
│  │  4. Adds device identifier                          │   │
│  └─────────────────┬───────────────────────────────────┘   │
│                    │                                        │
└────────────────────┼────────────────────────────────────────┘
                     │
                     │ HTTP POST (metadata only)
                     │ {
                     │   deviceName: "My-Laptop",
                     │   cookieNames: [...],
                     │   domains: [...],
                     │   counts: {...}
                     │ }
                     ▼
         ┌───────────────────────┐
         │  Audit Server         │
         │  (localhost:3000)     │
         │                       │
         │  1. Validates data    │
         │  2. Rejects if        │
         │     sensitive fields  │
         │  3. Formats report    │
         └───────────┬───────────┘
                     │
                     │ SMTP (Gmail)
                     │
                     ▼
         ┌───────────────────────┐
         │   Gmail Server        │
         │                       │
         │   Sends email to:     │
         │   snithish006@        │
         │   gmail.com           │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   Your Email Inbox    │
         │                       │
         │   Receives audit      │
         │   report with device  │
         │   name & metadata     │
         └───────────────────────┘
```

## Data Flow Example

### Step 1: Cookie Scan
```javascript
// Extension finds cookies on cdac.in
[
  { name: "session_id", value: "abc123xyz...", domain: "cdac.in" },
  { name: "user_pref", value: "theme=dark", domain: "cdac.in" }
]
```

### Step 2: Local Storage (Full Data)
```javascript
// Stored in chrome.storage.local - INCLUDES values
{
  "cap_inventory": {
    "cookie_id_1": {
      name: "session_id",
      value: "abc123xyz...",  // ✅ Stored locally
      domain: "cdac.in",
      path: "/",
      secure: true,
      ...
    }
  }
}
```

### Step 3: Extract Metadata Only
```javascript
// Prepared for transmission - NO values
{
  deviceName: "My-Laptop",
  timestamp: "2026-11-13T10:30:00Z",
  cookieCount: 2,
  domains: ["cdac.in"],
  cookieNames: ["session_id", "user_pref"],  // ❌ No values
  recentEvents: [
    {
      type: "set-or-updated",
      cookieName: "session_id",  // ❌ No value
      domain: "cdac.in"
    }
  ]
}
```

### Step 4: Server Validation
```javascript
// Server checks incoming data
if (report.cookieValues || report.tokens || report.sessions) {
  return res.status(400).json({ 
    error: 'Sensitive data not allowed' 
  });
}
// ✅ Only metadata accepted
```

### Step 5: Email Sent
```
Subject: Cookie Audit: My-Laptop - 11/13/2026, 10:30 AM

Device: My-Laptop
Timestamp: 2026-11-13T10:30:00Z

Activity Summary:
- Total Cookies: 2
- Domains: cdac.in

Cookie Names (no values):
- session_id
- user_pref
```

## Security Guarantees

### What Extension Knows:
- ✅ All cookie data (names + values)
- ✅ Stored locally in Chrome profile
- ✅ Available for JSON export

### What Gets Transmitted:
- ✅ Cookie names (without values)
- ✅ Domain names
- ✅ Counts and timestamps
- ✅ Device identifier
- ❌ Cookie values
- ❌ Session tokens
- ❌ Authentication data

### What Server Receives:
- ✅ Metadata only
- ✅ Device identifier
- ✅ Activity summary
- ❌ Any sensitive fields (rejected with 400 error)

### What Email Contains:
- ✅ Human-readable summary
- ✅ Device identification
- ✅ Cookie names and domains
- ❌ Any credential values

## Configuration Control

You control:
1. **When reporting is enabled** (checkbox in Options)
2. **What device name is used** (text input in Options)
3. **Where reports are sent** (server URL in Options)
4. **When the server runs** (manual start/stop)

## Privacy Notes

- Extension still collects full cookie data locally (that's its purpose)
- Reporting feature is OPTIONAL and OFF by default
- You must explicitly enable it and set a device name
- Server runs locally under your control
- No third-party services involved (except Gmail for final delivery)
- You can disable reporting anytime without affecting core functionality
