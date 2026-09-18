#!/usr/bin/env python3
"""visual-git - a local web GUI for git.

Every button in the UI maps to a real git command. The exact argv that ran is
returned with each response so the browser can show it, which keeps the app a
transparent wrapper rather than a black box.
"""

from __future__ import annotations

import argparse
import http.server
import json
import os
import re
import secrets
import shlex
import subprocess
import sys
import tempfile
import urllib.parse
import webbrowser
from pathlib import Path

STATIC_DIR = Path(__file__).resolve().parent / "static"
TOKEN = secrets.token_urlsafe(24)

# A ref that starts with "-" would be read by git as an option, so reject those.
SAFE_REF = re.compile(r"^(?!-)[A-Za-z0-9._/+-]{1,255}$")
SAFE_HASH = re.compile(r"^[0-9a-f]{4,40}$")

UNIT_SEP = "\x1f"
RECORD_SEP = "\x1e"


class BadRequest(Exception):
    pass


def run_git(repo, args, stdin_text=None, extra_env=None, timeout=None):
    """Run one git command. Arguments are always a list, never a shell string."""
    env = os.environ.copy()
    # Without this, a command needing a password would block the request
    # forever instead of failing with something the UI can show.
    env["GIT_TERMINAL_PROMPT"] = "0"
    if extra_env:
        env.update(extra_env)
    command = "git " + " ".join(shlex.quote(a) for a in args)
    try:
        proc = subprocess.run(
            ["git", *args],
            cwd=repo,
            env=env,
            input=stdin_text,
            capture_output=True,
            # git writes UTF-8. Without naming it, Python decodes using the
            # system locale instead - cp949 on a Korean Windows install - and
            # one Hangul byte in a commit message or filename kills the reader
            # thread, which then hands back None instead of output.
            encoding="utf-8",
            errors="replace",
            timeout=timeout,
        )
    except subprocess.TimeoutExpired:
        return {
            "command": command,
            "stdout": "",
            "stderr": f"no response after {timeout}s - check the network or your git credentials",
            "code": -1,
        }
    return {
        "command": command,
        "stdout": proc.stdout,
        "stderr": proc.stderr,
        "code": proc.returncode,
    }


def git_output(repo, args):
    result = run_git(repo, args)
    if result["code"] != 0:
        raise BadRequest(result["stderr"].strip() or f"git {args[0]} failed")
    return result["stdout"]


def require_hash(payload, key):
    value = payload.get(key)
    if not isinstance(value, str) or not SAFE_HASH.match(value):
        raise BadRequest(f"{key!r} must be a commit hash")
    return value


def require_ref(payload, key):
    value = payload.get(key)
    if not isinstance(value, str) or not SAFE_REF.match(value):
        raise BadRequest(f"{key!r} is not a valid ref name")
    return value


def require_text(payload, key, max_length=8192):
    value = payload.get(key)
    if not isinstance(value, str) or not value.strip():
        raise BadRequest(f"{key!r} must not be empty")
    if len(value) > max_length:
        raise BadRequest(f"{key!r} is too long")
    return value


def require_path(repo, payload, key):
    """Validate a repo-relative path and confirm it stays inside the repo."""
    value = payload.get(key)
    if not isinstance(value, str) or not value or value.startswith("-"):
        raise BadRequest(f"{key!r} is not a valid path")
    if "\x00" in value:
        raise BadRequest(f"{key!r} contains a null byte")
    root = Path(repo).resolve()
    target = (root / value).resolve()
    if target != root and root not in target.parents:
        raise BadRequest(f"{key!r} escapes the repository")
    return value


def require_confirmed(payload):
    """Destructive actions must be explicitly confirmed by the UI."""
    if payload.get("confirm") is not True:
        raise BadRequest("this action is destructive and needs confirmation")


# --- readers ---------------------------------------------------------------


