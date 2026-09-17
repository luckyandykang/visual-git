#!/usr/bin/env python3
"""visual-git launcher: update, pick a repository, start the server.

Written so it behaves the same run from source or frozen into an executable:
when frozen, the folder to update is the one holding the executable rather
than the temporary directory the bundle unpacks into.
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

if getattr(sys, "frozen", False):
    HERE = Path(sys.executable).resolve().parent
else:
    HERE = Path(__file__).resolve().parent

# Kept outside the repository so it never shows up as an untracked file.
RECENT_FILE = Path.home() / ".visual-git-recent.json"
MAX_RECENT = 8


def run(args, cwd):
    return subprocess.run(
        args, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace"
    )


def update_self():
    print("Checking for updates...")
    result = run(["git", "pull"], HERE)
    if result.returncode != 0:
        reason = (result.stderr or result.stdout).strip().splitlines()
        print(f"  Could not update: {reason[0] if reason else 'git pull failed'}")
        print("  Carrying on with the version you have.")
    elif "Already up to date" in result.stdout:
        print("  Up to date.")
    else:
        print("  Updated.")


def load_recent():
    try:
        entries = json.loads(RECENT_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return []
    return [entry for entry in entries if isinstance(entry, str) and Path(entry).is_dir()]


def save_recent(paths):
    try:
        RECENT_FILE.write_text(json.dumps(paths[:MAX_RECENT], indent=2), encoding="utf-8")
    except OSError:
        pass  # a launcher that cannot remember is still a working launcher


def repository_root(path):
    result = run(["git", "rev-parse", "--show-toplevel"], path)
    return result.stdout.strip() if result.returncode == 0 else None


def choose_repository(recent):
    if recent:
        print("\nRecent repositories:")
        for index, path in enumerate(recent, 1):
            print(f"  {index}. {path}")
        print("\nEnter a number, or a path (blank for 1):")
    else:
        print("\nEnter the path to a git repository:")

    while True:
        try:
            answer = input("> ").strip().strip('"')
        except (EOFError, KeyboardInterrupt):
            return None

        if not answer:
            if recent:
                return recent[0]
            continue

        if answer.isdigit() and recent:
            index = int(answer) - 1
            if 0 <= index < len(recent):
                return recent[index]
            print("  There is no entry with that number.")
            continue

        candidate = Path(answer).expanduser()
        if not candidate.is_dir():
            print("  That folder does not exist.")
            continue

        root = repository_root(candidate)
        if root is None:
            print("  That folder is not inside a git repository.")
            continue
        return root


def main():
    print("visual-git")
    update_self()

    recent = load_recent()
    chosen = choose_repository(recent)
    if chosen is None:
        print("\nNothing chosen.")
        return

    save_recent([chosen] + [path for path in recent if path != chosen])

    print(f"\nOpening {chosen}")
    # Import and call rather than spawning a new interpreter: when this is
    # frozen, sys.executable is this launcher, not python.
    sys.path.insert(0, str(HERE))
    import server

    sys.argv = ["visual-git", chosen]
    server.main()


if __name__ == "__main__":
    main()
