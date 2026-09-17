import { layoutCommits, renderGraph, ROW_HEIGHT } from "/graph.js";

const TOKEN = new URLSearchParams(location.search).get("token") ?? "";

const dom = {
  repoPath: document.getElementById("repo-path"),
  branchChip: document.getElementById("branch-chip"),
  trackChip: document.getElementById("track-chip"),
  alert: document.getElementById("alert"),
  branches: document.getElementById("branches"),
  remoteState: document.getElementById("remote-state"),
  reflog: document.getElementById("reflog"),
  graph: document.getElementById("graph"),
  commitRows: document.getElementById("commit-rows"),
  staged: document.getElementById("staged"),
  unstaged: document.getElementById("unstaged"),
  commitMessage: document.getElementById("commit-message"),
  log: document.getElementById("log"),
  diffPanel: document.getElementById("diff-panel"),
  diffTitle: document.getElementById("diff-title"),
  diffCommand: document.getElementById("diff-command"),
  diffBody: document.getElementById("diff-body"),
  modal: document.getElementById("modal"),
  modalTitle: document.getElementById("modal-title"),
  modalText: document.getElementById("modal-text"),
  modalCommand: document.getElementById("modal-command"),
  rebaseModal: document.getElementById("rebase-modal"),
  rebaseList: document.getElementById("rebase-list"),
};

let state = null;
let openDiff = null;

// --- server access ---------------------------------------------------------

async function api(path) {
  const response = await fetch(path, { headers: { "X-VG-Token": TOKEN } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "request failed");
  return data;
}

async function run(action, payload = {}) {
  const response = await fetch("/api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-VG-Token": TOKEN },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await response.json();
  if (!response.ok) {
    showAlert(data.error ?? "request failed");
    return null;
  }
  for (const result of data.results) logCommand(result);
  const failed = data.results.find((result) => result.code !== 0);
  if (failed) {
    showAlert(failed.stderr.trim() || `git exited with code ${failed.code}`);
  } else {
    hideAlert();
  }
  await refresh();
  return data.results;
}

// --- small helpers ---------------------------------------------------------

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else if (value !== null && value !== undefined) node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) {
    if (child) node.append(child);
  }
  return node;
}

function showAlert(message, kind = "error") {
  dom.alert.className = kind === "notice" ? "alert notice" : "alert";
  dom.alert.replaceChildren(el("div", { text: message }));
  return dom.alert;
}

function hideAlert() {
  dom.alert.classList.add("hidden");
}

function logCommand(result) {
  const entry = el("div", { class: result.code === 0 ? "log-entry" : "log-entry failed" }, [
    el("span", { class: "prompt", text: "$" }),
    el("span", { class: "cmd", text: result.command }),
  ]);
  const output = (result.stderr || result.stdout || "").trim();
  if (output) {
    entry.append(el("span", { class: "out", text: output.split("\n")[0].slice(0, 120) }));
  }
  dom.log.prepend(entry);
  while (dom.log.childElementCount > 80) dom.log.lastElementChild.remove();
}

function confirmAction({ title, text, command }) {
  return new Promise((resolve) => {
    dom.modalTitle.textContent = title;
    dom.modalText.textContent = text;
    dom.modalCommand.textContent = command;
    dom.modal.classList.remove("hidden");

    const finish = (answer) => {
      dom.modal.classList.add("hidden");
      resolve(answer);
    };

    // Swapping in fresh buttons drops the listeners from any previous call.
    document.getElementById("modal-confirm").replaceWith(
      el("button", {
        id: "modal-confirm",
        class: "danger",
        text: "confirm",
        onclick: () => finish(true),
      })
    );
    document.getElementById("modal-cancel").replaceWith(
      el("button", { id: "modal-cancel", class: "ghost", text: "cancel", onclick: () => finish(false) })
    );
  });
}

// --- rendering -------------------------------------------------------------

function findHeadHash(commits) {
  for (const commit of commits) {
    if (commit.refs.some((ref) => ref === "HEAD" || ref.startsWith("HEAD ->"))) {
      return commit.hash;
    }
  }
  return null;
}

function renderHeader() {
  const { status, repo } = state;
  dom.repoPath.textContent = repo;
  dom.branchChip.textContent = status.detached ? "detached HEAD" : status.branch ?? "";

  if (status.upstream) {
    const parts = [];
    if (status.ahead) parts.push(`${status.ahead} ahead`);
    if (status.behind) parts.push(`${status.behind} behind`);
    dom.trackChip.textContent = parts.length
      ? `${status.upstream}: ${parts.join(", ")}`
      : `in sync with ${status.upstream}`;
  } else {
    dom.trackChip.textContent = "";
  }
}

