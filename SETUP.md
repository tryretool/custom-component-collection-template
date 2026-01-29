# Quick Setup Guide for Retool

## You're Almost Ready! 🎉

The Mock Roleplay Dashboard component is fully built and configured. You just need to connect it to your Retool instance.

## Step 1: Initialize with Retool (Required)

Run this command in your terminal:

```bash
cd /Users/abc/Documents/FLABS/Apollo_Mock_Roleplay_Dashboard
npx retool-ccl init
```

You'll be prompted for:
- **Retool instance URL** (e.g., `https://yourcompany.retool.com`)
- **Authentication** (API token or login credentials)

This registers your component library with Retool.

## Step 2: Start Development Server

```bash
npm run dev
```

This will:
- Start a local development server
- Give you a URL to use in Retool
- Enable hot-reloading while you develop

## Step 3: Add to Retool App

1. In Retool, go to **Settings** → **Custom Component Libraries**
2. Click **Add Library** → **Development Mode**
3. Paste the URL from step 2
4. Find `MockRoleplayDashboard` in your component picker

## Step 4: Configure Data

In the component inspector, set up your models:

### Model: evaluationData
Paste the content from `sample-data.json` or connect to your database:

```javascript
{{ yourQuery.data.evaluation_json }}
```

### Model: metadata (optional)
```javascript
{{
  {
    staff_name: "Your Staff Name",
    staff_id: "EMP123",
    sop_name: "Hospital Price Comparison SOP",
    call_date: "2024-01-15",
    call_duration: "15:30",
    overall_status: "Completed"
  }
}}
```

## Alternative: Deploy to Production

Instead of dev mode, you can deploy directly:

```bash
npx retool-ccl deploy
```

This makes the component available permanently in your Retool instance.

## Need Help?

- See [README.md](file:///Users/abc/Documents/FLABS/Apollo_Mock_Roleplay_Dashboard/README.md) for complete documentation
- Check [sample-data.json](file:///Users/abc/Documents/FLABS/Apollo_Mock_Roleplay_Dashboard/sample-data.json) for data structure
- Retool docs: https://docs.retool.com/apps/guides/custom/custom-component-libraries
