# Mock Roleplay Evaluation Dashboard

A professional React component for evaluating mock roleplay calls in hospital settings, designed as a Retool custom component.

## Overview

This dashboard displays comprehensive evaluation data for mock roleplay sessions where:
- AI plays the role of a customer/patient
- Hospital staff practice handling situations using SOPs
- System generates structured evaluation feedback

## Features

### 📊 Complete Evaluation Display
- **Header Section**: Staff info, SOP name, overall status, and key metrics
- **Audio & Transcript Panel**: Placeholder for audio player and transcript viewer
- **Executive Summary**: Quick overview of SOP adherence, soft skills, and pressure handling
- **Red Flags**: Sorted by severity (High/Medium/Low) with evidence quotes
- **SOP Step-by-Step**: Table showing execution quality for each SOP step
- **Solutions & Alternatives**: Cards showing what was offered and impact
- **Strengths & Weaknesses**: Side-by-side comparison for easy coaching

### 🎨 Professional Design
- Clean, light theme with modern styling
- Color-coded severity and performance indicators
- Hover effects for interactive elements
- Responsive layout
- Easily scannable in 60-90 seconds

## Setup & Development

### Install Dependencies
```bash
npm install
```

### Development Mode
```bash
npm run dev
```

This will start the Retool CCL development server. Follow the on-screen instructions to connect your local component to Retool.

### Deploy to Retool
```bash
npm run deploy
```

## Using in Retool

### 1. Add Component to Retool
After running `npm run dev` or `npm run deploy`, the `MockRoleplayDashboard` component will be available in your Retool custom components.

### 2. Configure Data Models

The component expects two models:

#### Model 1: `evaluationData` (Required)
This should contain the evaluation JSON with the following structure:

```json
{
  "Red_Flags": [...],
  "SOP_Adherence": {...},
  "SOP_Steps": [...],
  "Soft_Skills": {...},
  "Pressure_Objection_Handling": {...},
  "Learning_Behavior_Engagement": {...},
  "Alternates_Solutions_Escalations_Discounts": [...],
  "Strengths_Pointers": [...],
  "Weakness_Pointers": [...]
}
```

See `sample-data.json` for a complete example.

#### Model 2: `metadata` (Optional)
Additional metadata about the call:

```json
{
  "staff_name": "John Doe",
  "staff_id": "EMP123",
  "sop_name": "Hospital Price Comparison SOP",
  "call_date": "2024-01-15",
  "call_duration": "15:30",
  "overall_status": "Completed",
  "transcript": "Full transcript text...",
  "audio_url": "https://example.com/audio.mp3"
}
```

### 3. Bind Data in Retool

In your Retool app:
1. Add the Mock Roleplay Dashboard custom component
2. Create a query or resource that fetches your evaluation data
3. In the component inspector, map:
   - `evaluationData` model → your evaluation query result
   - `metadata` model → your metadata (if available)

### Example Setup

```javascript
// Retool Query Example
// Query name: getEvaluation

SELECT 
  evaluation_json as evaluationData,
  json_build_object(
    'staff_name', staff_name,
    'staff_id', staff_id,
    'sop_name', sop_name,
    'call_date', call_date::text,
    'call_duration', call_duration,
    'overall_status', status
  ) as metadata
FROM mock_roleplay_evaluations
WHERE id = {{ table1.selectedRow.id }}
```

Then in the component:
- evaluationData: `{{ getEvaluation.data.evaluationData }}`
- metadata: `{{ getEvaluation.data.metadata }}`

## Data Structure Reference

### Red Flags
Each red flag includes:
- `severity`: "High" | "Medium" | "Low"
- `title`: Short description
- `evidence`: Quote from transcript
- `note`: Why it's concerning

### SOP Steps
Each step includes:
- `step_name`: Name of the SOP step
- `status`: "Covered" | "Partially Covered" | "Missed" | "Incorrect"
- `execution_tag`: "Very Weak" to "Very Strong"
- `note`: Evaluation notes
- `evidence`: Supporting quote

### Soft Skills
Evaluated dimensions:
- `communication_clarity_structure`
- `confidence`
- `empathy_kindness_respect_tone`
- `active_listening`

Each with `tag` and `note` fields.

### Solutions
Each solution includes:
- `short_title`: Brief name
- `note_what_was_offered`: Description
- `evaluation_about_timing_relevance`: Timing assessment
- `impact_judgement_tag`: "Positive" | "Neutral" | "Negative"

## Color Coding

- 🔴 **Red/Pink**: High severity, missed steps, very weak execution
- 🟠 **Orange**: Medium severity, weak execution
- 🟡 **Yellow**: Low severity, average performance
- 🟢 **Green**: Positive outcomes, good/strong execution
- 🔵 **Blue**: Neutral, informational

## File Structure

```
src/
├── index.tsx              # Main component
├── types.ts               # TypeScript definitions
└── Dashboard.module.css   # Styles
```

## Browser Compatibility

- Chrome (recommended)
- Safari
- Firefox
- Edge

## Support

For issues or questions about Retool custom components, visit:
https://docs.retool.com/apps/guides/custom/custom-component-libraries

## License

See LICENSE file for details.
