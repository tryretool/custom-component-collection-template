# 🎯 How to See Your Sample Data in the Dashboard

The dashboard is now redesigned with professional styling! To see your sample data from `sample-data.json`, follow these steps:

## Quick Setup (3 Steps)

### 1️⃣ Make Sure Dev Server is Running

The dev server should already be running. If not, run:
```bash
cd /Users/abc/Documents/FLABS/Apollo_Mock_Roleplay_Dashboard
npm run dev
```

### 2️⃣ Add Component to Retool

1. Open your Retool app
2. Go to **Settings** → **Custom Component Libraries**
3. Click **Add Library** → **Development Mode**
4. Paste the URL from the terminal (usually `http://localhost:3001`)
5. Drag "Mock Roleplay Dashboard" component onto your canvas

### 3️⃣ Configure the Data

**This is the crucial step!** In the Retool component inspector:

#### Option A: Paste Sample Data Directly

1. Select your Mock Roleplay Dashboard component
2. In the right panel, find the **Inspector** tab
3. Look for the `evaluationData` property/model
4. Click on it and paste the ENTIRE contents of `sample-data.json`

**To copy sample data:**
```bash
# Copy the file contents to clipboard
cat /Users/abc/Documents/FLABS/Apollo_Mock_Roleplay_Dashboard/sample-data.json | pbcopy
```

Then paste into the `evaluationData` field in Retool.

#### Option B: Connect to Query (Production Use)

If you have this data in a database:

```javascript
// In the evaluationData field, reference your query:
{{ yourDatabaseQuery.data }}
```

#### Optional: Add Metadata

For the `metadata` model (optional but recommended):

```javascript
{
  staff_name: "Training Call #001",
  staff_id: "EMP123",
  sop_name: "Hospital Price Comparison",
  call_date: "Jan 15, 2026",
  call_duration: "8:42 min",
  overall_status: "Completed",
  audio_url: "https://example.com/audio.mp3",
  transcript: "Full transcript text here..."
}
```

## ✅ What You Should See

Once configured, the dashboard will display:

- **Header**: "Staff Evaluation Report" with staff info and status badges
- **Audio/Transcript Panel**: Placeholder for audio player
- **Summary Cards**: 4 cards showing SOP Adherence, Soft Skills, and Pressure Handling
- **Red Flags**: 3 red flag items (1 High, 2 Medium) in expandable cards
- **SOP Execution Table**: All 6 SOP steps with status and execution tags
- **Solutions**: 3 solution cards with timing notes
- **Strengths/Weaknesses**: Two-column layout with bullet points

## 🎨 Design Features

The new design includes:
- ✅ Clean white cards with subtle shadows
- ✅ Professional color-coded badges (green, yellow, red)
- ✅ Proper spacing and typography
- ✅ Responsive grid layouts
- ✅ Status icons and visual indicators

## 🐛 Troubleshooting

**"I see the empty state message"**
- You haven't configured the `evaluationData` model yet
- Follow step 3️⃣ above to paste the sample data

**"Component not showing up"**
- Make sure `npm run dev` is running
- Check the terminal for any errors
- Verify the development URL is correct in Retool settings

**"Data shows but styling is off"**
- Hard refresh your browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Check the browser console for any CSS errors

## 📖 Next Steps

1. Test with the sample data
2. Customize the colors/styling in `Dashboard.module.css` if needed
3. Connect to your real database/API
4. Deploy with `npx retool-ccl deploy` when ready for production