def read_status(repo):
    """Parse `git status --porcelain=v2`, which reports staged and unstaged
    state separately instead of collapsing them like the v1 format does."""
    raw = git_output(repo, ["status", "--porcelain=v2", "--branch", "--untracked-files=all"])
    state = {
        "branch": None,
        "upstream": None,
        "ahead": 0,
        "behind": 0,
        "detached": False,
        "staged": [],
        "unstaged": [],
        "untracked": [],
        "conflicted": [],
    }
    for line in raw.splitlines():
        if line.startswith("# branch.head "):
            head = line[len("# branch.head "):]
            state["branch"] = head
            state["detached"] = head == "(detached)"
        elif line.startswith("# branch.upstream "):
            state["upstream"] = line[len("# branch.upstream "):]
        elif line.startswith("# branch.ab "):
            # Written as "+2 -1": the signs are markers, not negative numbers.
            ahead, behind = line[len("# branch.ab "):].split()
            state["ahead"] = abs(int(ahead))
            state["behind"] = abs(int(behind))
        elif line.startswith("1 ") or line.startswith("2 "):
            fields = line.split(" ", 8)
            xy = fields[1]
            path = fields[8]
            if line.startswith("2 "):
                # Renames store "new\told"; only the new path matters here.
                path = path.split("\t", 1)[0]
            if xy[0] != ".":
                state["staged"].append({"path": path, "code": xy[0]})
            if xy[1] != ".":
                state["unstaged"].append({"path": path, "code": xy[1]})
        elif line.startswith("u "):
            fields = line.split(" ", 10)
            state["conflicted"].append({"path": fields[10], "code": fields[1]})
        elif line.startswith("? "):
            state["untracked"].append({"path": line[2:], "code": "?"})
    state["rebaseInProgress"] = any(
        (Path(repo) / ".git" / name).exists() for name in ("rebase-merge", "rebase-apply")
    )
    state["mergeInProgress"] = (Path(repo) / ".git" / "MERGE_HEAD").exists()
    return state


def read_graph(repo, limit):
    fmt = UNIT_SEP.join(["%H", "%P", "%an", "%ar", "%D", "%s"]) + RECORD_SEP
    result = run_git(
        repo,
        ["log", "--all", "--date-order", f"--max-count={limit}", f"--pretty=format:{fmt}"],
    )
    if result["code"] != 0:
        # A repository with no commits yet has nothing to draw, which is not an error.
        if "does not have any commits" in result["stderr"]:
            return []
        raise BadRequest(result["stderr"].strip() or "git log failed")
    raw = result["stdout"]
    commits = []
    for record in raw.split(RECORD_SEP):
        record = record.strip("\n")
        if not record:
            continue
        commit_hash, parents, author, when, refs, subject = record.split(UNIT_SEP)
        commits.append(
            {
                "hash": commit_hash,
                "parents": parents.split() if parents else [],
                "author": author,
                "when": when,
                "refs": [r.strip() for r in refs.split(",") if r.strip()],
                "subject": subject,
            }
        )
    return commits


def read_worktrees(repo):
    """Parse `git worktree list --porcelain`. The first entry is always the
    main worktree; the rest are linked ones."""
    result = run_git(repo, ["worktree", "list", "--porcelain"])
    if result["code"] != 0:
        return []

    trees, current = [], None
    for line in result["stdout"].splitlines():
        if not line.strip():
            continue
        if line.startswith("worktree "):
            current = {
                "path": line[len("worktree "):],
                "branch": None,
                "detached": False,
                "locked": False,
            }
            trees.append(current)
        elif current is None:
            continue
        elif line.startswith("branch "):
            current["branch"] = line[len("branch "):].replace("refs/heads/", "", 1)
        elif line == "detached":
            current["detached"] = True
        elif line.startswith("locked"):
            current["locked"] = True

    for index, tree in enumerate(trees):
        tree["main"] = index == 0
    return trees