function renderRemote() {
  const { status } = state;
  dom.remoteState.replaceChildren();

  if (!status.upstream) {
    dom.remoteState.append(
      el("div", { text: "No upstream yet — pushing will publish this branch to origin." })
    );
    return;
  }

  const parts = [];
  if (status.ahead) parts.push(`${status.ahead} commit(s) to push`);
  if (status.behind) parts.push(`${status.behind} to pull`);
  dom.remoteState.append(
    el("div", { text: parts.length ? parts.join(", ") : "up to date with the remote" }),
    el("span", { class: "upstream", text: status.upstream })
  );
}

function offerForcePush() {
  dom.alert.append(
    el("div", { class: "row" }, [
      el("button", {
        class: "danger",
        text: "force push (--force-with-lease)",
        onclick: async () => {
          const confirmed = await confirmAction({
            title: "Overwrite the remote branch?",
            text:
              "This replaces the commits on the remote with yours. --force-with-lease refuses if someone else pushed since your last fetch, but work of theirs that you have never fetched would still be lost.",
            command: "git push --force-with-lease",
          });
          if (confirmed) pushChanges({ force: true });
        },
      }),
    ])
  );
}

async function pushChanges({ force = false } = {}) {
  const { branch, upstream, detached } = state.status;
  const payload = force ? { force: true, confirm: true } : {};
  if (!upstream && branch && !detached) {
    payload.setUpstream = true;
    payload.remote = "origin";
    payload.branch = branch;
  }

  const results = await run("push", payload);
  if (!results || force) return;

  // A rejected push means the remote has commits we do not; that is the one
  // case where force-with-lease is the honest next step.
  const failed = results.find((result) => result.code !== 0);
  if (failed && /rejected|non-fast-forward|fetch first/i.test(failed.stderr)) {
    offerForcePush();
  }
}

function renderInProgressState() {
  const { status } = state;
  if (status.rebaseInProgress || status.mergeInProgress) {
    const which = status.rebaseInProgress ? "rebase" : "merge";
    const node = showAlert(
      `A ${which} is in progress. Resolve the conflicted files and commit, or abort to return to where you started.`,
      "notice"
    );
    node.append(
      el("div", { class: "row" }, [
        el("button", {
          class: "danger",
          text: `abort ${which}`,
          onclick: () => run("abort", { which }),
        }),
      ])
    );
  } else if (dom.alert.classList.contains("notice")) {
    hideAlert();
  }
}

function renderBranches() {
  const local = state.branches.filter((branch) => !branch.name.includes("/"));
  const remote = state.branches.filter((branch) => branch.name.includes("/"));
  dom.branches.replaceChildren();

  for (const branch of [...local, ...remote]) {
    const row = el("div", { class: branch.current ? "row-item current" : "row-item" }, [
      el("span", { class: "name", text: branch.name }),
      branch.track ? el("span", { class: "meta", text: branch.track.replace(/[[\]]/g, "") }) : null,
    ]);

    if (!branch.current) {
      const actions = el("div", { class: "row-actions" }, [
        el("button", {
          class: "ghost small",
          text: "checkout",
          title: `git checkout ${branch.name}`,
          onclick: (event) => {
            event.stopPropagation();
            run("checkout", { ref: branch.name });
          },
        }),
        el("button", {
          class: "ghost small",
          text: "merge",
          title: `git merge --no-edit ${branch.name}`,
          onclick: (event) => {
            event.stopPropagation();
            run("merge", { ref: branch.name });
          },
        }),
      ]);
      if (!branch.name.includes("/")) {
        actions.append(
          el("button", {
            class: "ghost small",
            text: "delete",
            title: `git branch --delete ${branch.name}`,
            onclick: async (event) => {
              event.stopPropagation();
              const confirmed = await confirmAction({
                title: `Delete ${branch.name}?`,
                text:
                  "Commits only reachable from this branch become hard to find, though the reflog keeps them for a while.",
                command: `git branch --delete ${branch.name}`,
              });
              if (confirmed) run("deleteBranch", { name: branch.name, confirm: true });
            },
          })
        );
      }
      row.append(actions);
    }
    dom.branches.append(row);
  }

  if (!state.branches.length) {
    dom.branches.append(el("div", { class: "empty", text: "no branches yet" }));
  }
}

