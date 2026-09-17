// Commit-DAG layout.
//
// git log gives commits in order with their parent hashes but no geometry.
// This assigns each commit a horizontal lane so edges stay untangled: a lane
// holds the hash it expects to see next, a commit claims the lane that was
// waiting for it, and that lane then starts waiting for the commit's first
// parent. Extra parents (merges) open a lane of their own.

export const ROW_HEIGHT = 36;
export const LANE_WIDTH = 18;
export const LANE_ORIGIN = 14;

const LANE_COLORS = [
  "#4f9dfd",
  "#f2994a",
  "#27ae91",
  "#c879e8",
  "#e8576f",
  "#d9bc3a",
  "#5ac8d8",
  "#8d93f5",
];

export function laneColor(lane) {
  return LANE_COLORS[lane % LANE_COLORS.length];
}

export function laneX(lane) {
  return LANE_ORIGIN + lane * LANE_WIDTH;
}

export function rowY(row) {
  return ROW_HEIGHT / 2 + row * ROW_HEIGHT;
}

export function layoutCommits(commits) {
  const lanes = []; // lanes[i] = hash that lane i is waiting for, or null
  const placed = new Map();
  const rows = [];
  let laneCount = 1;

  commits.forEach((commit, row) => {
    let lane = lanes.indexOf(commit.hash);
    if (lane === -1) {
      lane = lanes.indexOf(null);
      if (lane === -1) {
        lane = lanes.length;
        lanes.push(null);
      }
    }

    // A commit with several children is awaited by several lanes; it occupies
    // one of them and releases the rest.
    for (let i = 0; i < lanes.length; i++) {
      if (i !== lane && lanes[i] === commit.hash) lanes[i] = null;
    }

    lanes[lane] = commit.parents.length > 0 ? commit.parents[0] : null;

    for (let k = 1; k < commit.parents.length; k++) {
      const parent = commit.parents[k];
      if (lanes.includes(parent)) continue;
      let slot = lanes.indexOf(null);
      if (slot === -1) {
        slot = lanes.length;
        lanes.push(null);
      }
      lanes[slot] = parent;
    }

    placed.set(commit.hash, { row, lane });
    rows.push({ commit, row, lane });
    laneCount = Math.max(laneCount, lanes.length);
  });

  const edges = [];
  for (const { commit, row, lane } of rows) {
    for (const parentHash of commit.parents) {
      const parent = placed.get(parentHash);
      // Parents outside the loaded window have nowhere to draw to.
      if (!parent) continue;
      edges.push({ fromRow: row, fromLane: lane, toRow: parent.row, toLane: parent.lane });
    }
  }

  return { rows, edges, laneCount };
}

function edgePath(edge) {
  const x1 = laneX(edge.fromLane);
  const y1 = rowY(edge.fromRow);
  const x2 = laneX(edge.toLane);
  const y2 = rowY(edge.toRow);

  if (x1 === x2) return `M ${x1} ${y1} L ${x2} ${y2}`;

  // Travel down the child's lane first, then curve across just above the
  // parent, so crossing edges stay readable instead of cutting diagonally.
  const bend = Math.max(y1, y2 - ROW_HEIGHT);
  const mid = (bend + y2) / 2;
  return `M ${x1} ${y1} L ${x1} ${bend} C ${x1} ${mid} ${x2} ${mid} ${x2} ${y2}`;
}

export function renderGraph(svg, layout, headHash) {
  const { rows, edges, laneCount } = layout;
  const width = laneX(laneCount) + LANE_WIDTH;
  const height = Math.max(rows.length * ROW_HEIGHT, ROW_HEIGHT);

  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.replaceChildren();

  const ns = "http://www.w3.org/2000/svg";

  for (const edge of edges) {
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", edgePath(edge));
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", laneColor(edge.toLane === edge.fromLane ? edge.fromLane : edge.toLane));
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("opacity", "0.75");
    svg.append(path);
  }

  for (const { commit, row, lane } of rows) {
    const isHead = commit.hash === headHash;
    const node = document.createElementNS(ns, "circle");
    node.setAttribute("cx", String(laneX(lane)));
    node.setAttribute("cy", String(rowY(row)));
    node.setAttribute("r", isHead ? "6" : "4.5");
    node.setAttribute("fill", commit.parents.length > 1 ? "var(--surface)" : laneColor(lane));
    node.setAttribute("stroke", laneColor(lane));
    node.setAttribute("stroke-width", isHead ? "3" : "2");
    svg.append(node);
  }

  return width;
}
