import { FC, useMemo, useState, useCallback, useRef, useLayoutEffect, useEffect } from "react";
import { Retool } from "@tryretool/custom-component-support";
import styles from "./GanttChart.module.css";

// ─── Types ───────────────────────────────────────────────────────────────────

type Task = {
  id: string;
  name: string;
  start: string;    // "YYYY-MM-DD"
  end: string;      // "YYYY-MM-DD"
  progress?: number; // 0–100
  group?: string;
  color?: string;
  assignee?: string;
  description?: string;
};

type Comment = {
  id: string;
  taskId: string;
  author: string;
  text: string;
  timestamp: string;
};

type Column = { label: string; x: number; width: number };

// ─── Constants ───────────────────────────────────────────────────────────────

const ROW_HEIGHT    = 48;
const HEADER_HEIGHT = 44;
const LABEL_WIDTH   = 200;
const BAR_HEIGHT    = 24;
const BAR_RADIUS    = 6;

const PALETTE = [
  "#6BBAFF", "#8B7EFF", "#2EC98A", "#F59E0B",
  "#EF4444", "#9B72CF", "#34d399", "#f87171",
];

const DAY_WIDTH: Record<string, number> = { month: 8, week: 24, quarter: 4, year: 1 };

const AVATAR_COLORS = [
  "#7C3AED", "#0284C7", "#059669", "#D97706",
  "#DC2626", "#DB2777", "#4F46E5", "#0D9488",
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const SAMPLE_TASKS: Record<string, unknown>[] = [
  { id: "1", name: "Project Kickoff",        start: "2026-04-01", end: "2026-04-03", progress: 100, group: "Phase 1", assignee: "Alice Chen",    description: "Align stakeholders and confirm project scope." },
  { id: "2", name: "Requirements Gathering", start: "2026-04-03", end: "2026-04-10", progress: 80,  group: "Phase 1", assignee: "Bob Martinez",   description: "Document functional and non-functional requirements." },
  { id: "3", name: "Design Mockups",         start: "2026-04-08", end: "2026-04-18", progress: 45,  group: "Phase 1", assignee: "Carol Liu",      description: "Produce high-fidelity designs for all key screens." },
  { id: "4", name: "Backend API",            start: "2026-04-14", end: "2026-04-28", progress: 20,  group: "Phase 2", assignee: "David Park",     description: "Build REST endpoints and authentication layer." },
  { id: "5", name: "Frontend Build",         start: "2026-04-18", end: "2026-05-02", progress: 10,  group: "Phase 2", assignee: "Eva Svensson",   description: "Implement UI components and wire up API calls." },
  { id: "6", name: "Database Schema",        start: "2026-04-14", end: "2026-04-21", progress: 60,  group: "Phase 2", assignee: "Frank Okafor",   description: "Design and migrate production database schema." },
  { id: "7", name: "Integration Testing",    start: "2026-05-01", end: "2026-05-10", progress: 0,   group: "Phase 3", assignee: "Grace Kim",      description: "End-to-end tests across all integrated services." },
  { id: "8", name: "UAT",                    start: "2026-05-08", end: "2026-05-16", progress: 0,   group: "Phase 3", assignee: "Henry Russo",    description: "User acceptance testing with pilot group." },
  { id: "9", name: "Deployment",             start: "2026-05-15", end: "2026-05-17", progress: 0,   group: "Phase 3", assignee: "Alice Chen",     description: "Production rollout with rollback plan in place." },
];

// ─── Date helpers ─────────────────────────────────────────────────────────────

const parseDate  = (s: string) => new Date(s + "T00:00:00");
const diffDays   = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86_400_000);
const addDays    = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const formatDate = (s: string) => parseDate(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function buildColumns(start: Date, end: Date, mode: string): Column[] {
  const dw   = DAY_WIDTH[mode] ?? 24;
  const cols: Column[] = [];

  if (mode === "month") {
    let cur = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cur < end) {
      const next = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
      const x    = Math.max(0, diffDays(start, cur)) * dw;
      const days = Math.min(diffDays(cur, next), diffDays(start, end) - Math.max(0, diffDays(start, cur)));
      const w    = days * dw;
      if (w > 0) cols.push({ label: cur.toLocaleDateString("en-US", { month: "short", year: "numeric" }), x, width: w });
      cur = next;
    }
  } else if (mode === "week") {
    const multiYear = start.getFullYear() !== end.getFullYear();
    let cur = new Date(start);
    const dow = cur.getDay();
    cur = addDays(cur, dow === 0 ? -6 : 1 - dow);
    while (cur < end) {
      const next    = addDays(cur, 7);
      const weekEnd = addDays(cur, 6);
      const x = Math.max(0, diffDays(start, cur)) * dw;
      const w = Math.min(7, diffDays(start, end) - diffDays(start, cur)) * dw;
      if (w > 0) {
        const startMo = cur.toLocaleDateString("en-US", { month: "short" });
        const startDy = cur.getDate();
        const endMo   = weekEnd.toLocaleDateString("en-US", { month: "short" });
        const endDy   = weekEnd.getDate();
        const sameMonth = cur.getMonth() === weekEnd.getMonth();
        const rangeStr  = sameMonth
          ? `${startMo} ${startDy}–${endDy}`
          : `${startMo} ${startDy}–${endMo} ${endDy}`;
        // Only append year when the range spans multiple calendar years
        const yearStr = multiYear ? ` '${weekEnd.getFullYear().toString().slice(2)}` : "";
        cols.push({ label: rangeStr + yearStr, x, width: w });
      }
      cur = next;
    }
  } else if (mode === "quarter") {
    // start/end are already snapped to quarter boundaries by the caller
    const yearStart = start.getFullYear();
    const yearEnd   = end.getFullYear();
    for (let yr = yearStart; yr <= yearEnd; yr++) {
      for (let q = 0; q < 4; q++) {
        const qStart = new Date(yr, q * 3, 1);
        const qEnd   = new Date(yr, q * 3 + 3, 1);
        if (qEnd <= start || qStart >= end) continue;
        const x = diffDays(start, qStart) * dw;   // always >= 0 — start is snapped
        const w = diffDays(qStart, qEnd) * dw;     // full quarter width, no clipping needed
        cols.push({ label: `Q${q + 1} ${yr}`, x, width: w });
      }
    }
  } else {
    // year
    let cur = new Date(start.getFullYear(), 0, 1);
    while (cur < end) {
      const next = new Date(cur.getFullYear() + 1, 0, 1);
      const x    = Math.max(0, diffDays(start, cur)) * dw;
      const days = Math.min(diffDays(cur, next), diffDays(start, end) - Math.max(0, diffDays(start, cur)));
      const w    = days * dw;
      if (w > 0) cols.push({ label: `${cur.getFullYear()}`, x, width: w });
      cur = next;
    }
  }
  return cols;
}

function getWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day  = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

// ─── Task Detail Modal ────────────────────────────────────────────────────────

const Modal: FC<{
  task: Task;
  comments: Comment[];
  onClose: () => void;
  onAddComment: (text: string, author: string) => void;
  onUpdateTask: (fields: Partial<Task>) => void;
  onDeleteTask: () => void;
  color: string;
}> = ({ task, comments, onClose, onAddComment, onUpdateTask, onDeleteTask, color }) => {
  const [draft,          setDraft]          = useState("");
  const [author,         setAuthor]         = useState("You");
  const [confirmDelete,  setConfirmDelete]  = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const taskComments = comments.filter(c => c.taskId === task.id);
  const progress = Math.min(100, Math.max(0, task.progress ?? 0));

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onAddComment(text, author.trim() || "You");
    setDraft("");
    inputRef.current?.focus();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.modalHeader} style={{ borderLeftColor: color }}>
          {task.group && <span className={styles.modalGroup}>{task.group}</span>}
          <input
            className={styles.modalTitleInput}
            value={task.name}
            onChange={e => onUpdateTask({ name: e.target.value })}
            placeholder="Task name"
          />
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        {/* Editable meta grid */}
        <div className={styles.modalMeta}>
          <div className={styles.metaItem}>
            <label className={styles.metaLabel}>Assignee</label>
            <input
              className={styles.metaInput}
              value={task.assignee ?? ""}
              placeholder="Unassigned"
              onChange={e => onUpdateTask({ assignee: e.target.value })}
            />
          </div>
          <div className={styles.metaItem}>
            <label className={styles.metaLabel}>Progress</label>
            <div className={styles.progressRow}>
              <input
                className={styles.metaInput}
                type="number"
                min={0}
                max={100}
                value={progress}
                onChange={e => onUpdateTask({ progress: Math.min(100, Math.max(0, Number(e.target.value))) })}
              />
              <span className={styles.progressPct}>%</span>
            </div>
          </div>
          <div className={styles.metaItem}>
            <label className={styles.metaLabel}>Start</label>
            <input
              className={styles.metaInput}
              type="date"
              value={task.start}
              onChange={e => onUpdateTask({ start: e.target.value })}
            />
          </div>
          <div className={styles.metaItem}>
            <label className={styles.metaLabel}>Due Date</label>
            <input
              className={styles.metaInput}
              type="date"
              value={task.end}
              onChange={e => onUpdateTask({ end: e.target.value })}
            />
          </div>
          <div className={styles.metaItem}>
            <label className={styles.metaLabel}>Bar color</label>
            <div className={styles.colorRow}>
              <input
                type="color"
                className={styles.colorPicker}
                value={task.color ?? color}
                onChange={e => onUpdateTask({ color: e.target.value })}
              />
              <span className={styles.colorHex}>{(task.color ?? color).toUpperCase()}</span>
              {task.color && (
                <button className={styles.colorReset} onClick={() => onUpdateTask({ color: undefined })}>Reset</button>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className={styles.modalProgressTrack}>
          <div className={styles.modalProgressFill} style={{ width: `${progress}%`, background: color }} />
        </div>

        {/* Description */}
        <div className={styles.modalSection}>
          <label className={styles.sectionLabel}>Description</label>
          <textarea
            className={styles.descriptionTextarea}
            value={task.description ?? ""}
            placeholder="Add a description…"
            rows={3}
            onChange={e => onUpdateTask({ description: e.target.value })}
          />
        </div>

        {/* Comments */}
        <div className={styles.modalSection}>
          <span className={styles.sectionLabel}>Comments ({taskComments.length})</span>
          <div className={styles.commentList}>
            {taskComments.length === 0 && (
              <p className={styles.noComments}>No comments yet. Be the first to add one.</p>
            )}
            {taskComments.map(c => (
              <div key={c.id} className={styles.comment}>
                <div className={styles.commentHeader}>
                  <span className={styles.commentAuthor}>{c.author}</span>
                  <span className={styles.commentTime}>{c.timestamp}</span>
                </div>
                <p className={styles.commentText}>{c.text}</p>
              </div>
            ))}
          </div>

          {/* New comment */}
          <div className={styles.commentInput}>
            <input
              className={styles.authorInput}
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="Your name"
            />
            <textarea
              ref={inputRef}
              className={styles.commentTextarea}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Add a comment…"
              rows={2}
              onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
            />
            <button
              className={styles.commentSubmit}
              style={{ background: color }}
              onClick={submit}
              disabled={!draft.trim()}
            >
              Comment
            </button>
          </div>
        </div>

        {/* Delete */}
        <div className={styles.modalSection}>
          {confirmDelete ? (
            <div className={styles.deleteConfirm}>
              <span className={styles.deleteWarning}>This will remove the task. If connected to a data source, wire the <code>taskDelete</code> event to your DELETE query.</span>
              <div className={styles.deleteActions}>
                <button className={styles.deleteCancelBtn} onClick={() => setConfirmDelete(false)}>Cancel</button>
                <button className={styles.deleteConfirmBtn} onClick={onDeleteTask}>Yes, delete</button>
              </div>
            </div>
          ) : (
            <button className={styles.deleteBtn} onClick={() => setConfirmDelete(true)}>
              Delete this task
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

// ─── Add Task Modal ───────────────────────────────────────────────────────────

const AddTaskModal: FC<{
  draft: Partial<Task>;
  defaultColor: string;
  onClose: () => void;
  onCreate: (task: Task) => void;
}> = ({ draft: initialDraft, defaultColor, onClose, onCreate }) => {
  const [draft, setDraft] = useState<Partial<Task>>(initialDraft);
  const update = (fields: Partial<Task>) => setDraft(prev => ({ ...prev, ...fields }));

  const canCreate = !!(draft.name?.trim() && draft.start && draft.end);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.modalHeader} style={{ borderLeftColor: draft.color ?? defaultColor }}>
          <span className={styles.modalGroup}>New task</span>
          <input
            className={styles.modalTitleInput}
            value={draft.name ?? ""}
            onChange={e => update({ name: e.target.value })}
            placeholder="Task name"
            autoFocus
          />
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        {/* Meta grid */}
        <div className={styles.modalMeta}>
          <div className={styles.metaItem}>
            <label className={styles.metaLabel}>Assignee</label>
            <input
              className={styles.metaInput}
              value={draft.assignee ?? ""}
              placeholder="Unassigned"
              onChange={e => update({ assignee: e.target.value })}
            />
          </div>
          <div className={styles.metaItem}>
            <label className={styles.metaLabel}>Group / Phase</label>
            <input
              className={styles.metaInput}
              value={draft.group ?? ""}
              placeholder="e.g. Phase 1"
              onChange={e => update({ group: e.target.value })}
            />
          </div>
          <div className={styles.metaItem}>
            <label className={styles.metaLabel}>Start</label>
            <input
              className={styles.metaInput}
              type="date"
              value={draft.start ?? ""}
              onChange={e => update({ start: e.target.value })}
            />
          </div>
          <div className={styles.metaItem}>
            <label className={styles.metaLabel}>Due Date</label>
            <input
              className={styles.metaInput}
              type="date"
              value={draft.end ?? ""}
              onChange={e => update({ end: e.target.value })}
            />
          </div>
          <div className={styles.metaItem}>
            <label className={styles.metaLabel}>Progress</label>
            <div className={styles.progressRow}>
              <input
                className={styles.metaInput}
                type="number"
                min={0}
                max={100}
                value={draft.progress ?? 0}
                onChange={e => update({ progress: Math.min(100, Math.max(0, Number(e.target.value))) })}
              />
              <span className={styles.progressPct}>%</span>
            </div>
          </div>
          <div className={styles.metaItem}>
            <label className={styles.metaLabel}>Bar color</label>
            <div className={styles.colorRow}>
              <input
                type="color"
                className={styles.colorPicker}
                value={draft.color ?? defaultColor}
                onChange={e => update({ color: e.target.value })}
              />
              <span className={styles.colorHex}>{(draft.color ?? defaultColor).toUpperCase()}</span>
              {draft.color && (
                <button className={styles.colorReset} onClick={() => update({ color: undefined })}>Reset</button>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className={styles.modalSection}>
          <label className={styles.sectionLabel}>Description</label>
          <textarea
            className={styles.descriptionTextarea}
            value={draft.description ?? ""}
            placeholder="Add a description…"
            rows={3}
            onChange={e => update({ description: e.target.value })}
          />
        </div>

        {/* Actions */}
        <div className={styles.modalSection}>
          <div className={styles.deleteActions}>
            <button className={styles.deleteCancelBtn} onClick={onClose}>Cancel</button>
            <button
              className={styles.commentSubmit}
              style={{ background: draft.color ?? defaultColor, opacity: canCreate ? 0.9 : 0.35, cursor: canCreate ? "pointer" : "default" }}
              disabled={!canCreate}
              onClick={() => {
                if (!canCreate) return;
                onCreate({
                  id:          `new-${Date.now()}`,
                  name:        draft.name!.trim(),
                  start:       draft.start!,
                  end:         draft.end!,
                  progress:    draft.progress ?? 0,
                  group:       draft.group   || undefined,
                  assignee:    draft.assignee || undefined,
                  description: draft.description || undefined,
                  color:       draft.color   || undefined,
                });
              }}
            >
              Create task
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

export const GanttChart: FC = () => {
  Retool.useComponentSettings({ defaultWidth: 20, defaultHeight: 50 });

  // ── Title ──
  const [chartTitle] = Retool.useStateString({ name: "chartTitle", label: "Title", description: "Optional title shown at the top of the chart.", initialValue: "" });

  // ── Display range ──
  const [displayFrom] = Retool.useStateString({ name: "displayFrom", label: "Display from", description: "Start of the visible date range (YYYY-MM). Leave blank to auto-fit to task data.", initialValue: "" });
  const [displayTo]   = Retool.useStateString({ name: "displayTo",   label: "Display to",   description: "End of the visible date range (YYYY-MM). Leave blank to auto-fit to task data.",   initialValue: "" });

  // ── View mode dropdown ──
  const [viewMode] = Retool.useStateEnumeration({
    name: "viewMode",
    label: "View mode",
    description: "Timeline zoom level.",
    enumDefinition: ["week", "month", "quarter", "year"],
    enumLabels: { week: "Weekly", month: "Monthly", quarter: "Quarterly", year: "Yearly" },
    inspector: "select",
    initialValue: "week",
  });

  // ── Data source ──
  const [rawTasks, setRawTasks] = Retool.useStateArray({
    name: "tasks",
    label: "Data source",
    description: "Array of row objects from a query or data source.",
    initialValue: [],
  });

  // ── Column field mapping (hidden — uses standard field names by default) ──
  const [columnFields] = Retool.useStateObject({
    name: "columnFields",
    label: "Column fields",
    description: "Map your data source column names to chart fields.",
    inspector: "hidden",
    initialValue: { id: "id", name: "name", start: "start", end: "end", progress: "progress", group: "group", assignee: "assignee", description: "description", color: "color" },
  });

  const [, setSelectedTask] = Retool.useStateObject({
    name: "selectedTask",
    label: "Selected task",
    description: "The last task the user clicked — use this to drive other components.",
    inspector: "hidden",
    initialValue: {},
  });
  const onTaskClick   = Retool.useEventCallback({ name: "taskClick" });
  const onTaskDelete  = Retool.useEventCallback({ name: "taskDelete" });
  const onTaskAdd     = Retool.useEventCallback({ name: "taskAdd" });

  const [hoveredId,       setHoveredId]       = useState<string | null>(null);
  const [modalTask,       setModalTask]       = useState<Task | null>(null);
  const [addTaskDraft,    setAddTaskDraft]    = useState<Partial<Task> | null>(null);
  const [comments,        setComments]        = useState<Comment[]>([]);
  const [dragId,          setDragId]          = useState<string | null>(null);
  const [dragOverId,      setDragOverId]      = useState<string | null>(null);
  const [deletedSnap,     setDeletedSnap]     = useState<{ task: Task; tasks: Task[]; index: number } | null>(null);
  const [quickDeleteId,   setQuickDeleteId]   = useState<string | null>(null);
  const [rowHeights,      setRowHeights]      = useState<number[]>([]);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const cf = (columnFields ?? {}) as Record<string, string>;
  const f = {
    id:          cf.id          || "id",
    name:        cf.name        || "name",
    start:       cf.start       || "start",
    end:         cf.end         || "end",
    progress:    cf.progress    || "progress",
    group:       cf.group       || "group",
    assignee:    cf.assignee    || "assignee",
    description: cf.description || "description",
    color:       cf.color       || "color",
  };

  const rawTasksArr = rawTasks as Record<string, unknown>[];
  const sourceTasks = rawTasksArr?.length > 0 ? rawTasksArr : SAMPLE_TASKS;
  const tasks: Task[] = sourceTasks.map(r => ({
    id:          String(r[f.id]          ?? r.id          ?? ""),
    name:        String(r[f.name]        ?? r.name        ?? ""),
    start:       String(r[f.start]       ?? r.start       ?? ""),
    end:         String(r[f.end]         ?? r.end         ?? ""),
    progress:    Number(r[f.progress]    ?? r.progress    ?? 0),
    group:       r[f.group]       != null ? String(r[f.group])       : r.group       != null ? String(r.group)       : undefined,
    assignee:    r[f.assignee]    != null ? String(r[f.assignee])    : r.assignee    != null ? String(r.assignee)    : undefined,
    description: r[f.description] != null ? String(r[f.description]) : r.description != null ? String(r.description) : undefined,
    color:       r[f.color]       != null ? String(r[f.color])       : r.color       != null ? String(r.color)       : undefined,
  }));

  const mode = (viewMode as string) || "month";
  const dayW   = DAY_WIDTH[mode] ?? 24;

  // ── date range ──
  const { rangeStart, totalDays, columns } = useMemo(() => {
    const fromStr = (displayFrom as string)?.trim();
    const toStr   = (displayTo   as string)?.trim();

    // Parse "YYYY-MM" or "YYYY-MM-DD" into first/last day of month
    const parseRange = (s: string, fallback: Date, isEnd: boolean) => {
      if (!s) return fallback;
      const parts = s.split("-");
      const yr  = parseInt(parts[0]);
      const mo  = parts[1] ? parseInt(parts[1]) - 1 : (isEnd ? 11 : 0);
      if (isNaN(yr)) return fallback;
      return isEnd
        ? new Date(yr, mo + 1, 0)   // last day of that month
        : new Date(yr, mo, 1);       // first day of that month
    };

    let autoStart: Date, autoEnd: Date;
    let rawMin: Date, rawMax: Date;
    if (tasks.length === 0) {
      const now = new Date();
      rawMin = new Date(now.getFullYear(), now.getMonth(), 1);
      rawMax = new Date(now.getFullYear(), now.getMonth() + 3, 0);
    } else {
      rawMin = parseDate(tasks[0].start);
      rawMax = parseDate(tasks[0].end);
      tasks.forEach(t => {
        const s = parseDate(t.start), e = parseDate(t.end);
        if (s < rawMin) rawMin = s;
        if (e > rawMax) rawMax = e;
      });
    }
    autoStart = addDays(rawMin, -7);
    autoEnd   = addDays(rawMax, 7);

    let start = parseRange(fromStr, autoStart, false);
    let end   = parseRange(toStr,   autoEnd,   true);

    // Snap to quarter boundaries in quarter mode so columns never overlap
    if (mode === "quarter") {
      const qS = Math.floor(rawMin.getMonth() / 3);
      start = new Date(rawMin.getFullYear(), qS * 3, 1);
      const qE = Math.floor(rawMax.getMonth() / 3);
      end   = new Date(rawMax.getFullYear(), qE * 3 + 3, 1); // exclusive: first day of next quarter
    }

    return { rangeStart: start, totalDays: diffDays(start, end), columns: buildColumns(start, end, mode) };
  }, [tasks, mode, displayFrom, displayTo]);

  // ── Measure actual label row heights after render (only update when changed) ──
  useLayoutEffect(() => {
    const heights = rowRefs.current.slice(0, tasks.length).map(el =>
      el ? Math.max(ROW_HEIGHT, el.getBoundingClientRect().height) : ROW_HEIGHT
    );
    setRowHeights(prev =>
      prev.length === heights.length && prev.every((h, i) => h === heights[i]) ? prev : heights
    );
  });

  // ── Auto-dismiss undo toast after 8 seconds ──
  useEffect(() => {
    if (!deletedSnap) return;
    const t = setTimeout(() => setDeletedSnap(null), 8000);
    return () => clearTimeout(t);
  }, [deletedSnap]);

  // ── Row Y positions (cumulative from measured heights) ──
  const rowYs = useMemo(() => {
    const ys: number[] = [];
    let y = HEADER_HEIGHT;
    for (let i = 0; i < tasks.length; i++) {
      ys.push(y);
      y += (rowHeights[i] ?? ROW_HEIGHT);
    }
    return ys;
  }, [rowHeights, tasks.length]);

  const chartW = totalDays * dayW;
  const totalRowH = tasks.reduce((sum, _, i) => sum + (rowHeights[i] ?? ROW_HEIGHT), 0);
  const chartH = HEADER_HEIGHT + totalRowH + 8;

  // ── colour per group/task ──
  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    let i = 0;
    tasks.forEach(t => {
      const k = t.group ?? t.id;
      if (!map[k]) map[k] = PALETTE[i++ % PALETTE.length];
    });
    return map;
  }, [tasks]);

  const barProps = useCallback(
    (task: Task) => {
      const s = parseDate(task.start);
      const e = parseDate(task.end);
      const x = diffDays(rangeStart, s) * dayW;
      const w = Math.max(diffDays(s, e) * dayW, dayW);
      return { x, w };
    },
    [rangeStart, dayW]
  );

  const handleClick = useCallback(
    (task: Task) => {
      setSelectedTask(task as unknown as Record<string, unknown>);
      setModalTask(task);
      onTaskClick();
    },
    [setSelectedTask, onTaskClick]
  );

  const handleAddComment = useCallback(
    (text: string, authorName: string) => {
      setComments(prev => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          taskId: modalTask!.id,
          author: authorName,
          text,
          timestamp: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
        },
      ]);
    },
    [modalTask]
  );

  const handleUpdateTask = useCallback(
    (fields: Partial<Task>) => {
      if (!modalTask) return;
      const updated = tasks.map(t =>
        t.id === modalTask.id ? { ...t, ...fields } : t
      );
      setRawTasks(updated as unknown as import("@tryretool/custom-component-support").Retool.SerializableArray);
      setModalTask(prev => prev ? { ...prev, ...fields } : prev);
    },
    [modalTask, tasks, setRawTasks]
  );

  const handleDeleteTask = useCallback(() => {
    if (!modalTask) return;
    const index = tasks.findIndex(t => t.id === modalTask.id);
    setDeletedSnap({ task: modalTask, tasks: [...tasks], index });
    setSelectedTask(modalTask as unknown as Record<string, unknown>);
    onTaskDelete();
    const updated = tasks.filter(t => t.id !== modalTask.id);
    setRawTasks(updated as unknown as import("@tryretool/custom-component-support").Retool.SerializableArray);
    setModalTask(null);
  }, [modalTask, tasks, setRawTasks, setSelectedTask, onTaskDelete]);

  const handleUndoDelete = useCallback(() => {
    if (!deletedSnap) return;
    setRawTasks(deletedSnap.tasks as unknown as import("@tryretool/custom-component-support").Retool.SerializableArray);
    setDeletedSnap(null);
  }, [deletedSnap, setRawTasks]);

  const handleAddTask = useCallback(() => {
    const today    = new Date().toISOString().slice(0, 10);
    const nextWeek = addDays(new Date(), 7).toISOString().slice(0, 10);
    setAddTaskDraft({ start: today, end: nextWeek, progress: 0 });
  }, []);

  const handleCreateTask = useCallback((newTask: Task) => {
    const updated = [...tasks, newTask];
    setRawTasks(updated as unknown as import("@tryretool/custom-component-support").Retool.SerializableArray);
    setSelectedTask(newTask as unknown as Record<string, unknown>);
    setAddTaskDraft(null);
    onTaskAdd();
  }, [tasks, setRawTasks, setSelectedTask, onTaskAdd]);

  const handleDragStart = useCallback((id: string) => {
    setDragId(id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  }, []);

  const handleDrop = useCallback((targetId: string) => {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return; }
    const from = tasks.findIndex(t => t.id === dragId);
    const to   = tasks.findIndex(t => t.id === targetId);
    if (from < 0 || to < 0) { setDragId(null); setDragOverId(null); return; }
    const updated = [...tasks];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setRawTasks(updated as unknown as import("@tryretool/custom-component-support").Retool.SerializableArray);
    setDragId(null);
    setDragOverId(null);
  }, [dragId, tasks, setRawTasks]);

  const handleDragEnd = useCallback(() => {
    setDragId(null);
    setDragOverId(null);
  }, []);

  const todayX    = diffDays(rangeStart, new Date()) * dayW;
  const showToday = todayX >= 0 && todayX <= chartW;

  return (
    <div className={styles.root}>
      {(chartTitle as string)?.trim() && (
        <div className={styles.chartTitle}>{(chartTitle as string).trim()}</div>
      )}
      <div className={styles.inner}>

        {/* ── Label column ── */}
        <div className={styles.labelCol} style={{ width: LABEL_WIDTH, minWidth: LABEL_WIDTH }}>
          <div className={styles.labelHead} style={{ height: HEADER_HEIGHT }}>
            Task
            <button className={styles.addTaskBtn} onClick={handleAddTask}>+ Add task</button>
          </div>
          {tasks.map((task, i) => (
            <div
              key={task.id}
              ref={el => { rowRefs.current[i] = el; }}
              draggable
              className={[
                styles.labelRow,
                dragId      === task.id ? styles.labelRowDragging  : "",
                dragOverId  === task.id && dragId !== task.id ? styles.labelRowDragOver : "",
              ].join(" ")}
              style={{ minHeight: ROW_HEIGHT, background: i % 2 ? "#f8f9fa" : "#ffffff" }}
              onClick={() => handleClick(task)}
              onDragStart={() => handleDragStart(task.id)}
              onDragOver={e  => handleDragOver(e, task.id)}
              onDrop={()     => handleDrop(task.id)}
              onDragEnd={handleDragEnd}
            >
              <span className={styles.dragHandle}>⠿</span>
              <div className={styles.labelRowContent}>
                {task.group && (
                  <span
                    className={styles.groupDot}
                    style={{ background: task.color ?? colorMap[task.group ?? task.id] ?? PALETTE[0] }}
                    title={task.group}
                  />
                )}
                <span className={styles.name}>{task.name}</span>
              </div>
              <div className={styles.quickDeleteWrap} onClick={e => e.stopPropagation()}>
                <button
                  className={styles.quickDeleteBtn}
                  title="Delete task"
                  onClick={() => setQuickDeleteId(quickDeleteId === task.id ? null : task.id)}
                >✕</button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Chart scroll area ── */}
        <div className={styles.chartScroll}>
          <svg width={chartW} height={chartH} style={{ display: "block" }}>

            {columns.map((col, ci) => (
              <g key={ci}>
                <rect x={col.x} y={0} width={col.width} height={HEADER_HEIGHT}
                  fill={ci % 2 ? "rgba(0,0,0,0.02)" : "#f8f9fa"} />
                <text x={col.x + col.width / 2} y={HEADER_HEIGHT / 2 + 5}
                  textAnchor="middle" fill="#6b7280" fontSize={11}
                  fontFamily="Inter, system-ui, sans-serif">
                  {col.label}
                </text>
                <line x1={col.x} y1={HEADER_HEIGHT} x2={col.x} y2={chartH}
                  stroke="#e2e5e9" strokeWidth={1} />
              </g>
            ))}

            <line x1={0} y1={HEADER_HEIGHT} x2={chartW} y2={HEADER_HEIGHT}
              stroke="#e2e5e9" strokeWidth={1} />

            {tasks.map((task, i) => {
              const { x, w }  = barProps(task);
              const rowY       = rowYs[i] ?? (HEADER_HEIGHT + i * ROW_HEIGHT);
              const rh         = rowHeights[i] ?? ROW_HEIGHT;
              const barY       = rowY + (rh - BAR_HEIGHT) / 2;
              const color      = task.color ?? colorMap[task.group ?? task.id] ?? PALETTE[0];
              const progress   = Math.min(100, Math.max(0, task.progress ?? 0));
              const hovered    = hoveredId === task.id;

              return (
                <g key={task.id}>
                  <rect x={0} y={rowY} width={chartW} height={rh}
                    fill={i % 2 ? "#f8f9fa" : "#ffffff"} />
                  {hovered && (
                    <rect x={0} y={rowY} width={chartW} height={rh}
                      fill="rgba(99,102,241,0.05)" />
                  )}
                  <rect x={x} y={barY} width={w} height={BAR_HEIGHT}
                    rx={BAR_RADIUS} fill={color} opacity={0.18} />
                  {progress > 0 && (
                    <rect x={x} y={barY} width={w * progress / 100} height={BAR_HEIGHT}
                      rx={BAR_RADIUS} fill={color} opacity={0.82} />
                  )}
                  <rect x={x} y={barY} width={w} height={BAR_HEIGHT}
                    rx={BAR_RADIUS} fill="none" stroke={color} strokeWidth={1.5}
                    opacity={hovered ? 1 : 0.55} />
                  {w > 44 && (
                    <clipPath id={`clip-${task.id}`}>
                      <rect x={x + 1} y={barY} width={w - 2} height={BAR_HEIGHT} rx={BAR_RADIUS} />
                    </clipPath>
                  )}
                  {progress > 0 && w > 44 && (
                    <text x={x + 8} y={barY + BAR_HEIGHT / 2 + 4}
                      fill="white" fontSize={10} fontWeight="600"
                      fontFamily="Inter, system-ui, sans-serif"
                      clipPath={`url(#clip-${task.id})`}>
                      {progress}%
                    </text>
                  )}
                  {task.assignee && w > 52 && (() => {
                    const AVATAR_R  = 9;
                    const AVATAR_D  = AVATAR_R * 2;
                    const cx = x + w - AVATAR_R - 4;
                    const cy = barY + BAR_HEIGHT / 2;
                    const bg = avatarColor(task.assignee);
                    return (
                      <g clipPath={`url(#clip-${task.id})`}>
                        <circle cx={cx} cy={cy} r={AVATAR_R} fill={bg} opacity={0.95} />
                        <circle cx={cx} cy={cy} r={AVATAR_R} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
                        <text
                          x={cx} y={cy + 4}
                          textAnchor="middle"
                          fill="white" fontSize={8} fontWeight="700"
                          fontFamily="Inter, system-ui, sans-serif"
                          style={{ pointerEvents: "none" }}>
                          {getInitials(task.assignee)}
                        </text>
                        <title>{task.assignee}</title>
                        {/* invisible hit area for full-name tooltip */}
                        <rect x={cx - AVATAR_R} y={cy - AVATAR_R} width={AVATAR_D} height={AVATAR_D} fill="transparent" rx={AVATAR_R}>
                          <title>{task.assignee}</title>
                        </rect>
                      </g>
                    );
                  })()}
                  <rect x={x} y={rowY} width={w} height={rh}
                    fill="transparent" style={{ cursor: "pointer" }}
                    onClick={() => handleClick(task)}
                    onMouseEnter={() => setHoveredId(task.id)}
                    onMouseLeave={() => setHoveredId(null)} />
                </g>
              );
            })}

            {showToday && (
              <g>
                <line x1={todayX} y1={HEADER_HEIGHT} x2={todayX} y2={chartH}
                  stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4 3" />
                <rect x={todayX - 18} y={HEADER_HEIGHT - 16} width={36} height={16}
                  rx={4} fill="#6366f1" />
                <text x={todayX} y={HEADER_HEIGHT - 4}
                  textAnchor="middle" fill="white" fontSize={9} fontWeight="700"
                  fontFamily="Inter, system-ui, sans-serif">
                  TODAY
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* ── Quick-delete confirmation overlay ── */}
      {quickDeleteId && (() => {
        const target = tasks.find(t => t.id === quickDeleteId);
        if (!target) return null;
        return (
          <div className={styles.modalOverlay} onClick={() => setQuickDeleteId(null)}>
            <div className={styles.quickDeleteModal} onClick={e => e.stopPropagation()}>
              <p className={styles.quickDeleteMsg}>Delete "{target.name}"?</p>
              <p className={styles.quickDeleteSub}>This will remove the task. If connected to a data source, wire <code>taskDelete</code> to your DELETE query.</p>
              <div className={styles.quickDeleteActions}>
                <button className={styles.deleteCancelBtn} onClick={() => setQuickDeleteId(null)}>Cancel</button>
                <button className={styles.deleteConfirmBtn} onClick={() => {
                  const index = tasks.findIndex(t => t.id === target.id);
                  setDeletedSnap({ task: target, tasks: [...tasks], index });
                  setSelectedTask(target as unknown as Record<string, unknown>);
                  onTaskDelete();
                  setRawTasks(tasks.filter(t => t.id !== target.id) as unknown as import("@tryretool/custom-component-support").Retool.SerializableArray);
                  setQuickDeleteId(null);
                }}>Delete</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Undo toast ── */}
      {deletedSnap && (
        <div className={styles.undoToast}>
          <span>"{deletedSnap.task.name}" deleted</span>
          <button className={styles.undoBtn} onClick={handleUndoDelete}>Undo</button>
          <button className={styles.undoDismiss} onClick={() => setDeletedSnap(null)}>✕</button>
        </div>
      )}

      {/* ── Task detail modal ── */}
      {modalTask && (
        <Modal
          task={modalTask}
          comments={comments}
          color={modalTask.color ?? colorMap[modalTask.group ?? modalTask.id] ?? PALETTE[0]}
          onClose={() => setModalTask(null)}
          onAddComment={handleAddComment}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {/* ── Add task modal ── */}
      {addTaskDraft && (
        <AddTaskModal
          draft={addTaskDraft}
          defaultColor={PALETTE[tasks.length % PALETTE.length]}
          onClose={() => setAddTaskDraft(null)}
          onCreate={handleCreateTask}
        />
      )}
    </div>
  );
};