function renderReflog() {
  dom.reflog.replaceChildren();
  for (const entry of state.reflog) {
    const row = el("div", { class: "row-item" }, [
      el("span", { class: "action", text: entry.action }),
      el("span", { class: "meta", text: `${entry.selector} · ${entry.when}` }),
      el("button", {
        class: "ghost small",
        text: "restore",
        title: `git reset --hard ${entry.hash.slice(0, 8)}`,
        onclick: async () => {
          const confirmed = await confirmAction({
            title: "Restore this state?",
            text:
              "Uncommitted changes in your working tree are lost. The state you are leaving is itself written to the reflog, so this is reversible the same way.",
            command: `git reset --hard ${entry.hash.slice(0, 8)}`,
          });
          if (confirmed) run("restoreState", { hash: entry.hash, confirm: true });
        },
      }),
    ]);
    dom.reflog.append(row);
  }
  if (!state.reflog.length) {
    dom.reflog.append(el("div", { class: "empty", text: "no history recorded yet" }));
  }
}

function renderHistory() {
  const layout = layoutCommits(state.commits);
  const headHash = findHeadHash(state.commits);
  renderGraph(dom.graph, layout, headHash);

  dom.commitRows.replaceChildren();
  for (const { commit } of layout.rows) {
    const row = el("div", { class: "commit-row", style: `height:${ROW_HEIGHT}px` });
    for (const ref of commit.refs) {
      const isHead = ref === "HEAD" || ref.startsWith("HEAD ->");
      row.append(el("span", { class: isHead ? "ref-tag head" : "ref-tag", text: ref }));
    }
    row.append(
      el("span", { class: "subject", text: commit.subject || "(no message)" }),
      el("span", { class: "who", text: commit.author }),
      el("span", { class: "who", text: commit.when }),
      el("span", { class: "hash", text: commit.hash.slice(0, 8) })
    );
    dom.commitRows.append(row);
  }

  if (!layout.rows.length) {
    dom.commitRows.append(el("div", { class: "empty", text: "no commits yet" }));
  }
}

function fileRow(file, { staged, untracked }) {
  const row = el("div", { class: "row-item" }, [
    el("span", { class: "code", "data-code": file.code, text: file.code }),
    el("span", { class: "name", text: file.path }),
  ]);
  row.addEventListener("click", () => showDiff(file.path, { staged, untracked }));

  const actions = el("div", { class: "row-actions" });
  if (staged) {
    actions.append(
      el("button", {
        class: "ghost small",
        text: "unstage",
        title: `git restore --staged -- ${file.path}`,
        onclick: (event) => {
          event.stopPropagation();
          run("unstage", { path: file.path });
        },
      })
    );
  } else {
    actions.append(
      el("button", {
        class: "ghost small",
        text: "stage",
        title: `git add -- ${file.path}`,
        onclick: (event) => {
          event.stopPropagation();
          run("stage", { path: file.path });
        },
      }),
      el("button", {
        class: "ghost small",
        text: "discard",
        title: untracked ? `git clean --force -- ${file.path}` : `git restore -- ${file.path}`,
        onclick: async (event) => {
          event.stopPropagation();
          const confirmed = await confirmAction({
            title: `Discard changes to ${file.path}?`,
            text:
              "These edits were never committed, so git has no copy of them. This cannot be undone.",
            command: untracked
              ? `git clean --force -- ${file.path}`
              : `git restore -- ${file.path}`,
          });
          if (confirmed) run("discard", { path: file.path, untracked, confirm: true });
        },
      })
    );
  }
  row.append(actions);
  return row;
}

function renderFiles() {
  const { status } = state;
  dom.staged.replaceChildren();
  for (const file of status.staged) {
    dom.staged.append(fileRow(file, { staged: true, untracked: false }));
  }
  if (!status.staged.length) {
    dom.staged.append(el("div", { class: "empty", text: "nothing staged" }));
  }

  dom.unstaged.replaceChildren();
  for (const file of status.conflicted) {
    const row = fileRow({ ...file, code: "!" }, { staged: false, untracked: false });
    row.title = "Conflicted: edit the file to resolve, then stage it";
    dom.unstaged.append(row);
  }
  for (const file of status.unstaged) {
    dom.unstaged.append(fileRow(file, { staged: false, untracked: false }));
  }
  for (const file of status.untracked) {
    dom.unstaged.append(fileRow(file, { staged: false, untracked: true }));
  }
  const changeCount =
    status.unstaged.length + status.untracked.length + status.conflicted.length;
  if (!changeCount) {
    dom.unstaged.append(el("div", { class: "empty", text: "working tree clean" }));
  }
}

// --- diff ------------------------------------------------------------------