def resolve_worktree(repo, payload):
    """Accept only a path git itself reports as a worktree of this repository,
    so the browser can never point the server at an arbitrary directory."""
    target = payload.get("path")
    if not isinstance(target, str) or not target:
        raise BadRequest("'path' is required")
    wanted = Path(target).resolve()
    for tree in read_worktrees(repo):
        if Path(tree["path"]).resolve() == wanted:
            return tree
    raise BadRequest("that path is not a worktree of this repository")


SAFE_STASH = re.compile(r"^stash@\{\d{1,4}\}$")


def require_stash(payload):
    value = payload.get("ref")
    if not isinstance(value, str) or not SAFE_STASH.match(value):
        raise BadRequest("'ref' must look like stash@{0}")
    return value


def read_stashes(repo):
    fmt = UNIT_SEP.join(["%gd", "%gs", "%ar"]) + RECORD_SEP
    result = run_git(repo, ["stash", "list", f"--pretty=format:{fmt}"])
    if result["code"] != 0:
        return []
    entries = []
    for record in result["stdout"].split(RECORD_SEP):
        record = record.strip("\n")
        if not record:
            continue
        ref, subject, when = record.split(UNIT_SEP)
        entries.append({"ref": ref, "subject": subject, "when": when})
    return entries


def read_branches(repo):
    fmt = UNIT_SEP.join(
        ["%(refname:short)", "%(objectname)", "%(upstream:short)", "%(upstream:track)", "%(HEAD)"]
    )
    raw = git_output(repo, ["for-each-ref", f"--format={fmt}", "refs/heads", "refs/remotes"])
    branches = []
    for line in raw.splitlines():
        if not line.strip():
            continue
        name, objectname, upstream, track, head = line.split(UNIT_SEP)
        branches.append(
            {
                "name": name,
                "hash": objectname,
                "upstream": upstream or None,
                "track": track or "",
                "current": head == "*",
            }
        )
    return branches


def read_reflog(repo, limit):
    fmt = UNIT_SEP.join(["%H", "%gd", "%gs", "%ar"]) + RECORD_SEP
    result = run_git(repo, ["reflog", f"--max-count={limit}", f"--pretty=format:{fmt}"])
    raw = result["stdout"] if result["code"] == 0 else ""
    entries = []
    for record in raw.split(RECORD_SEP):
        record = record.strip("\n")
        if not record:
            continue
        commit_hash, selector, action, when = record.split(UNIT_SEP)
        entries.append(
            {"hash": commit_hash, "selector": selector, "action": action, "when": when}
        )
    return entries


def read_diff(repo, path, staged, untracked):
    if untracked:
        # An untracked file has no blob to diff against, so compare with /dev/null.
        result = run_git(repo, ["diff", "--no-index", "--", os.devnull, path])
        # --no-index exits 1 whenever it finds differences, which is the normal case.
        if result["code"] not in (0, 1):
            raise BadRequest(result["stderr"].strip() or "diff failed")
        return result
    args = ["diff"] + (["--cached"] if staged else []) + ["--", path]
    return run_git(repo, args)


MAX_EDIT_BYTES = 2_000_000


def require_editable_path(repo, payload, key):
    """A path inside the repo that is not part of git's own storage.

    Writing into .git would let the page change hooks or config, which is a
    long way round to arbitrary code execution.
    """
    value = require_path(repo, payload, key)
    root = Path(repo).resolve()
    relative = (root / value).resolve().relative_to(root)
    if relative.parts and relative.parts[0] == ".git":
        raise BadRequest("the .git directory is not editable here")
    return value


def read_tree(repo):
    """Every file git tracks, plus untracked ones it is not ignoring."""
    raw = git_output(repo, ["ls-files", "--cached", "--others", "--exclude-standard"])
    return sorted({line for line in raw.splitlines() if line.strip()})


