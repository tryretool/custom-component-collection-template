import React, { FC, useMemo, useState, useCallback } from "react";
import { Retool } from "@tryretool/custom-component-support";
import styles from "./GanttChart.module.css";

// ─── Types ───────────────────────────────────────────────────────────────────

type Assignee = {
  id?: string;
  name: string;
  initials?: string;
  color?: string;
  avatar?: string; // profile picture URL
};

type Task = {
  id: string;
  name: string;
  start: string;
  end: string;
  progress?: number;
  group?: string;
  color?: string;
  assignees?: Assignee[];
};

// Retool user shape from the Retool API resource
type RetoolUser = {
  id?: string | number;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  profilePhotoUrl?: string;
  avatar?: string;
};

type Column = { label: string; x: number; width: number };

// ─── Constants ───────────────────────────────────────────────────────────────

const ROW_HEIGHT    = 64;
const HEADER_HEIGHT = 52;
const LABEL_WIDTH   = 240;
const BAR_HEIGHT    = 28;
const BAR_RADIUS    = 7;
const AVATAR_R      = 13;
const AVATAR_GAP    = 5;
const MAX_AVATARS   = 3;

const PALETTE = [
  "#6BBAFF", "#8B7EFF", "#2EC98A", "#F59E0B",
  "#EF4444", "#9B72CF", "#34d399", "#f87171",
];

const AVATAR_PALETTE = [
  "#9B72CF", "#6BBAFF", "#2EC98A", "#F59E0B",
  "#EF4444", "#8B7EFF", "#34d399", "#f87171",
];

const DAY_WIDTH: Record<string, number> = { day: 40, week: 24, month: 12 };

// ─── Date helpers ─────────────────────────────────────────────────────────────

const parseDate = (s: string) => new Date(s + "T00:00:00");
const diffDays  = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86_400_000);
const addDays   = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

function getWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day  = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

function buildColumns(start: Date, end: Date, mode: string): Column[] {
  const dw   = DAY_WIDTH[mode] ?? 24;
  const cols: Column[] = [];
  if (mode === "day") {
    const total = diffDays(start, end);
    for (let i = 0; i < total; i++) {
      const d = addDays(start, i);
      cols.push({ label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), x: i * dw, width: dw });
    }
  } else if (mode === "week") {
    let cur = new Date(start);
    cur = addDays(cur, cur.getDay() === 0 ? -6 : 1 - cur.getDay());
    while (cur < end) {
      const next = addDays(cur, 7);
      const x = Math.max(0, diffDays(start, cur)) * dw;
      const w = Math.min(7, diffDays(start, end) - diffDays(start, cur)) * dw;
      if (w > 0) cols.push({ label: `W${getWeek(cur)} ${cur.getFullYear()}`, x, width: w });
      cur = next;
    }
  } else {
    let cur = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cur < end) {
      const next = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
      const x    = Math.max(0, diffDays(start, cur)) * dw;
      const w    = Math.min(diffDays(cur, next), diffDays(start, end) - Math.max(0, diffDays(start, cur))) * dw;
      if (w > 0) cols.push({ label: cur.toLocaleDateString("en-US", { month: "short", year: "numeric" }), x, width: w });
      cur = next;
    }
  }
  return cols;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

function resolveAssignees(assignees: Assignee[], userMap: Map<string, RetoolUser>): Assignee[] {
  return assignees.map(a => {
    const user = a.id ? userMap.get(String(a.id)) : undefined;
    if (!user) return a;
    const fullName = user.name ?? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
    return {
      ...a,
      name:    fullName || a.name,
      initials: a.initials ?? getInitials(fullName || a.name),
      avatar:  user.profilePhotoUrl ?? user.avatar ?? a.avatar,
    };
  });
}

// ─── SVG Avatar Stack (on bar) ────────────────────────────────────────────────

