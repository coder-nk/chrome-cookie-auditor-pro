# Architecture: Local Storage vs Email Reports

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Chrome Browser                              │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Cookie Auditor Pro Extension                    │  │
│  │                                                              │  │
│  │  ┌────────────────────────────────────────────────────┐     │  │
│  │  │  background.js - Cookie Scanner                    │     │  │
│  │  │  - Monitors all cookies                            │     │  │
│  │  │  - Captures values, metadata, events               │     │  │
│  │  └────────────────┬───────────────────────────────────┘     │  │
│  │                   │                                          │  │
│  │                   ▼                                          │  │
│  │  ┌────────────────────────────────────────────────────┐     │  │
│  │  │  chrome.storage.local                              │     │  │
│  │  │  ✓ ALL cookie values (always saved)                │     │  │
│  │  │  ✓ ALL metadata (always saved)                     │     │  │
│  │  │  ✓ ALL events (always saved)                       │     │  │
│  │  │  ✓ Settings & configuration                        │     │  │
│  │  └────────────────┬───────────────────────────────────┘     │  │
│  │                   │                                          │  │
│  │                   ├─────────────────┐                        │  │
│  │                   │                 │                        │  │
│  │                   ▼                 ▼                        │  │
│  │  ┌──────────────────────┐   ┌──────────────────────┐        │  │
│  │  │  popup.js            │   │  sendAuditReport()   │        │  │
│  │  │  - View all data     │   │  - Read config       │        │  │
│  │  │  - Export JSON       │   │  - Filter data       │        │  │
│  │  │  - Filter/search     │   │  - Build report      │        │  │
│  │  └──────────────────────┘   └──────────┬───────────┘        │  │
│  │                                        │                     │  │
│  └────────────────────────────────────────┼─────────────────────┘  │
│                                           │                        │
└───────────────────────────────────────────┼────────────────────────┘
                                            │ HTTP POST
                                            │ (configured data only)
                                            ▼
                              ┌──────────────────────────┐
                              │  Audit Server            │
                              │  (localhost:3000)        │
                              │                          │
                              │  - Validates report      │
                              │  - Checks config         │
                              │  - Formats email         │
                              │  - Adds warnings         │
                              └──────────┬───────────────┘
                                        │ SMTP
                                        ▼
                              ┌──────────────────────────┐
                              │  Gmail SMTP Server       │
                              │  - TLS encryption        │
                              │  - Sends to recipient    │
                              └──────────┬───────────────┘
                                        │
                                        ▼
                              ┌──────────────────────────┐
                              │  Email Inbox             │
                              │  snithish006@gmail.com   │
                              │                          │
                              │  - Configured data only  │
                              │  - Device identification │
                              │  - Activity summary      │
                              └──────────────────────────┘
```

## Data Flow: Local Storage (Always Full)

```
Cookie Scan
    │
    ├─→ Cookie: { name: "session_id", value: "abc123xyz...", domain: "cdac.in", ... }
    ├─→ Cookie: { name: "user_pref", value: "theme=dark", domain: "cdac.in", ... }
    └─→ Cookie: { name: "auth_token", value: "Bearer xyz...", domain: "cdac.in", ... }
    │
    ▼
chrome.storage.local (100% saved)
    │
    ├─→ cap_inventory: {
    │       "cookie_1": { name: "session_id", value: "abc123xyz...", ✓ }
    │       "cookie_2": { name: "user_pref", value: "theme=dark", ✓ }
    │       "cookie_3": { name: "auth_token", value: "Bearer xyz...", ✓ }
    │   }
    │
    ├─→ cap_events: [
    │       { type: "set", cookie: {...}, at: "2026-11-13...", ✓ }
    │   ]
    │
    └─→ cap_settings: {
            localStorageConfig: { saveCookieValues: true, ... ✓ }
        }
```

## Data Flow: Email Reports (Configurable)

### Safe Configuration (No Values)

```
Cookie Scan (same data as above)
    │
    ▼
sendAuditReport()
    │
    ├─ Read emailReportConfig
    │  - includeCookieValues: false  ❌
    │  - includeCookieNames: true    ✓
    │  - includeDomains: true        ✓
    │
    ├─ Build filtered report:
    │  {
    │    deviceName: "Home-Laptop",
    │    cookieCount: 3,
    │    cookieNames: ["session_id", "user_pref", "auth_token"],  ✓ names only
    │    domains: ["cdac.in"],
    │    note: "No cookie values included"
    │  }
    │
    ▼
Email Report:
    Device: Home-Laptop
    Cookies: 3
    Names: session_id, user_pref, auth_token  ✓ (no values)
    Domain: cdac.in
```

### Full Configuration (With Values) ⚠️

```
Cookie Scan (same data as above)
    │
    ▼
sendAuditReport()
    │
    ├─ Read emailReportConfig
    │  - includeCookieValues: true   ⚠️
    │  - includeCookieNames: true    ✓
    │  - includeDomains: true        ✓
    │
    ├─ Build full report:
    │  {
    │    deviceName: "Home-Laptop",
    │    cookiesWithValues: [
    │      { name: "session_id", value: "abc123xyz...", domain: "cdac.in" },  ⚠️
    │      { name: "user_pref", value: "theme=dark", domain: "cdac.in" },     ⚠️
    │      { name: "auth_token", value: "Bearer xyz...", domain: "cdac.in" }  ⚠️
    │    ],
    │    note: "WARNING: This report includes cookie values"
    │  }
    │
    ▼
Email Report:
    Subject: ⚠️ [SENSITIVE] Cookie Audit: Home-Laptop
    
    ⚠️ COOKIE VALUES:
    - session_id on cdac.in: abc123xyz...
    - user_pref on cdac.in: theme=dark
    - auth_token on cdac.in: Bearer xyz...