function splitHunks(diffText) {
  const lines = diffText.split("\n");
  const hunks = [];
  let current = null;
  for (const line of lines) {
    if (line.startsWith("@@")) {
      if (current) hunks.push(current);
      current = [line];
    } else if (current) {
      current.push(line);
    }
  }
  if (current) hunks.push(current);
  return hunks;
}

async function showDiff(path, { staged, untracked }) {
  const query = new URLSearchParams({
    path,
    staged: staged ? "1" : "0",
    untracked: untracked ? "1" : "0",
  });
  let data;
  try {
    data = await api(`/api/diff?${query}`);
  } catch (error) {
    showAlert(error.message);
    return;
  }

  openDiff = { path, staged, untracked };
  dom.diffTitle.textContent = path;
  dom.diffCommand.textContent = data.command;
  dom.diffBody.replaceChildren();

  const hunks = splitHunks(data.diff);
  if (!hunks.length) {
    dom.diffBody.append(el("div", { class: "empty", text: "no textual changes to show" }));
  }

  hunks.forEach((lines, index) => {
    const head = el("div", { class: "hunk-head" }, [
      el("span", { class: "range", text: lines[0] }),
    ]);
    if (!untracked) {
      head.append(
        el("button", {
          class: "ghost small",
          text: staged ? "unstage this hunk" : "stage this hunk",
          title: staged
            ? "git apply --cached --reverse (just this hunk)"
            : "git apply --cached (just this hunk)",
          onclick: async () => {
            await run("stageHunk", { path, hunkIndex: index, reverse: staged });
            if (openDiff) showDiff(openDiff.path, openDiff);
          },
        })
      );
    }

    const body = el("div");
    for (const line of lines.slice(1)) {
      let cls = "diff-line";
      if (line.startsWith("+")) cls += " add";
      else if (line.startsWith("-")) cls += " del";
      else if (line.startsWith("\\")) cls += " meta";
      body.append(el("div", { class: cls, text: line }));
    }

    dom.diffBody.append(el("div", { class: "hunk" }, [head, body]));
  });

  dom.diffPanel.classList.remove("hidden");
}

// --- rebase editor ---------------------------------------------------------

// Collect the run of ordinary commits below HEAD. The walk stops at the first
// merge or at the root, because a plain interactive rebase cannot replay a
// merge commit - that commit becomes the base the rest are replayed onto.
function headChain(limit) {
  const byHash = new Map(state.commits.map((commit) => [commit.hash, commit]));
  const chain = [];
  let cursor = findHeadHash(state.commits);
  while (cursor && chain.length < limit) {
    const commit = byHash.get(cursor);
    if (!commit) break;
    if (commit.parents.length !== 1) break;
    chain.push(commit);
    cursor = commit.parents[0];
  }
  return { chain, baseHash: cursor ?? null };
}

function openRebaseEditor() {
  const { chain, baseHash } = headChain(8);
  if (!baseHash || chain.length < 1) {
    showAlert(
      "Nothing to rewrite here: this needs at least one ordinary commit sitting on top of an earlier one."
    );
    return;
  }

  // git replays the todo list top to bottom, oldest first.
  const items = chain
    .slice()
    .reverse()
    .map((commit) => ({ hash: commit.hash, subject: commit.subject, action: "pick", message: "" }));

  const draw = () => {
    dom.rebaseList.replaceChildren();
    items.forEach((item, index) => {
      const select = el("select", {
        onchange: (event) => {
          item.action = event.target.value;
          draw();
        },
      });
      for (const verb of ["pick", "reword", "squash", "fixup", "drop"]) {
        const option = el("option", { value: verb, text: verb });
        if (verb === item.action) option.selected = true;
        select.append(option);
      }

      const moves = el("div", { class: "move-buttons" }, [
        el("button", {
          class: "ghost",
          text: "↑",
          disabled: index === 0 ? "disabled" : null,
          onclick: () => {
            [items[index - 1], items[index]] = [items[index], items[index - 1]];
            draw();
          },
        }),
        el("button", {
          class: "ghost",
          text: "↓",
          disabled: index === items.length - 1 ? "disabled" : null,
          onclick: () => {
            [items[index + 1], items[index]] = [items[index], items[index + 1]];
            draw();
          },
        }),
      ]);

      const detail = el("div", {}, [
        el("div", { class: "subject", text: `${item.hash.slice(0, 8)}  ${item.subject}` }),
      ]);
      if (item.action === "reword" || item.action === "squash") {
        detail.append(
          el("input", {
            type: "text",
            placeholder: item.action === "squash" ? "combined message" : "new message",
            value: item.message || item.subject,
            oninput: (event) => {
              item.message = event.target.value;
            },
          })
        );
        if (!item.message) item.message = item.subject;
      }

      dom.rebaseList.append(
        el("div", { class: item.action === "drop" ? "rebase-item dropped" : "rebase-item" }, [
          moves,
          select,
          detail,
        ])
      );
    });
  };

  draw();
  dom.rebaseModal.classList.remove("hidden");

  document.getElementById("rebase-run").onclick = async () => {
    if (items[0].action === "squash" || items[0].action === "fixup") {
      showAlert("The oldest commit has nothing above it to fold into.");
      return;
    }
    if (items.every((item) => item.action === "drop")) {
      showAlert("Dropping every commit would leave nothing to rebase.");
      return;
    }
    const confirmed = await confirmAction({
      title: "Rewrite these commits?",
      text:
        "Rebasing replaces commits with new ones. If you have already pushed them, the remote and your branch will disagree. The reflog keeps the old chain if you need it back.",
      command: `git rebase --interactive ${baseHash.slice(0, 8)}`,
    });
    if (!confirmed) return;

    dom.rebaseModal.classList.add("hidden");
    await run("rebase", {
      base: baseHash,
      confirm: true,
      todo: items.map((item) => ({
        action: item.action,
        hash: item.hash,
        message: item.message || item.subject,
      })),
    });
  };
}