function SvgAvatarStack({ assignees, x, y, taskId }: { assignees: Assignee[]; x: number; y: number; taskId: string }) {
  const visible  = assignees.slice(0, MAX_AVATARS);
  const overflow = assignees.length - MAX_AVATARS;
  const step     = AVATAR_R * 2 - AVATAR_GAP;
  const totalW   = visible.length * step + (overflow > 0 ? step : 0);

  return (
    <g transform={`translate(${x - totalW}, ${y - AVATAR_R})`}>
      <defs>
        {visible.map((_, i) => (
          <clipPath key={i} id={`clip-${taskId}-${i}`}>
            <circle cx={i * step + AVATAR_R} cy={AVATAR_R} r={AVATAR_R} />
          </clipPath>
        ))}
      </defs>
      {visible.map((a, i) => {
        const cx = i * step + AVATAR_R;
        const cy = AVATAR_R;
        const bg = a.color ?? AVATAR_PALETTE[i % AVATAR_PALETTE.length];
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={AVATAR_R} fill={bg} stroke="#0D0F12" strokeWidth={1.5} />
            {a.avatar ? (
              <image
                x={cx - AVATAR_R} y={cy - AVATAR_R}
                width={AVATAR_R * 2} height={AVATAR_R * 2}
                href={a.avatar}
                clipPath={`url(#clip-${taskId}-${i})`}
                preserveAspectRatio="xMidYMid slice"
              />
            ) : (
              <text
                x={cx} y={cy + 4}
                textAnchor="middle" fill="white"
                fontSize={9} fontWeight="700"
                fontFamily="Inter, system-ui, sans-serif"
              >
                {(a.initials ?? getInitials(a.name)).toUpperCase().slice(0, 2)}
              </text>
            )}
            <circle cx={cx} cy={cy} r={AVATAR_R} fill="none" stroke="#0D0F12" strokeWidth={1.5} />
          </g>
        );
      })}
      {overflow > 0 && (
        <g>
          <circle
            cx={visible.length * step + AVATAR_R} cy={AVATAR_R} r={AVATAR_R}
            fill="#374151" stroke="#0D0F12" strokeWidth={1.5}
          />
          <text
            x={visible.length * step + AVATAR_R} y={AVATAR_R + 4}
            textAnchor="middle" fill="#94A3B8"
            fontSize={8} fontWeight="700"
            fontFamily="Inter, system-ui, sans-serif"
          >
            +{overflow}
          </text>
        </g>
      )}
    </g>
  );
}

// ─── HTML Avatar (label column) ───────────────────────────────────────────────

