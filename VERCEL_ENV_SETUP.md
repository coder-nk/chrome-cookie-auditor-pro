# Vercel Environment Variables Setup

Follow these steps to configure your Vercel deployment with Supabase:

## Step 1: Go to Vercel Dashboard

1. Visit: https://vercel.com/dashboard
2. Find your project: **chrome-cookie-auditor-pro**
3. Click on the project name

## Step 2: Add Environment Variables

1. Click **Settings** in the top menu
2. Click **Environment Variables** in the left sidebar
3. Add the following two variables:

### Variable 1: SUPABASE_URL

- **Key**: `SUPABASE_URL`
- **Value**: `https://onxaphgsqodiqctawlzm.supabase.co`
- **Environments**: Check all (Production, Preview, Development)
- Click **Save**

### Variable 2: SUPABASE_ANON_KEY

- **Key**: `SUPABASE_ANON_KEY`
- **Value**: `sb_publishable_8xSyapTbCsvzyze1uVybOw_b8B3gSYGPublishable`
- **Environments**: Check all (Production, Preview, Development)
- Click **Save**

## Step 3: Redeploy

1. Go to the **Deployments** tab
2. Find the latest deployment
3. Click the **⋮** (three dots) menu
4. Click **Redeploy**
5. Confirm the redeployment

## Step 4: Verify Deployment

Once redeployment is complete:

1. Visit your Vercel URL: https://chrome-cookie-auditor-pro.vercel.app
2. You should see the dashboard homepage
3. The dashboard is now connected to Supabase!

## Step 5: Test with Extension

1. Reload your Chrome extension:
   - Go to `chrome://extensions`
   - Find "Cookie Auditor Pro"
   - Click the reload button 🔄

2. Configure the extension:
   - Click the extension icon
   - Click the gear icon (Options)
   - Make sure "Enable audit reporting" is checked
   - Set a device name (e.g., "My Laptop")
   - Save settings

3. Test:
   - Visit a site in your domain list (e.g., cdac.in)
   - Click **Scan now** in the extension
   - Check your Supabase dashboard: https://onxaphgsqodiqctawlzm.supabase.co
   - Go to **Table Editor** → **audit_reports**
   - You should see your report with cookie values!

---

## Your Credentials (for reference)

**Supabase Project URL:**
```
https://onxaphgsqodiqctawlzm.supabase.co
```

**Supabase Publishable Key:**
```
sb_publishable_8xSyapTbCsvzyze1uVybOw_b8B3gSYGPublishable
```

**Vercel App URL:**
```
https://chrome-cookie-auditor-pro.vercel.app
```

**Extension Server Config:**
```
https://chrome-cookie-auditor-pro.vercel.app/audit-report
```

---

## Troubleshooting

### Reports not appearing in Supabase

1. Check Vercel deployment logs for errors
2. Verify environment variables are set correctly
3. Make sure you ran the SQL to create the `audit_reports` table
4. Check browser console for any errors from the extension

### "Supabase not configured" error

- Environment variables not set in Vercel
- Need to redeploy after adding variables

### Table doesn't exist error

- Run the SQL from SUPABASE_SETUP.md to create the table
- Make sure you're looking at the correct Supabase project

---

**All set!** Follow the steps above to complete your deployment.
