let reports = [];
let filteredReports = [];
let autoRefreshInterval = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadReports();
  loadStats();
  setupEventListeners();
  startAutoRefresh();
});

// Event Listeners
function setupEventListeners() {
  document.getElementById('refresh-btn').addEventListener('click', () => {
    loadReports();
    loadStats();
  });

  document.getElementById('clear-btn').addEventListener('click', clearAllReports);
  
  document.getElementById('search').addEventListener('input', filterReports);
  
  document.getElementById('device-filter').addEventListener('change', filterReports);
  
  document.getElementById('export-btn').addEventListener('click', exportReports);
  
  document.getElementById('auto-refresh').addEventListener('change', (e) => {
    if (e.target.checked) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
  });
}

// Auto-refresh
function startAutoRefresh() {
  stopAutoRefresh();
  autoRefreshInterval = setInterval(() => {
    loadReports();
    loadStats();
  }, 5000);
}

function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
}

// Load Reports
async function loadReports() {
  try {
    const response = await fetch('/api/reports');
    reports = await response.json();
    filterReports();
  } catch (error) {
    console.error('Error loading reports:', error);
    document.getElementById('reports-container').innerHTML = 
      '<div class="no-reports">Error loading reports. Make sure the server is running.</div>';
  }
}

// Load Statistics
async function loadStats() {
  try {
    const response = await fetch('/api/stats');
    const stats = await response.json();
    
    document.getElementById('total-reports').textContent = stats.totalReports;
    document.getElementById('total-devices').textContent = stats.devices;
    document.getElementById('total-cookies').textContent = stats.totalCookies;
    document.getElementById('unique-domains').textContent = stats.uniqueDomains;
    
    // Update device filter
    const deviceFilter = document.getElementById('device-filter');
    const currentValue = deviceFilter.value;
    deviceFilter.innerHTML = '<option value="">All Devices</option>';
    stats.deviceList.forEach(device => {
      const option = document.createElement('option');
      option.value = device;
      option.textContent = device;
      deviceFilter.appendChild(option);
    });
    deviceFilter.value = currentValue;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Filter Reports
function filterReports() {
  const searchTerm = document.getElementById('search').value.toLowerCase();
  const deviceFilter = document.getElementById('device-filter').value;
  
  filteredReports = reports.filter(report => {
    const matchesSearch = !searchTerm || 
      report.deviceName?.toLowerCase().includes(searchTerm) ||
      report.domains?.some(d => d.toLowerCase().includes(searchTerm)) ||
      report.cookieNames?.some(c => c.toLowerCase().includes(searchTerm)) ||
      report.scanReason?.toLowerCase().includes(searchTerm);
    
    const matchesDevice = !deviceFilter || report.deviceName === deviceFilter;
    
    return matchesSearch && matchesDevice;
  });
  
  renderReports();
}

// Render Reports
function renderReports() {
  const container = document.getElementById('reports-container');
  
  if (filteredReports.length === 0) {
    container.innerHTML = '<div class="no-reports">No reports found. Start scanning cookies in the Chrome extension!</div>';
    return;
  }
  
  container.innerHTML = filteredReports.map(report => createReportCard(report)).join('');
  
  // Add delete button listeners
  document.querySelectorAll('.delete-report').forEach(btn => {
    btn.addEventListener('click', () => deleteReport(btn.dataset.id));
  });
  
  // Add expand button listeners
  document.querySelectorAll('.expand-report').forEach(btn => {
    btn.addEventListener('click', () => toggleDetails(btn.dataset.id));
  });
}

// Create Report Card
function createReportCard(report) {
  const isSensitive = report.reportConfig?.includesValues;
  const timestamp = new Date(report.timestamp || report.receivedAt).toLocaleString();
  
  return `
    <div class="report-card" id="report-${report.id}">
      ${isSensitive ? '<div class="sensitive-warning">⚠️ This report includes cookie values (sensitive data)</div>' : ''}
      
      <div class="report-header">
        <div class="report-title">
          <div class="device-name">📱 ${report.deviceName || 'Unknown Device'}</div>
        </div>
        <div class="report-actions">
          <button class="btn btn-small btn-secondary expand-report" data-id="${report.id}">
            📋 Details
          </button>
          <button class="btn btn-small btn-danger delete-report" data-id="${report.id}">
            🗑️
          </button>
        </div>
      </div>
      
      <div class="timestamp">🕐 ${timestamp}</div>
      
      <div class="report-meta">
        <div class="meta-item">
          <div class="meta-label">Cookies</div>
          <div class="meta-value">${report.cookieCount || 0}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Domains</div>
          <div class="meta-value">${report.domainCount || 0}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Changes</div>
          <div class="meta-value">${report.changesDetected || 0}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Scan Reason</div>
          <div class="meta-value">${report.scanReason || 'N/A'}</div>
        </div>
        ${report.browserInfo ? `
          <div class="meta-item">
            <div class="meta-label">Browser</div>
            <div class="meta-value">${report.browserInfo}</div>
          </div>
        ` : ''}
      </div>
      
      <div class="report-details" id="details-${report.id}" style="display: none;">
        ${report.domains && report.domains.length > 0 ? `
          <div class="report-section">
            <div class="section-title">Domains</div>
            <div class="tag-list">
              ${report.domains.map(d => `<span class="tag domain">${d}</span>`).join('')}
            </div>
            ${report.domainsTruncated ? `
              <div class="truncation-note">
                ⚠️ Showing ${report.domains.length} of ${report.totalDomains} domains
              </div>
            ` : ''}
          </div>
        ` : ''}
        
        ${report.cookieNames && report.cookieNames.length > 0 ? `
          <div class="report-section">
            <div class="section-title">Cookie Names ${isSensitive ? '(values included below)' : '(no values)'}</div>
            <div class="tag-list">
              ${report.cookieNames.map(c => `<span class="tag cookie">${c}</span>`).join('')}
            </div>
            ${report.cookieNamesTruncated ? `
              <div class="truncation-note">
                ⚠️ Showing ${report.cookieNames.length} of ${report.totalCookieNames} cookies
              </div>
            ` : ''}
          </div>
        ` : ''}
        
        ${report.cookiesWithValues && report.cookiesWithValues.length > 0 ? `
          <div class="report-section">
            <div class="sensitive-warning">⚠️ Cookie Values (Sensitive Data)</div>
            <div class="event-list">
              ${report.cookiesWithValues.map(c => `
                <div class="event-item">
                  <strong>${c.name}</strong> on ${c.domain}<br>
                  <code style="color: #e53e3e;">${c.value}</code>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${report.paths && report.paths.length > 0 ? `
          <div class="report-section">
            <div class="section-title">Cookie Paths</div>
            <div class="tag-list">
              ${report.paths.map(p => `<span class="tag">${p}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        
        ${report.cookieAttributes && report.cookieAttributes.length > 0 ? `
          <div class="report-section">
            <div class="section-title">Cookie Attributes</div>
            <div class="event-list">
              ${report.cookieAttributes.map(c => `
                <div class="event-item">
                  <strong>${c.name}</strong>: 
                  secure=${c.secure}, httpOnly=${c.httpOnly}, 
                  sameSite=${c.sameSite}, session=${c.session}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${report.recentEvents && report.recentEvents.length > 0 ? `
          <div class="report-section">
            <div class="section-title">Recent Events</div>
            <div class="event-list">
              ${report.recentEvents.map(e => `
                <div class="event-item ${e.type}">
                  <strong>${e.type}</strong>: ${e.cookieName} on ${e.domain}
                  ${e.timestamp ? `<br><small>🕐 ${new Date(e.timestamp).toLocaleString()}</small>` : ''}
                  ${e.cause ? `<br><small>Cause: ${e.cause}</small>` : ''}
                </div>
              `).join('')}
            </div>
            ${report.eventsTruncated ? `
              <div class="truncation-note">
                ⚠️ Showing ${report.recentEvents.length} of ${report.totalEvents} events
              </div>
            ` : ''}
          </div>
        ` : ''}
        
        ${report.note ? `
          <div class="report-section">
            <div style="color: #718096; font-style: italic;">${report.note}</div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// Toggle Details
function toggleDetails(reportId) {
  const details = document.getElementById(`details-${reportId}`);
  const button = document.querySelector(`.expand-report[data-id="${reportId}"]`);
  
  if (details.style.display === 'none') {
    details.style.display = 'block';
    button.textContent = '📋 Hide';
  } else {
    details.style.display = 'none';
    button.textContent = '📋 Details';
  }
}

// Delete Report
async function deleteReport(reportId) {
  if (!confirm('Delete this report?')) return;
  
  try {
    await fetch(`/api/reports/${reportId}`, { method: 'DELETE' });
    loadReports();
    loadStats();
  } catch (error) {
    console.error('Error deleting report:', error);
    alert('Failed to delete report');
  }
}

// Clear All Reports
async function clearAllReports() {
  if (!confirm('Delete ALL reports? This cannot be undone!')) return;
  
  try {
    await fetch('/api/reports', { method: 'DELETE' });
    loadReports();
    loadStats();
  } catch (error) {
    console.error('Error clearing reports:', error);
    alert('Failed to clear reports');
  }
}

// Export Reports
function exportReports() {
  const dataStr = JSON.stringify(filteredReports, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cookie-audit-reports-${new Date().toISOString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