```

## Configuration Decision Tree

```
                    User Scans Website
                           │
                           ▼
                   All Data Captured
                           │
                           ▼
                  ┌─────────────────┐
                  │ Always Saved    │
                  │ Locally         │
                  └─────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │ Audit Reporting        │
              │ Enabled?               │
              └───┬────────────────┬───┘
                  │                │
            NO ◄──┘                └──► YES
            │                             │
            ▼                             ▼
     ┌──────────────┐      ┌─────────────────────────┐
     │ Stop here    │      │ Check emailReportConfig │
     │ (local only) │      └────────┬────────────────┘
     └──────────────┘               │
                                    ▼
                        ┌───────────────────────────┐
                        │ includeCookieValues?      │
                        └────┬──────────────────┬───┘
                             │                  │
                       NO ◄──┘                  └──► YES ⚠️
                       │                             │
                       ▼                             ▼
            ┌──────────────────────┐    ┌───────────────────────┐
            │ Safe Report:         │    │ Sensitive Report:     │
            │ - Names only         │    │ - Names + Values ⚠️   │
            │ - Domains            │    │ - Full data           │
            │ - Counts             │    │ - Warning subject     │
            └──────────┬───────────┘    └──────────┬────────────┘
                       │                           │
                       └─────────┬─────────────────┘
                                 │
                                 ▼
                          Send to Email
```

## Storage Comparison

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATA STORAGE MATRIX                         │
├─────────────────────┬───────────────────┬───────────────────────┤
│ Data Type           │ Local Storage     │ Email Report          │
├─────────────────────┼───────────────────┼───────────────────────┤
│ Cookie Values       │ ✓ Always          │ ? Configurable ⚠️     │
│ Cookie Names        │ ✓ Always          │ ? Configurable ✓      │
│ Domains             │ ✓ Always          │ ? Configurable ✓      │
│ Paths               │ ✓ Always          │ ? Configurable        │
│ Expiration Dates    │ ✓ Always          │ ? Configurable        │
│ Secure Flag         │ ✓ Always          │ ? Configurable        │
│ HttpOnly Flag       │ ✓ Always          │ ? Configurable        │
│ SameSite            │ ✓ Always          │ ? Configurable        │
│ Cookie Events       │ ✓ Always          │ ? Configurable ✓      │
│ Event Details       │ ✓ Always          │ ? Configurable        │
│ Timestamps          │ ✓ Always          │ ? Configurable ✓      │
│ Device Name         │ ✓ Always          │ ✓ Always              │
│ Browser Info        │ ✓ Always          │ ? Configurable ✓      │
└─────────────────────┴───────────────────┴───────────────────────┘

Legend:
✓ Always = Always included
? Configurable = User chooses via checkboxes
⚠️ = Sensitive data (default: OFF)
```

## Configuration Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    Configuration Sources                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. config.js (AUDIT_DEFAULTS)                                 │
│     ↓                                                           │
│     Default settings for new installations                      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  2. chrome.storage.local (cap_settings)                        │
│     ↓                                                           │
│     User's saved preferences from Options page                  │
│     (overrides defaults)                                        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  3. Options UI (checkboxes)                                    │
│     ↓                                                           │
│     Visual interface to modify settings                         │
│     Saves to chrome.storage.local on "Save"                    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  4. Runtime (getSettings())                                    │
│     ↓                                                           │
│     Merges defaults + saved settings                            │
│     Used by background.js for scanning & reporting              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                       Security Layers                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: Default Configuration                                │
│  - includeCookieValues: false (safe by default)                │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 2: UI Warnings                                          │
│  - "⚠️ Sensitive - not recommended" label                      │
│  - Yellow warning box in Options                                │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 3: Confirmation Dialog                                  │
│  - Shown when enabling cookie values                            │
│  - User must explicitly confirm                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 4: Report Metadata                                      │
│  - reportConfig object shows what's included                    │
│  - Server can validate                                          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 5: Server Validation                                    │
│  - Checks reportConfig.includesValues                           │
│  - Rejects unexpected sensitive fields                          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 6: Email Indicators                                     │
│  - Subject: "⚠️ [SENSITIVE]" when values included              │
│  - Body includes configuration summary                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Component Interaction

```
┌──────────────┐
│  Options UI  │───┐
└──────────────┘   │
                   │ Save Settings
┌──────────────┐   │
│  config.js   │───┼─→ ┌─────────────────────┐
└──────────────┘   │   │ chrome.storage.local│
                   │   │ - Settings          │
┌──────────────┐   │   │ - Local data        │
│ User Action  │───┘   │ - Email config      │
└──────────────┘       └──────────┬──────────┘
                                  │
                                  │ Read on scan
                                  ▼
                       ┌──────────────────────┐
                       │   background.js      │
                       │   - getSettings()    │
                       │   - scan()           │
                       │   - sendAuditReport()│
                       └──────────┬───────────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │                            │
                    ▼                            ▼
         ┌──────────────────┐       ┌────────────────────┐
         │ Local Storage    │       │ Audit Server       │
         │ (all data)       │       │ (filtered data)    │
         └──────────────────┘       └────────┬───────────┘
                                             │
                                             ▼
                                  ┌─────────────────────┐
                                  │ Email Recipient     │
                                  │ (configured data)   │
                                  └─────────────────────┘
```

## Summary

- **Two independent paths:** Local (full) + Email (filtered)
- **Always safe:** Local storage captures everything
- **User controlled:** Email reports configurable
- **Security first:** Multiple warning layers
- **Flexible:** Granular control over transmission
- **Transparent:** Configuration included in reports
