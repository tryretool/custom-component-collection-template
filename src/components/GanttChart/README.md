# Gantt Chart

A Retool Custom Component that renders an interactive Gantt chart for visualizing tasks on a timeline. Supports multiple zoom levels, progress tracking, assignee avatars, drag-to-reorder, and inline task editing with comments.

## Features

- Weekly, monthly, quarterly, and yearly timeline zoom levels
- Progress bars with percentage labels and assignee avatar initials
- Task grouping by phase or category with color coding
- Drag-to-reorder tasks within the label column
- Click any task to open a detail modal — edit name, assignee, dates, progress, color, and description
- Add new tasks via a create modal (nothing is committed until you click **Create task**)
- Delete tasks with confirmation dialog and 8-second undo toast
- Quick-delete (✕) button on each row with centered confirmation overlay
- Auto-fit date range to task data, or set a fixed display window via inspector
- Optional chart title
- Sample data displayed automatically when no data source is connected
- Fully responsive — expands to fill its container

## Installation

1. In your Retool app, open the **Component** panel and add a **Custom Component**
2. Import this component from the repository
3. Connect your data source to the **Data source** field in the inspector
4. Set the **View mode** and optional **Title**, **Display from**, and **Display to** fields

## Properties

| Property | Type | Description |
|---|---|---|
| `tasks` | array | Array of task objects from your data source |
| `chartTitle` | string | Optional title displayed above the chart |
| `displayFrom` | string | Start of visible date range (YYYY-MM). Leave blank to auto-fit |
| `displayTo` | string | End of visible date range (YYYY-MM). Leave blank to auto-fit |
| `viewMode` | enumeration | Timeline zoom level: Weekly, Monthly, Quarterly, or Yearly |
| `selectedTask` | object | The last task the user clicked — use to drive other components |

## Data Source Format

Each row in your data source should include the following fields (column names are configurable via the **Column fields** inspector property):

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique task identifier |
| `name` | string | Task label shown in the left column |
| `start` | string | Start date in `YYYY-MM-DD` format |
| `end` | string | Due/end date in `YYYY-MM-DD` format |
| `progress` | number | Completion percentage (0–100) |
| `group` | string | Phase or group label (optional) |
| `assignee` | string | Assignee full name — initials shown as avatar (optional) |
| `description` | string | Task description shown in detail modal (optional) |
| `color` | string | Hex color override for the task bar (optional) |

## Events

| Event | Description |
|---|---|
| `taskClick` | Fires when a task row or bar is clicked. The clicked task is exposed via `selectedTask` |
| `taskAdd` | Fires when a new task is confirmed in the create modal. Wire to an INSERT query |
| `taskDelete` | Fires when a task is deleted. Wire to a DELETE query using `selectedTask.id` |

## Usage

### Connecting a data source

Set the **Data source** inspector field to a query that returns an array of task objects. The component reads `id`, `name`, `start`, `end`, `progress`, `group`, `assignee`, `description`, and `color` by default. If your column names differ, update the values in the **Column fields** inspector object.

### Saving edits back to your database

Edits made in the task detail modal update the component's internal `tasks` state immediately. To persist changes, listen for field-level changes by watching `selectedTask` and triggering an UPDATE query.

### Handling add and delete

Wire the `taskAdd` event to an INSERT query that reads from `selectedTask` to get the new task's values. Wire `taskDelete` to a DELETE query that uses `selectedTask.id` to identify the record to remove.

### Example SQL query

```sql
SELECT
  id::text,
  task_name   AS name,
  start_date::text AS start,
  due_date::text   AS end,
  progress,
  phase       AS group,
  assignee_name AS assignee,
  description,
  color
FROM project_tasks
ORDER BY start_date;
```

## Ideal Use Cases

- Project management dashboards
- Sprint planning and tracking
- Resource scheduling and capacity planning
- Roadmap visualization
- Any workflow that requires visualizing tasks over time

## Author

Created by [@angelikretool](https://github.com/angelikretool) for the Retool community.
