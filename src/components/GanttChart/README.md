# Gantt Chart

A timeline visualization component for Retool. Displays tasks as horizontal bars across a date range with support for grouping, progress tracking, and day/week/month zoom levels.

## Features

- Day, week, and month view modes
- Progress bars per task (0–100%)
- Group/phase labeling
- Today marker
- Click-to-select task (exposes `selectedTask` model value)
- `taskClick` event for triggering Retool queries
- Custom per-task colors or auto-assigned palette
- Horizontal scroll for long timelines
- Dark theme, styled to match Retool

## Installation

1. Clone the [custom-component-collection-template](https://github.com/tryretool/custom-component-collection-template)
2. Copy this folder into `src/components/GanttChart/`
3. Add the export to `src/index.tsx`:
   ```ts
   export { GanttChart } from "./components/GanttChart";
   ```
4. Run `npx retool-ccl dev` to preview in Retool

## Model inputs

| Property   | Type     | Description |
|------------|----------|-------------|
| `tasks`    | array    | Array of task objects (see schema below) |
| `viewMode` | string   | `"day"`, `"week"` (default), or `"month"` |

### Task schema

```json
{
  "id": "task-1",
  "name": "Design mockups",
  "start": "2024-01-01",
  "end": "2024-01-14",
  "progress": 75,
  "group": "Phase 1",
  "color": "#6BBAFF"
}
```

| Field      | Type   | Required | Description |
|------------|--------|----------|-------------|
| `id`       | string | yes      | Unique identifier |
| `name`     | string | yes      | Task label shown in the sidebar |
| `start`    | string | yes      | Start date `YYYY-MM-DD` |
| `end`      | string | yes      | End date `YYYY-MM-DD` |
| `progress` | number | no       | Completion percentage 0–100 |
| `group`    | string | no       | Groups tasks under a phase label |
| `color`    | string | no       | Hex color for the bar (auto-assigned if omitted) |

## Model outputs

| Property       | Type   | Description |
|----------------|--------|-------------|
| `selectedTask` | object | The task object the user last clicked |

## Events

| Event       | When it fires |
|-------------|---------------|
| `taskClick` | User clicks a task bar |

## Example query binding

Bind `{{ yourQuery.data }}` to the `tasks` model input directly. The component expects the same column names as the schema above — rename columns in your query if needed.

```sql
SELECT
  id::text,
  task_name AS name,
  start_date::text AS start,
  end_date::text AS end,
  progress,
  phase AS group
FROM project_tasks
ORDER BY start_date;
```
