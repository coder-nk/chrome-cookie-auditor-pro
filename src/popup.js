const $ = id => document.getElementById(id);
const K = { settings: "cap_settings", inventory: "cap_inventory", events: "cap_events", tests: "cap_test_cookies", meta: "cap_meta" };
let currentInventory = {};

function message(text, kind = "") {
  $("message").textContent = text;
  $("message").className = kind;
}
function fmtDate(value) {
  if (!value) return "No scan yet";
  try { return new Date(value).toLocaleString(); } catch { return value; }
}
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function renderInventory(filter = "") {
  const host = $("inventory");
  host.replaceChildren();
  const entries = Object.values(currentInventory).filter(c =>
    `${c.name} ${c.domain} ${c.path}`.toLowerCase().includes(filter.toLowerCase()));
  if (!entries.length) {
    host.append(el("p", "empty", filter ? "No cookies match this filter." : "No cookies found in the configured domains."));
    return;
  }
  entries.sort((a,b) => a.domain.localeCompare(b.domain) || a.name.localeCompare(b.name));
  for (const c of entries.slice(0, 100)) {
    const row = el("div", "cookie-row");
    const left = el("div", "cookie-main");
    left.append(el("strong", "cookie-name", c.name), el("span", "cookie-domain", `${c.domain}${c.path}`));
    const flags = el("div", "flags");
    if (c.secure) flags.append(el("span", "flag", "Secure"));
    if (c.httpOnly) flags.append(el("span", "flag", "HttpOnly"));
    if (c.session) flags.append(el("span", "flag", "Session"));
    row.append(left, flags);
    host.append(row);
  }
  if (entries.length > 100) host.append(el("p", "empty", `Showing 100 of ${entries.length} matching cookies. Export JSON for the complete inventory.`));
}
function renderEvents(events) {
  const host = $("events");
  host.replaceChildren();
  if (!events.length) { host.append(el("p", "empty", "No cookie changes recorded yet.")); return; }
  for (const item of events.slice(0, 12)) {
    const row = el("div", "event-row");
    row.append(
      el("strong", "", `${item.type === "removed" ? "Removed" : "Changed"} · ${item.cookie?.name || "Unknown"}`),
      el("span", "", `${item.cookie?.domain || ""} · ${item.cause || "unknown"} · ${fmtDate(item.at)}`)
    );
    host.append(row);
  }
}
async function refresh() {
  const data = await chrome.storage.local.get(Object.values(K));
  const settings = data[K.settings] || {};
  const inventory = data[K.inventory] || {};
  const events = data[K.events] || [];
  const meta = data[K.meta] || {};
  currentInventory = inventory;
  $("inventoryCount").textContent = String(Object.keys(inventory).length);
  $("testCount").textContent = String(Object.keys(data[K.tests] || {}).length);
  $("eventCount").textContent = String(events.length);
  $("excludedCount").textContent = `${(settings.excludedCookieNames || AUDIT_DEFAULTS.excludedCookieNames).length} names excluded`;
  $("statusText").textContent = meta.lastError ? "Scan needs attention" : "Auditor is ready";
  $("statusDot").classList.toggle("bad", Boolean(meta.lastError));
  $("statusDetail").textContent = `Domains: ${(settings.domains || AUDIT_DEFAULTS.domains).join(", ")} · Test prefix: ${settings.testCookiePrefix || AUDIT_DEFAULTS.testCookiePrefix}`;
  $("scanTime").textContent = `Last scan: ${fmtDate(meta.lastScanAt)}`;
  $("errorText").textContent = meta.lastError || "";
  renderInventory($("search").value);
  renderEvents(events);
}
$("search").addEventListener("input", () => renderInventory($("search").value));
$("scan").addEventListener("click", async () => {
  $("scan").disabled = true;
  message("Scanning configured domains…");
  try {
    const result = await chrome.runtime.sendMessage({ type: "CAP_SCAN" });
    await refresh();
    message(result?.error ? `Scan failed: ${result.error}` : `Scan complete: ${result.inventoryCount} cookies found.`, result?.error ? "bad-text" : "ok");
  } catch (e) { message(e.message || String(e), "bad-text"); }
  finally { $("scan").disabled = false; }
});
$("settings").addEventListener("click", () => chrome.runtime.openOptionsPage());
$("export").addEventListener("click", async () => {
  const data = await chrome.storage.local.get(Object.values(K));
  const payload = {
    product: "Cookie Auditor Pro",
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    privacy: "Cookie values appear only in testCookieValues for non-excluded cookies matching the configured test prefix. The inventory and event log contain metadata only.",
    settings: data[K.settings] || {},
    metadata: data[K.meta] || {},
    inventoryMetadataOnly: data[K.inventory] || {},
    testCookieValues: data[K.tests] || {},
    eventsMetadataOnly: data[K.events] || []
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `cookie-auditor-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  a.click(); URL.revokeObjectURL(url);
  message("Export created. Store it securely; it may contain test-cookie values.", "ok");
});
$("clear").addEventListener("click", async () => {
  if (!confirm("Delete the local inventory, events and test-cookie snapshots? Monitoring will remain enabled.")) return;
  const result = await chrome.runtime.sendMessage({ type: "CAP_CLEAR" });
  await refresh();
  message(result?.error || "Local records cleared.", result?.error ? "bad-text" : "ok");
});
refresh().catch(e => message(`Could not read extension storage: ${e.message || e}`, "bad-text"));