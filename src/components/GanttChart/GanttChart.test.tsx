import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { GanttChart } from "./GanttChart";

// Mock Retool hooks
vi.mock("@tryretool/custom-component-support", () => ({
  Retool: {
    useStateArray: vi.fn(() => [[
      { id: "1", name: "Design", start: "2024-01-01", end: "2024-01-14", progress: 100, group: "Phase 1" },
      { id: "2", name: "Development", start: "2024-01-15", end: "2024-02-15", progress: 60, group: "Phase 1" },
      { id: "3", name: "Testing", start: "2024-02-16", end: "2024-03-01", progress: 0, group: "Phase 2" },
    ]]),
    useStateString: vi.fn(() => ["week"]),
    useStateObject: vi.fn(() => [null, vi.fn()]),
    useEventCallback: vi.fn(() => vi.fn()),
  },
}));

describe("GanttChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<GanttChart />);
  });

  it("renders task names in the label column", () => {
    render(<GanttChart />);
    expect(screen.getByText("Design")).toBeDefined();
    expect(screen.getByText("Development")).toBeDefined();
    expect(screen.getByText("Testing")).toBeDefined();
  });

  it("renders group labels", () => {
    render(<GanttChart />);
    const phase1 = screen.getAllByText("Phase 1");
    expect(phase1.length).toBeGreaterThan(0);
  });

  it("renders the chart SVG", () => {
    const { container } = render(<GanttChart />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });

  it("renders a bar for each task", () => {
    const { container } = render(<GanttChart />);
    // Each task renders a hit-area rect with cursor:pointer
    const hitAreas = container.querySelectorAll("rect[style*='cursor: pointer']");
    expect(hitAreas.length).toBe(3);
  });
});