def read_file(repo, path):
    target = Path(repo) / path
    if not target.is_file():
        raise BadRequest("no such file")
    size = target.stat().st_size
    if size > MAX_EDIT_BYTES:
        raise BadRequest(f"{size} bytes is too large to open here")
    data = target.read_bytes()
    if b"\x00" in data:
        raise BadRequest("this looks like a binary file")
    try:
        return data.decode("utf-8")
    except UnicodeDecodeError:
        raise BadRequest("not UTF-8 text, so editing it here could corrupt it")


def split_hunks(diff_text):
    """Split a unified diff for a single file into its header and hunks."""
    lines = diff_text.splitlines(keepends=True)
    header, hunks, current = [], [], None
    for line in lines:
        if line.startswith("@@"):
            if current is not None:
                hunks.append(current)
            current = [line]
        elif current is None:
            header.append(line)
        else:
            current.append(line)
    if current is not None:
        hunks.append(current)
    return "".join(header), ["".join(h) for h in hunks]


# --- actions ---------------------------------------------------------------
#
# Each action builds its own argv from validated fields. The browser never gets
# to name a git subcommand or pass raw flags.


def action_stage(repo, payload):
    path = require_path(repo, payload, "path")
    return [run_git(repo, ["add", "--", path])]


def action_unstage(repo, payload):
    path = require_path(repo, payload, "path")
    return [run_git(repo, ["restore", "--staged", "--", path])]


def action_stage_all(repo, payload):
    return [run_git(repo, ["add", "--all"])]


def action_unstage_all(repo, payload):
    return [run_git(repo, ["reset"])]


def action_discard(repo, payload):
    require_confirmed(payload)
    path = require_path(repo, payload, "path")
    if payload.get("untracked") is True:
        return [run_git(repo, ["clean", "--force", "--", path])]
    return [run_git(repo, ["restore", "--", path])]


def action_stage_hunk(repo, payload):
    """Stage or unstage one hunk by rebuilding a minimal patch and applying it."""
    path = require_path(repo, payload, "path")
    index = payload.get("hunkIndex")
    if not isinstance(index, int) or index < 0:
        raise BadRequest("'hunkIndex' must be a non-negative integer")
    reverse = payload.get("reverse") is True

    source = ["diff"] + (["--cached"] if reverse else []) + ["--", path]
    diff_text = git_output(repo, source)
    header, hunks = split_hunks(diff_text)
    if index >= len(hunks):
        raise BadRequest("that hunk no longer exists; refresh and try again")

    patch = header + hunks[index]
    if not patch.endswith("\n"):
        patch += "\n"
    args = ["apply", "--cached"] + (["--reverse"] if reverse else []) + ["-"]
    return [run_git(repo, args, stdin_text=patch)]


def action_save_file(repo, payload):
    path = require_editable_path(repo, payload, "path")
    content = payload.get("content")
    if not isinstance(content, str):
        raise BadRequest("'content' must be a string")
    if len(content.encode("utf-8")) > MAX_EDIT_BYTES:
        raise BadRequest("that is too large to save")

    # newline="" writes exactly what the editor sent, so a CRLF file is not
    # silently rewritten to LF and turned into a whole-file diff.
    target = Path(repo) / path
    with open(target, "w", encoding="utf-8", newline="") as handle:
        handle.write(content)
    return [{"command": f"(editor) wrote {path}", "stdout": "", "stderr": "", "code": 0}]


def is_tracked(repo, path):
    return run_git(repo, ["ls-files", "--error-unmatch", "--", path])["code"] == 0


def action_create_file(repo, payload):
    path = require_editable_path(repo, payload, "path")
    target = Path(repo) / path
    if target.exists():
        raise BadRequest("that file already exists")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.touch()
    return [{"command": f"(editor) created {path}", "stdout": "", "stderr": "", "code": 0}]