// --- wiring ----------------------------------------------------------------

async function refresh() {
  try {
    state = await api("/api/state?limit=200");
  } catch (error) {
    showAlert(error.message);
    return;
  }
  renderHeader();
  renderRemote();
  renderBranches();
  renderReflog();
  renderHistory();
  renderFiles();
  renderInProgressState();

  if (openDiff) {
    const stillListed = [
      ...state.status.staged,
      ...state.status.unstaged,
      ...state.status.untracked,
      ...state.status.conflicted,
    ].some((file) => file.path === openDiff.path);
    if (!stillListed) {
      dom.diffPanel.classList.add("hidden");
      openDiff = null;
    }
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("visual-git-theme", theme);
  } catch {
    // Private windows can refuse storage; the theme just won't persist.
  }
}

function initTheme() {
  let stored = null;
  try {
    stored = localStorage.getItem("visual-git-theme");
  } catch {
    stored = null;
  }
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  applyTheme(stored ?? (prefersLight ? "light" : "dark"));
}

document.getElementById("refresh").onclick = refresh;
document.getElementById("theme-toggle").onclick = () => {
  applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
};
document.getElementById("fetch").onclick = () => run("fetch");
document.getElementById("pull").onclick = () => run("pull");
document.getElementById("push").onclick = () => pushChanges();
document.getElementById("stage-all").onclick = () => run("stageAll");
document.getElementById("unstage-all").onclick = () => run("unstageAll");
document.getElementById("diff-close").onclick = () => {
  dom.diffPanel.classList.add("hidden");
  openDiff = null;
};
document.getElementById("open-rebase").onclick = openRebaseEditor;
document.getElementById("rebase-cancel").onclick = () =>
  dom.rebaseModal.classList.add("hidden");

document.getElementById("create-branch").onclick = () => {
  const input = document.getElementById("new-branch");
  const name = input.value.trim();
  if (!name) return;
  input.value = "";
  run("createBranch", { name });
};

document.getElementById("commit").onclick = () => {
  const message = dom.commitMessage.value.trim();
  if (!message) {
    showAlert("Write a commit message first.");
    return;
  }
  dom.commitMessage.value = "";
  run("commit", { message });
};

document.getElementById("amend").onclick = async () => {
  const message = dom.commitMessage.value.trim() || null;
  const confirmed = await confirmAction({
    title: "Replace the last commit?",
    text:
      "Amending creates a new commit in place of the old one. If the old one was already pushed, the remote will disagree with your branch.",
    command: "git commit --amend",
  });
  if (!confirmed) return;
  if (!message) {
    showAlert("Write the replacement message in the commit box first.");
    return;
  }
  dom.commitMessage.value = "";
  run("commit", { message, amend: true });
};

document.getElementById("undo-commit").onclick = async () => {
  const confirmed = await confirmAction({
    title: "Undo the last commit?",
    text: "The commit is removed but every change it contained stays staged, ready to re-commit.",
    command: "git reset --soft HEAD~1",
  });
  if (confirmed) run("undoCommit", { confirm: true });
};

initTheme();
refresh();
