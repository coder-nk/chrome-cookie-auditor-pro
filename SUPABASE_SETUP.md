# Supabase Setup Guide

This guide will help you set up Supabase for persistent storage of audit reports.

## Why Supabase?

✅ **Free tier**: 500MB PostgreSQL database  
✅ **Persistent storage**: Data never lost  
✅ **Always available**: No cold starts or spin-downs  
✅ **No credit card required**  
✅ **Works with any hosting platform**

---

## Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign up with **GitHub** (recommended) or email
4. Verify your email if needed

## Step 2: Create New Project

1. Click **"New Project"**
2. Fill in the details:
   - **Name**: `cookie-auditor` (or any name you like)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free
3. Click **"Create new project"**
4. Wait 2-3 minutes for the project to be created

## Step 3: Create Database Table

1. In your Supabase project, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Copy and paste this SQL:

```sql
-- Create audit_reports table
CREATE TABLE audit_reports (
  id TEXT PRIMARY KEY,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  device_name TEXT,
  cookie_count INTEGER DEFAULT 0,
  domain_count INTEGER DEFAULT 0,
  browser_info JSONB,
  timestamp TIMESTAMPTZ,
  domains TEXT[],
  cookies JSONB,
  events JSONB,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_received_at ON audit_reports(received_at DESC);
CREATE INDEX idx_device_name ON audit_reports(device_name);

-- Enable Row Level Security (RLS)
ALTER TABLE audit_reports ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations" ON audit_reports
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

4. Click **"Run"** (or press `Ctrl+Enter`)
5. You should see "Success. No rows returned"

## Step 4: Get Your API Credentials

1. Click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"** under Project Settings
3. Find and copy these two values:

   **Project URL**:
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon public key** (under "Project API keys"):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Step 5: Configure Your Server

### For Local Development:

Create a file `.env` in the `audit-server` folder:

```bash
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Then run with:
```bash
cd audit-server
npm install
node server.js
```

### For Vercel Deployment:

1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Environment Variables"**
3. Add two variables:
   - **Name**: `SUPABASE_URL`, **Value**: `https://xxxxxxxxxxxxx.supabase.co`
   - **Name**: `SUPABASE_ANON_KEY`, **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
4. Click **"Save"**
5. Redeploy your project

### For Render Deployment:

1. Go to your Render dashboard
2. Click on your web service
3. Click **"Environment"** in the left sidebar
4. Add two environment variables:
   - **Key**: `SUPABASE_URL`, **Value**: `https://xxxxxxxxxxxxx.supabase.co`
   - **Key**: `SUPABASE_ANON_KEY`, **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
5. Click **"Save Changes"**
6. Your service will automatically redeploy

## Step 6: Test the Setup

1. Start your server (locally or on your hosting platform)
2. Check the startup logs - you should see:
   ```
   ✓ Supabase connected
   ✓ Storage: Supabase (persistent)
   ```
3. Send a test audit report from your Chrome extension
4. Check Supabase:
   - Go to **"Table Editor"** in Supabase
   - Click on **"audit_reports"** table
   - You should see your report data!

## Troubleshooting

### "Supabase credentials not found" warning

- Make sure environment variables are set correctly
- Check for typos in variable names
- Restart your server after adding environment variables

### "Failed to process report" error

- Verify your Supabase project is active
- Check that the table was created correctly
- Make sure RLS policies are set up (see Step 3)

### Data not appearing in Supabase

- Check server logs for errors
- Verify API credentials are correct
- Make sure the extension is sending reports (check extension console)

## What Gets Stored

The server stores these fields for each audit report:

- `id` - Unique report identifier
- `received_at` - When the server received the report
- `device_name` - Name of the device sending the report
- `cookie_count` - Total number of cookies
- `domain_count` - Number of unique domains
- `browser_info` - Browser version and details
- `timestamp` - When the audit was performed
- `domains` - Array of domain names
- `cookies` - Full cookie data (names, metadata)
- `events` - Cookie change events
- `raw_data` - Complete original report data

## Benefits of Using Supabase

✅ **Persistent**: Data survives server restarts  
✅ **Searchable**: Query reports by device, date, domain  
✅ **Scalable**: Handles thousands of reports  
✅ **Secure**: Built-in authentication and RLS  
✅ **Free**: 500MB storage, plenty for audit data  
✅ **Backup**: Automatic daily backups on paid plans

## Next Steps

- Configure your Chrome extension to use the server URL
- Set up automated backups (Supabase Pro)
- Add authentication for the dashboard (optional)
- Create custom queries to analyze cookie patterns

---

**Need Help?**

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