def action_delete_file(repo, payload):
    require_confirmed(payload)
    path = require_editable_path(repo, payload, "path")
    target = Path(repo) / path
    if not target.is_file():
        raise BadRequest("no such file")
    # git rm records the deletion in the index; an untracked file git has never
    # seen is simply removed.
    if is_tracked(repo, path):
        return [run_git(repo, ["rm", "--", path])]
    target.unlink()
    return [{"command": f"(editor) deleted {path}", "stdout": "", "stderr": "", "code": 0}]


def action_rename_file(repo, payload):
    path = require_editable_path(repo, payload, "path")
    new_path = require_editable_path(repo, payload, "newPath")
    source = Path(repo) / path
    destination = Path(repo) / new_path
    if not source.is_file():
        raise BadRequest("no such file")
    if destination.exists():
        raise BadRequest("something is already at that path")

    destination.parent.mkdir(parents=True, exist_ok=True)
    if is_tracked(repo, path):
        return [run_git(repo, ["mv", "--", path, new_path])]
    source.rename(destination)
    return [
        {"command": f"(editor) renamed {path} to {new_path}", "stdout": "", "stderr": "", "code": 0}
    ]


def action_commit(repo, payload):
    message = require_text(payload, "message")
    args = ["commit", "--message", message]
    if payload.get("amend") is True:
        args.append("--amend")
    return [run_git(repo, args)]


def action_undo_commit(repo, payload):
    """Drop the last commit but keep its changes staged."""
    require_confirmed(payload)
    return [run_git(repo, ["reset", "--soft", "HEAD~1"])]


def action_restore_state(repo, payload):
    """Hard-reset to a reflog entry. The pre-reset state stays in the reflog."""
    require_confirmed(payload)
    target = require_hash(payload, "hash")
    return [run_git(repo, ["reset", "--hard", target])]


def action_checkout(repo, payload):
    ref = require_ref(payload, "ref")
    return [run_git(repo, ["checkout", ref])]


def action_create_branch(repo, payload):
    name = require_ref(payload, "name")
    return [run_git(repo, ["checkout", "-b", name])]


def action_delete_branch(repo, payload):
    require_confirmed(payload)
    name = require_ref(payload, "name")
    args = ["branch", "--delete"] + (["--force"] if payload.get("force") is True else []) + [name]
    return [run_git(repo, args)]


def action_merge(repo, payload):
    ref = require_ref(payload, "ref")
    return [run_git(repo, ["merge", "--no-edit", ref])]


def action_abort(repo, payload):
    """Get out of a half-finished merge or rebase."""
    which = payload.get("which")
    if which == "rebase":
        return [run_git(repo, ["rebase", "--abort"])]
    if which == "merge":
        return [run_git(repo, ["merge", "--abort"])]
    raise BadRequest("'which' must be 'rebase' or 'merge'")


NETWORK_TIMEOUT = 120


def action_fetch(repo, payload):
    """Update remote-tracking branches. Touches nothing in the working tree."""
    return [run_git(repo, ["fetch", "--all", "--prune"], timeout=NETWORK_TIMEOUT)]


def action_pull(repo, payload):
    """Fast-forward only: if the histories diverged this fails and changes
    nothing, rather than quietly writing a merge commit."""
    return [run_git(repo, ["pull", "--ff-only"], timeout=NETWORK_TIMEOUT)]


def action_push(repo, payload):
    args = ["push"]
    if payload.get("force") is True:
        require_confirmed(payload)
        args.append("--force-with-lease")
    if payload.get("setUpstream") is True:
        args += ["--set-upstream", require_ref(payload, "remote"), require_ref(payload, "branch")]
    return [run_git(repo, args, timeout=NETWORK_TIMEOUT)]


def action_stash_push(repo, payload):
    """Set the working tree aside. --include-untracked so new files come too,
    rather than being left behind looking like the stash did nothing."""
    args = ["stash", "push", "--include-untracked"]
    message = payload.get("message")
    if isinstance(message, str) and message.strip():
        args += ["--message", message.strip()[:500]]
    return [run_git(repo, args)]


