# Cookie Auditor Pro 3.0

A Chrome Manifest V3 extension for **local cookie inventory and controlled test-cookie diagnostics**.

It is designed to help developers understand which cookies exist on explicitly allowlisted domains, inspect cookie attributes, and observe cookie lifecycle changes without collecting authentication/session-cookie values.

## Important scope and privacy behavior

- Cookie names, domains, paths, flags and other metadata are inventoried for configured domains.
- Cookie change events contain metadata only.
- Cookie values are retained **only** for cookies whose names start with the configured test prefix (default: `audit_`).
- Exact names in the exclusion list always win. Excluded cookies are omitted from inventory, event history and test-cookie snapshots.
- Authentication/session cookie names are excluded by default, including `JSESSIONID`, `iPlanetDirectoryPro`, `AMAuthCookie` and `amlbcookie`.
- The extension does not export, import, synchronize, or replay browser authentication sessions.
- Data stays in `chrome.storage.local` in the current Chrome profile. It is not sent to a server and is not automatically synced to another computer.
- JSON export may contain values for your deliberately created test cookies. Protect the exported file.

Use only on domains you own or are explicitly authorized to audit. Do not add real login/session cookies to the test prefix.

## Features

1. **Automatic startup scan** after install/update and Chrome startup.
2. **Manual Scan now** button.
3. **Domain allowlist** with base-domain matching (for example, `cdac.in` includes `webmail.cdac.in`).
4. **Cookie metadata inventory**: name, domain, path, Secure, HttpOnly, SameSite, session, host-only, expiration and partition information.
5. **Exact-name exclusions** with case-insensitive matching and precedence over the test prefix.
6. **Test-cookie value snapshots** for non-excluded names matching a deliberate prefix.
7. **Cookie change history** with event cause and timestamp; values are never included in event history.
8. **Search/filter** inventory in the popup.
9. **JSON export** of settings, metadata inventory, event history and explicitly allowed test-cookie values.
10. **Clear local records** without disabling monitoring.
11. **Per-domain scan status and visible errors** to help diagnose permission/domain configuration issues.
12. **Options page** to manage domains, test prefix and excluded cookie names without editing JavaScript.
13. **Optional audit reporting** - Send audit data to your email for security monitoring with **granular control**:
    - **Local Storage:** ALL cookie data (including values) is ALWAYS saved locally for your analysis
    - **Email Reports:** YOU choose exactly what gets sent (cookie names, values, domains, events, etc.)
    - See [Audit Setup Guide](AUDIT_SETUP.md) for initial setup
    - See [Configuration Guide](CONFIGURATION_GUIDE.md) for detailed options
    - See [Quick Config](QUICK_CONFIG.md) for common presets

## Install

1. Download and extract the ZIP.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode**.
4. If an older Cookie Auditor version is installed, remove it first to avoid confusion.
5. Click **Load unpacked**.
6. Select the extracted `chrome-cookie-auditor-pro` folder (the folder containing `manifest.json`).
7. Pin the extension if desired.
8. Open a configured site, then open Cookie Auditor Pro and click **Scan now**.

## Configure

Open the extension popup and click the gear icon, or right-click the extension and choose **Options**.

### Add an excluded cookie name

In **Excluded cookie names**, add one exact name per line. Example:

```text
JSESSIONID
iPlanetDirectoryPro
AMAuthCookie
amlbcookie
MY_PRIVATE_TEST_COOKIE
```

Names are matched case-insensitively. Exclusions apply to metadata inventory, event history and test-cookie value snapshots. Save settings; the extension automatically rescans.

### Change the test-cookie prefix

Default:

```text
audit_
```

Only create disposable test cookies with this prefix. For example, a cookie named `audit_demo` can be included in the test-cookie value snapshot unless its name is excluded.

Changing the prefix does not make existing authentication cookies eligible unless their names happen to match it; keep exclusions in place and never deliberately use authentication cookie names as test cookies.

### Add a domain

In **Domain allowlist**, enter one base domain per line, without protocol or path:

```text
cdac.in
example.org
```

The extension's manifest also limits which sites Chrome permits it to access. For each new base domain outside the current `cdac.in` scope:

1. Open `manifest.json`.
2. Add exact HTTPS host permission entries under `host_permissions`, for example:

```json
"https://example.org/*",
"https://*.example.org/*"
```

3. Save `manifest.json`.
4. Open `chrome://extensions` and click **Reload** on Cookie Auditor Pro.
5. Add `example.org` to the Options page allowlist and save.

Do not add `<all_urls>` or broad unrelated permissions.

## Troubleshooting

### Popup shows zero cookies

1. Confirm the site is HTTPS and its hostname belongs to a configured base domain.
2. Check the Options page domain list (default is `cdac.in`).
3. Check `manifest.json` contains both the base-domain and wildcard-subdomain host permissions.
4. Reload the extension at `chrome://extensions`.
5. Open the target website in a tab, then click **Scan now**.
6. Check the popup's status/error line. A permission error usually means the manifest host permission does not cover the domain.
7. If the site uses a separate identity provider on a different base domain, it will not be scanned unless that domain is explicitly added to both the manifest and allowlist.

### Cookie changes do not appear

- Keep the extension enabled.
- Make sure the cookie belongs to an allowlisted domain.
- Check that the cookie name is not in the exclusion list.
- Use a disposable test cookie with the configured prefix to verify value snapshots.
- A cookie created before the extension starts is still found by **Scan now**; the event history only records changes observed while the extension is running.

### Where is the data stored?

In Chrome extension local storage for this browser profile. The data is not shared across devices. Use **Export JSON** for a local diagnostic report; the export can include values of deliberately prefixed test cookies.

### Audit reporting issues

See [Audit Setup Guide](AUDIT_SETUP.md) for troubleshooting email reports:
- Server not running
- Email configuration issues
- No emails received
- Understanding what data gets sent

## Documentation

### Core Documentation
- [README.md](README.md) - This file, main documentation
- [Install and usage instructions](#install) - How to install the extension

### Audit Reporting
- [AUDIT_SETUP.md](AUDIT_SETUP.md) - Initial setup for email reporting
- [CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md) - Detailed configuration options for local vs email data
- [QUICK_CONFIG.md](QUICK_CONFIG.md) - Quick reference and configuration presets
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and data flows
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Technical implementation details
- [CHANGES.md](CHANGES.md) - Changelog of audit reporting feature

### Audit Server
- [audit-server/README.md](audit-server/README.md) - Server setup instructions
- [audit-server/FLOW.md](audit-server/FLOW.md) - Data flow diagrams

## Data model

| Area | Stored content |
|---|---|
| Inventory | Cookie metadata only |
| Change events | Timestamp, event cause and cookie metadata only |
| Test-cookie snapshot | Metadata plus value for non-excluded prefix-matching test cookies |
| Settings | Domain allowlist, test prefix and excluded names |
| Export | All the above, with the same value restrictions |

## Project structure

```text
chrome-cookie-auditor-pro/
├── manifest.json
├── config.js
├── popup.html
├── options.html
├── README.md
└── src/
    ├── background.js
    ├── popup.js
    ├── popup.css
    ├── options.js
    └── options.css
```

## Permissions explained

- `cookies`: read cookie metadata and observe cookie changes.
- `storage`: save local settings, inventory and audit events.
- Host permissions: limited to `cdac.in` and its subdomains by default.

No network permission, remote endpoint, analytics, or third-party library is used.

## Limitations

- Chrome host permissions must cover every domain being audited.
- Chrome cookie APIs expose only cookies accessible under the extension's granted host permissions.
- The extension is a diagnostic inventory tool, not a browser-profile migration or single-sign-on product.
- Chrome local extension storage is not encrypted as a password vault. Keep your OS account protected and avoid sharing diagnostic exports.

## Version history

### 3.0.0
- Rebuilt popup and added dedicated Options page.
- Added editable domain allowlist, test prefix and excluded-name list.
- Added exact-name exclusions with precedence over test-prefix matching.
- Added per-domain scan status, manual scanning, inventory filtering and recent event view.
- Improved scan error reporting and serialized background updates.
- Added detailed README, installation and troubleshooting guide.
