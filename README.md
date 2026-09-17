# visual-git

A local web GUI for git. Every button runs a plain git command and shows you
which one, so you can see what you are actually doing instead of memorising it.

Git's data model is excellent; its command line is not. This is a thin,
readable layer over the commands — not a replacement for them, and not a
different model of how git works.

![four panels: branches and reflog, a commit graph, the working tree, and a log of commands run](docs/screenshot.png)

## Running it

Nothing to install: Python 3.8+ and git. CodeMirror is vendored under
`static/vendor/` (MIT licensed), so nothing is fetched at runtime and the app
works offline.

```sh
python3 server.py /path/to/repo     # macOS / Linux
py server.py C:\path\to\repo        # Windows
```

The repository is just that argument, so point it at any repo you like — pass
any folder inside one and it finds the root. One repo per server; use `--port`
to run a second alongside it. `--no-browser` skips opening a window. Stop it
with ctrl-c.

## What it does

**Staging and committing.** Stage and unstage whole files, or click a file to
see its diff and stage one hunk at a time. Commit, amend, or undo the last
commit while keeping its changes staged.

**Undo and recovery.** The reflog is shown as a plain list of every state the
repository has been in, including ones no branch points at any more, with a
one-click restore. This is how you recover from a bad reset or rebase.

**History rewriting.** A visual interactive rebase: set each commit to pick,
reword, squash, fixup or drop, reorder them, and run it. The todo list and any
new commit messages are fed to git through `GIT_SEQUENCE_EDITOR` and
`GIT_EDITOR`, so nothing opens an editor.

**Branches and merges.** The commit graph is drawn from the parent links, one
column per line of development, so merges and divergence are visible. Branches
list their ahead/behind counts against their upstream. Merge conflicts surface
the conflicted files and an abort button.

**Remotes.** Fetch (`--all --prune`), pull and push, with how far ahead or
behind your branch is shown before you act. Pull is `--ff-only`: if the
histories have diverged it fails and changes nothing rather than quietly
writing a merge commit. Push offers `--force-with-lease` only after a push is
rejected, behind a confirmation — it refuses if the remote moved since your
last fetch.

Remote commands run with `GIT_TERMINAL_PROMPT=0`, so they cannot stop to ask
for a password: your credentials need to already work without prompting (an
SSH key, or a credential helper). Otherwise the command fails with a visible
error instead of hanging.

**Editing.** An Editor tab with a collapsible tree of every file git tracks
(plus untracked ones it isn't ignoring) and a CodeMirror pane beside it.
Folders start closed, so a repo opens showing its shape rather than every file
in it, and the filter box searches the whole tree. Save
with the button or ctrl-S; the file then shows up under Changes, ready to
stage and commit without leaving the page. Existing line endings are kept, so
saving a CRLF file doesn't turn every line into a diff.

![the editor tab: file list, a C++ file open with highlighting, and the saved file appearing under Changes](docs/editor.png)

The `.git` directory is not readable or writable through the editor — editing
hooks or config from a web page is a long way round to running arbitrary code.

## What it does not do

- Hunk-level staging, not line-level.
- The editor opens UTF-8 text files under 2 MB. No binaries, no creating or
  deleting files, no rename.
- The rebase editor covers the run of ordinary commits below `HEAD`, up to
  eight of them. It stops at the first merge commit, because a plain
  interactive rebase cannot replay one.
- Conflicts are surfaced, not resolved — edit the files yourself, then stage.

## Notes on safety

Destructive actions (discarding changes, `reset --hard`, deleting a branch,
rebasing) require confirmation and tell you whether the reflog can get the
state back.

The server binds to `127.0.0.1` only, and every API call requires both a token
generated at startup and a custom header, so a web page you happen to have open
elsewhere cannot drive it. Git arguments are built server-side from a fixed set
of actions and passed as an argument list — the browser cannot name a git
subcommand, pass a flag, or reach a path outside the repository.

Treat it as a local development tool. It is not built to be exposed to a
network.