def action_stash_apply(repo, payload):
    """pop applies the stash and drops it; a conflict leaves it in the list."""
    return [run_git(repo, ["stash", "pop", require_stash(payload)])]


def action_stash_drop(repo, payload):
    require_confirmed(payload)
    return [run_git(repo, ["stash", "drop", require_stash(payload)])]


def action_add_worktree(repo, payload):
    """Create a worktree as a sibling of the main one, named after the branch.

    The path is derived here rather than accepted from the browser, which keeps
    the directories this can create to one folder.
    """
    branch = require_ref(payload, "branch")
    slug = re.sub(r"[^A-Za-z0-9._-]", "-", branch).strip("-.")
    if not slug:
        raise BadRequest("that branch name leaves nothing usable for a folder name")

    trees = read_worktrees(repo)
    main_root = Path(trees[0]["path"]).resolve() if trees else Path(repo).resolve()
    target = main_root.parent / f"{main_root.name}-{slug}"
    if target.parent != main_root.parent:
        raise BadRequest("refusing to build a path outside the repository's folder")
    if target.exists():
        raise BadRequest(f"{target.name} already exists")

    known = run_git(repo, ["rev-parse", "--verify", "--quiet", f"refs/heads/{branch}"])
    if known["code"] == 0:
        args = ["worktree", "add", str(target), branch]
    else:
        args = ["worktree", "add", "-b", branch, str(target)]
    return [run_git(repo, args)]


def action_remove_worktree(repo, payload):
    require_confirmed(payload)
    tree = resolve_worktree(repo, payload)
    if tree["main"]:
        raise BadRequest("the main worktree cannot be removed")
    if Path(tree["path"]).resolve() == Path(repo).resolve():
        raise BadRequest("this is the worktree you are looking at; switch away from it first")
    return [run_git(repo, ["worktree", "remove", tree["path"]])]


def action_switch_worktree(repo, payload):
    """Point the server at another worktree of the same repository."""
    tree = resolve_worktree(repo, payload)
    Handler.repo = Path(tree["path"])
    return [
        {
            "command": f"(switched to {tree['path']})",
            "stdout": "",
            "stderr": "",
            "code": 0,
        }
    ]


REBASE_VERBS = {"pick", "reword", "squash", "fixup", "drop"}


def action_rebase(repo, payload):
    """Run an interactive rebase without opening an editor.

    git normally collects the todo list and any reworded messages through
    $GIT_SEQUENCE_EDITOR and $GIT_EDITOR. We point both at small helper scripts
    that write the values chosen in the UI, so the rebase runs unattended.
    """
    require_confirmed(payload)
    base = require_hash(payload, "base")
    todo = payload.get("todo")
    if not isinstance(todo, list) or not todo:
        raise BadRequest("'todo' must be a non-empty list")

    todo_lines, queued_messages = [], []
    for item in todo:
        if not isinstance(item, dict):
            raise BadRequest("each todo entry must be an object")
        verb = item.get("action")
        if verb not in REBASE_VERBS:
            raise BadRequest(f"unknown rebase action {verb!r}")
        commit_hash = require_hash(item, "hash")
        todo_lines.append(f"{verb} {commit_hash}")
        if verb in ("reword", "squash"):
            queued_messages.append(require_text(item, "message"))

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        todo_file = tmp_path / "todo"
        todo_file.write_text("\n".join(todo_lines) + "\n", encoding="utf-8")

        messages_file = tmp_path / "messages.json"
        messages_file.write_text(json.dumps(queued_messages), encoding="utf-8")

        sequence_editor = tmp_path / "sequence_editor.py"
        sequence_editor.write_text(
            "import shutil, sys\n"
            f"shutil.copyfile({str(todo_file)!r}, sys.argv[1])\n",
            encoding="utf-8",
        )

        # git calls the message editor once per reword/squash, in todo order, so
        # a queue file consumed from the front matches messages to commits.
        message_editor = tmp_path / "message_editor.py"
        message_editor.write_text(
            "import json, sys\n"
            f"queue_path = {str(messages_file)!r}\n"
            "with open(queue_path, encoding='utf-8') as handle:\n"
            "    queue = json.load(handle)\n"
            "if queue:\n"
            "    message = queue.pop(0)\n"
            "    with open(sys.argv[1], 'w', encoding='utf-8') as handle:\n"
            "        handle.write(message + '\\n')\n"
            "    with open(queue_path, 'w', encoding='utf-8') as handle:\n"
            "        json.dump(queue, handle)\n",
            encoding="utf-8",
        )

        env = {
            "GIT_SEQUENCE_EDITOR": f"{shlex.quote(sys.executable)} {shlex.quote(str(sequence_editor))}",
            "GIT_EDITOR": f"{shlex.quote(sys.executable)} {shlex.quote(str(message_editor))}",
        }
        return [run_git(repo, ["rebase", "--interactive", base], extra_env=env)]