function HtmlAvatar({ assignee, index }: { assignee: Assignee; index: number }) {
  const [imgFailed, setImgFailed] = useState(false);
  const bg = assignee.color ?? AVATAR_PALETTE[index % AVATAR_PALETTE.length];
  const initials = (assignee.initials ?? getInitials(assignee.name)).toUpperCase().slice(0, 2);

  return (
    <div className={styles.avatar} style={{ background: bg }} title={assignee.name}>
      {assignee.avatar && !imgFailed ? (
        <img
          src={assignee.avatar}
          alt={assignee.name}
          className={styles.avatarImg}
          onError={() => setImgFailed(true)}
        />
      ) : (
        initials
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export const GanttChart: FC = () => {
  const [rawTasks] = Retool.useStateArray({
    name: "tasks",
    label: "Tasks",
    description: "Array of tasks: { id, name, start, end, progress?, group?, color?, assignees?: [{ id?, name, initials?, color?, avatar? }] }",
    defaultValue: [],
  });
  const [rawUsers] = Retool.useStateArray({
    name: "users",
    label: "Users",
    description: "Retool org users — bind to a Retool API users query. Used to resolve avatars and names from assignee id.",
    defaultValue: [],
  });
  const [viewMode] = Retool.useStateString({
    name: "viewMode",
    label: "View Mode",
    description: "day | week | month",
    defaultValue: "week",
  });
  const [, setSelectedTask] = Retool.useStateObject({
    name: "selectedTask",
    label: "Selected Task",
    description: "Last clicked task object including resolved assignees",
    defaultValue: null,
  });
  const onTaskClick = Retool.useEventCallback({ name: "taskClick" });

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const tasks = (rawTasks as Task[]) ?? [];
  const users = (rawUsers as RetoolUser[]) ?? [];
  const mode  = (viewMode as string) || "week";
  const dayW  = DAY_WIDTH[mode] ?? 24;

  // Build a map of user id → user for fast lookup
  const userMap = useMemo(() => {
    const map = new Map<string, RetoolUser>();
    users.forEach(u => { if (u.id != null) map.set(String(u.id), u); });
    return map;
  }, [users]);

  const { rangeStart, totalDays, columns } = useMemo(() => {
    if (tasks.length === 0) {
      const now   = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end   = new Date(now.getFullYear(), now.getMonth() + 3, 0);
      return { rangeStart: start, totalDays: diffDays(start, end), columns: buildColumns(start, end, mode) };
    }
    let min = parseDate(tasks[0].start);
    let max = parseDate(tasks[0].end);
    tasks.forEach(t => {
      const s = parseDate(t.start), e = parseDate(t.end);
      if (s < min) min = s;
      if (e > max) max = e;
    });
    const start = addDays(min, -7);
    const end   = addDays(max, 7);
    return { rangeStart: start, totalDays: diffDays(start, end), columns: buildColumns(start, end, mode) };
  }, [tasks, mode]);

  const chartW = totalDays * dayW;
  const chartH = HEADER_HEIGHT + tasks.length * ROW_HEIGHT + 8;

  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    let i = 0;
    tasks.forEach(t => {
      const k = t.group ?? t.id;
      if (!map[k]) map[k] = PALETTE[i++ % PALETTE.length];
    });
    return map;
  }, [tasks]);

  const barProps = useCallback((task: Task) => {
    const s = parseDate(task.start);
    const e = parseDate(task.end);
    const x = diffDays(rangeStart, s) * dayW;
    const w = Math.max(diffDays(s, e) * dayW, dayW);
    return { x, w };
  }, [rangeStart, dayW]);

  const handleClick = useCallback((task: Task, resolved: Assignee[]) => {
    setSelectedTask({ ...task, assignees: resolved } as unknown as Record<string, unknown>);
    onTaskClick();
  }, [setSelectedTask, onTaskClick]);

  const todayX    = diffDays(rangeStart, new Date()) * dayW;
  const showToday = todayX >= 0 && todayX <= chartW;

  return (
    <div className={styles.root}>
      <div className={styles.inner}>

        {/* ── Label column ── */}
        <div className={styles.labelCol} style={{ width: LABEL_WIDTH, minWidth: LABEL_WIDTH }}>
          <div className={styles.labelHead} style={{ height: HEADER_HEIGHT }}>Task</div>
          {tasks.map((task, i) => {
            const resolved = resolveAssignees(task.assignees ?? [], userMap);
            return (
              <div
                key={task.id}
                className={styles.labelRow}
                style={{ height: ROW_HEIGHT, background: i % 2 ? "rgba(255,255,255,0.02)" : "transparent" }}
                onClick={() => handleClick(task, resolved)}
              >
                <div className={styles.labelContent}>
                  <div className={styles.labelText}>
                    {task.group && <span className={styles.group}>{task.group}</span>}
                    <span className={styles.name}>{task.name}</span>
                  </div>
                  {resolved.length > 0 && (
                    <div className={styles.avatarList}>
                      {resolved.slice(0, MAX_AVATARS).map((a, ai) => (
                        <HtmlAvatar key={ai} assignee={a} index={ai} />
                      ))}
                      {resolved.length > MAX_AVATARS && (
                        <div className={styles.avatar} style={{ background: "#374151", color: "#94A3B8" }}>
                          +{resolved.length - MAX_AVATARS}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Chart scroll ── */}
        <div className={styles.chartScroll}>
          <svg width={chartW} height={chartH} style={{ display: "block" }}>

            {columns.map((col, ci) => (
              <g key={ci}>
                <rect x={col.x} y={0} width={col.width} height={HEADER_HEIGHT}
                  fill={ci % 2 ? "rgba(255,255,255,0.015)" : "transparent"} />
                <text x={col.x + col.width / 2} y={HEADER_HEIGHT / 2 + 5}
                  textAnchor="middle" fill="#64748B" fontSize={11}
                  fontFamily="Inter, system-ui, sans-serif">
                  {col.label}
                </text>
                <line x1={col.x} y1={HEADER_HEIGHT} x2={col.x} y2={chartH}
                  stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
              </g>
            ))}

            <line x1={0} y1={HEADER_HEIGHT} x2={chartW} y2={HEADER_HEIGHT}
              stroke="rgba(255,255,255,0.08)" strokeWidth={1} />

            {tasks.map((task, i) => {
              const { x, w }  = barProps(task);
              const rowY      = HEADER_HEIGHT + i * ROW_HEIGHT;
              const barY      = rowY + (ROW_HEIGHT - BAR_HEIGHT) / 2;
              const color     = task.color ?? colorMap[task.group ?? task.id] ?? PALETTE[0];
              const progress  = Math.min(100, Math.max(0, task.progress ?? 0));
              const hovered   = hoveredId === task.id;
              const resolved  = resolveAssignees(task.assignees ?? [], userMap);
              const avatarX   = x + w - 4;
              const avatarY   = rowY + ROW_HEIGHT / 2;

              return (
                <g key={task.id}>
                  <rect x={0} y={rowY} width={chartW} height={ROW_HEIGHT}
                    fill={i % 2 ? "rgba(255,255,255,0.02)" : "transparent"} />
                  {hovered && (
                    <rect x={0} y={rowY} width={chartW} height={ROW_HEIGHT}
                      fill="rgba(155,114,207,0.06)" />
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
                  {progress > 0 && w > 52 && (
                    <text x={x + 10} y={barY + BAR_HEIGHT / 2 + 4}
                      fill="white" fontSize={11} fontWeight="600"
                      fontFamily="Inter, system-ui, sans-serif">
                      {progress}%
                    </text>
                  )}
                  {resolved.length > 0 && w > 40 && (
                    <SvgAvatarStack assignees={resolved} x={avatarX} y={avatarY} taskId={task.id} />
                  )}
                  <rect x={x} y={rowY} width={w} height={ROW_HEIGHT}
                    fill="transparent" style={{ cursor: "pointer" }}
                    onClick={() => handleClick(task, resolved)}
                    onMouseEnter={() => setHoveredId(task.id)}
                    onMouseLeave={() => setHoveredId(null)} />
                </g>
              );
            })}

            {showToday && (
              <g>
                <line x1={todayX} y1={HEADER_HEIGHT} x2={todayX} y2={chartH}
                  stroke="#9B72CF" strokeWidth={1.5} strokeDasharray="4 3" />
                <rect x={todayX - 18} y={HEADER_HEIGHT - 16} width={36} height={16}
                  rx={4} fill="#9B72CF" />
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
    </div>
  );
};
