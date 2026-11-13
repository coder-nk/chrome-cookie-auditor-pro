# Cookie Auditor Dashboard Server

This server provides a real-time web dashboard for viewing cookie audit reports.

## Setup

1. Install dependencies:
```bash
cd audit-server
npm install
```

2. Start the server:
```bash
npm start
```

3. Open the dashboard:
```
http://localhost:3000
```

The server will receive reports from the Chrome extension and display them in a beautiful web dashboard.

## Features

- **Real-time Dashboard**: View all audit reports in a web interface
- **Auto-refresh**: Dashboard updates automatically every 5 seconds
- **Statistics**: See total reports, devices, cookies, and domains
- **Search & Filter**: Search by device, domain, or cookie name
- **Device Filter**: Filter reports by device name
- **Detailed View**: Expand reports to see full details
- **Export**: Download reports as JSON
- **Delete**: Remove individual reports or clear all
- **No Email Required**: No Gmail configuration needed!

## Dashboard Features

### Overview Stats
- Total number of reports received
- Number of unique devices
- Total cookies tracked
- Number of unique domains

### Report Cards
Each report shows:
- Device name and timestamp
- Cookie count, domain count, changes detected
- Scan reason and browser info
- Expandable details with:
  - Domain list
  - Cookie names (with or without values based on config)
  - Cookie values (if configured to include)
  - Cookie attributes
  - Recent events
  - Paths

### Actions
- **Refresh**: Manually refresh the dashboard
- **Clear All**: Delete all reports
- **Export JSON**: Download all reports
- **Delete**: Remove individual reports
- **Auto-refresh**: Toggle automatic updates

## Testing

Test without the extension:
```bash
node test-report.js
```

This sends a test report and you'll see it appear in the dashboard.

## API Endpoints

- `POST /audit-report` - Receive audit reports from extension
- `GET /api/reports` - Get all reports
- `GET /api/reports/:id` - Get single report
- `DELETE /api/reports/:id` - Delete single report
- `DELETE /api/reports` - Clear all reports
- `GET /api/stats` - Get statistics

## Storage

Reports are stored in memory (for demo purposes). In production, you should:
- Use a database (MongoDB, PostgreSQL, etc.)
- Implement authentication
- Add HTTPS
- Set up proper logging

## Security Notes

- Dashboard runs on localhost by default
- No authentication (add authentication for production)
- Reports stored in memory (restart clears all data)
- Configure firewall if exposing to network
- Use HTTPS in production

## Production Deployment

For production use:

1. **Use a database** instead of in-memory storage
2. **Add authentication** to protect the dashboard
3. **Use HTTPS** with proper SSL certificates
4. **Set up logging** for audit trails
5. **Configure CORS** properly
6. **Use environment variables** for configuration

Example with MongoDB:
```bash
npm install mongodb
# Update server.js to use MongoDB instead of in-memory array
```