ACTIONS = {
    "stage": action_stage,
    "unstage": action_unstage,
    "stageAll": action_stage_all,
    "unstageAll": action_unstage_all,
    "discard": action_discard,
    "stageHunk": action_stage_hunk,
    "saveFile": action_save_file,
    "createFile": action_create_file,
    "deleteFile": action_delete_file,
    "renameFile": action_rename_file,
    "commit": action_commit,
    "undoCommit": action_undo_commit,
    "restoreState": action_restore_state,
    "checkout": action_checkout,
    "createBranch": action_create_branch,
    "deleteBranch": action_delete_branch,
    "merge": action_merge,
    "abort": action_abort,
    "rebase": action_rebase,
    "fetch": action_fetch,
    "pull": action_pull,
    "push": action_push,
    "stashPush": action_stash_push,
    "stashApply": action_stash_apply,
    "stashDrop": action_stash_drop,
    "addWorktree": action_add_worktree,
    "removeWorktree": action_remove_worktree,
    "switchWorktree": action_switch_worktree,
}


class Handler(http.server.BaseHTTPRequestHandler):
    repo = None
    server_version = "visual-git"

    def log_message(self, fmt, *args):
        sys.stderr.write("  %s\n" % (fmt % args))

    # A browser on another site can issue a cross-origin POST but cannot read
    # the response or set a custom header, so requiring both a token and a
    # localhost Host header keeps other pages out of this repo.
    def authorized(self):
        host = self.headers.get("Host", "").split(":")[0]
        if host not in ("localhost", "127.0.0.1", "[::1]"):
            return False
        return secrets.compare_digest(self.headers.get("X-VG-Token", ""), TOKEN)

    def send_json(self, payload, status=200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urllib_parse(self.path)
        route, query = parsed

        if not route.startswith("/api/"):
            return self.serve_static(route)

        if not self.authorized():
            return self.send_json({"error": "unauthorized"}, status=403)

        try:
            if route == "/api/state":
                limit = clamp_int(query.get("limit", ["200"])[0], 1, 2000, 200)
                return self.send_json(
                    {
                        "status": read_status(self.repo),
                        "commits": read_graph(self.repo, limit),
                        "branches": read_branches(self.repo),
                        "reflog": read_reflog(self.repo, 50),
                        "worktrees": read_worktrees(self.repo),
                        "stashes": read_stashes(self.repo),
                        "repo": str(self.repo),
                    }
                )
            if route == "/api/tree":
                return self.send_json({"files": read_tree(self.repo)})
            if route == "/api/file":
                path = require_editable_path(
                    self.repo, {"path": query.get("path", [""])[0]}, "path"
                )
                return self.send_json({"path": path, "content": read_file(self.repo, path)})
            if route == "/api/commit":
                commit = require_hash({"hash": query.get("hash", [""])[0]}, "hash")
                result = run_git(
                    self.repo, ["show", "--patch", "--stat", "--format=fuller", commit]
                )
                if result["code"] != 0:
                    raise BadRequest(result["stderr"].strip() or "git show failed")
                return self.send_json({"text": result["stdout"], "command": result["command"]})
            if route == "/api/diff":
                path = require_path(self.repo, {"path": query.get("path", [""])[0]}, "path")
                staged = query.get("staged", ["0"])[0] == "1"
                untracked = query.get("untracked", ["0"])[0] == "1"
                result = read_diff(self.repo, path, staged, untracked)
                diff_text = result["stdout"]
                _, hunks = split_hunks(diff_text)
                return self.send_json(
                    {"diff": diff_text, "hunkCount": len(hunks), "command": result["command"]}
                )
        except BadRequest as exc:
            return self.send_json({"error": str(exc)}, status=400)

        self.send_json({"error": "unknown endpoint"}, status=404)

    def do_POST(self):
        route, _ = urllib_parse(self.path)
        if route != "/api/run":
            return self.send_json({"error": "unknown endpoint"}, status=404)
        if not self.authorized():
            return self.send_json({"error": "unauthorized"}, status=403)

        length = int(self.headers.get("Content-Length", "0"))
        if length > 1_000_000:
            return self.send_json({"error": "request too large"}, status=413)
        try:
            payload = json.loads(self.rfile.read(length) or b"{}")
        except json.JSONDecodeError:
            return self.send_json({"error": "invalid JSON"}, status=400)

        action = ACTIONS.get(payload.get("action"))
        if action is None:
            return self.send_json({"error": "unknown action"}, status=400)

        try:
            results = action(self.repo, payload)
        except BadRequest as exc:
            return self.send_json({"error": str(exc)}, status=400)
        return self.send_json({"results": results})

    def serve_static(self, route):
        name = "index.html" if route == "/" else route.lstrip("/")
        target = (STATIC_DIR / name).resolve()
        if STATIC_DIR not in target.parents or not target.is_file():
            self.send_error(404)
            return
        content_type = {
            ".html": "text/html; charset=utf-8",
            ".js": "text/javascript; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".svg": "image/svg+xml",
        }.get(target.suffix, "application/octet-stream")
        body = target.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def urllib_parse(path):
    parts = urllib.parse.urlsplit(path)
    return parts.path, urllib.parse.parse_qs(parts.query)


def clamp_int(raw, low, high, fallback):
    try:
        value = int(raw)
    except (TypeError, ValueError):
        return fallback
    return max(low, min(high, value))


def resolve_repo(candidate):
    result = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        cwd=candidate,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        sys.exit(f"visual-git: {candidate} is not inside a git repository")
    return Path(result.stdout.strip())


def create_server(repo, port=7373, attempts=20):
    """Bind the server and hand back the server object and the URL to open.

    Walks forward from the requested port rather than dying on "address
    already in use", which is what happens whenever a second repository is
    opened alongside the first.
    """
    Handler.repo = resolve_repo(repo)
    for offset in range(attempts):
        try:
            server = http.server.ThreadingHTTPServer(("127.0.0.1", port + offset), Handler)
        except OSError:
            continue
        url = f"http://127.0.0.1:{server.server_address[1]}/?token={TOKEN}"
        return server, url
    raise OSError(f"no free port between {port} and {port + attempts - 1}")


def main():
    parser = argparse.ArgumentParser(description="A local web GUI for git.")
    parser.add_argument("repo", nargs="?", default=".", help="path inside the repository")
    parser.add_argument("--port", type=int, default=7373)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()

    try:
        server, url = create_server(args.repo, args.port)
    except OSError as exc:
        sys.exit(f"visual-git: {exc}")

    print(f"visual-git  repo: {Handler.repo}")
    print(f"            open: {url}")
    print("            stop: ctrl-c")
    if not args.no_browser:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nvisual-git: stopped")


if __name__ == "__main__":
    main()
