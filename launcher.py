#!/usr/bin/env python3
"""visual-git launcher: update, pick a repository, start the server.

Written so it behaves the same run from source or frozen into an executable:
when frozen, the folder to update is the one holding the executable rather
than the temporary directory the bundle unpacks into.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

# A Korean Windows console defaults to cp949, which cannot encode the box
# drawing characters in the banner.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

if getattr(sys, "frozen", False):
    HERE = Path(sys.executable).resolve().parent
else:
    HERE = Path(__file__).resolve().parent

# Kept outside the repository so it never shows up as an untracked file.
RECENT_FILE = Path.home() / ".visual-git-recent.json"
MAX_RECENT = 8


def supports_colour():
    """Windows terminals need virtual terminal processing switched on before
    they treat ANSI escapes as anything but literal text."""
    if not sys.stdout.isatty():
        return False
    if os.name != "nt":
        return True
    try:
        import ctypes

        kernel32 = ctypes.windll.kernel32
        handle = kernel32.GetStdHandle(-11)
        mode = ctypes.c_uint32()
        if not kernel32.GetConsoleMode(handle, ctypes.byref(mode)):
            return False
        ENABLE_VIRTUAL_TERMINAL_PROCESSING = 0x0004
        return bool(kernel32.SetConsoleMode(handle, mode.value | ENABLE_VIRTUAL_TERMINAL_PROCESSING))
    except Exception:
        return False


COLOUR = supports_colour()
BLUE = "\033[38;5;75m" if COLOUR else ""
ORANGE = "\033[38;5;215m" if COLOUR else ""
DIM = "\033[38;5;245m" if COLOUR else ""
BOLD = "\033[1m" if COLOUR else ""
OFF = "\033[0m" if COLOUR else ""


def banner():
    """The same mark as the icon: a lane, and a branch that leaves it and
    merges back. Falls back to ASCII on a console that cannot encode the box
    drawing characters."""
    art = [("●", "─╮"), ("│", " │"), ("●", " ●"), ("│", " │"), ("●", "─╯")]
    labels = ["", f"{BOLD}visual-git{OFF}", f"{DIM}a local web GUI for git{OFF}", "", ""]
    try:
        "".join(lane + branch for lane, branch in art).encode(sys.stdout.encoding or "utf-8")
    except (UnicodeEncodeError, LookupError):
        art = [("o", "-+"), ("|", " |"), ("o", " o"), ("|", " |"), ("o", "-+")]

    print()
    for (lane, branch), label in zip(art, labels):
        print(f"   {BLUE}{lane}{ORANGE}{branch}{OFF}   {label}".rstrip())
    print()


def run(args, cwd):
    return subprocess.run(
        args, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace"
    )


def update_self():
    print(f"{DIM}Checking for updates...{OFF}")
    result = run(["git", "pull"], HERE)
    if result.returncode != 0:
        reason = (result.stderr or result.stdout).strip().splitlines()
        print(f"  {ORANGE}Could not update:{OFF} {reason[0] if reason else 'git pull failed'}")
        print(f"  {DIM}Carrying on with the version you have.{OFF}")
    elif "Already up to date" in result.stdout:
        print(f"  {BLUE}Up to date.{OFF}")
    else:
        print(f"  {BLUE}Updated.{OFF}")


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
        print(f"\n{BOLD}Recent repositories{OFF}")
        for index, path in enumerate(recent, 1):
            print(f"  {BLUE}{index}{OFF}  {path}")
        print(f"\n{DIM}Enter a number, or a path (blank for 1){OFF}")
    else:
        print(f"\n{DIM}Enter the path to a git repository{OFF}")

    while True:
        try:
            answer = input(f"{BLUE}>{OFF} ").strip().strip('"')
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
            print(f"  {ORANGE}There is no entry with that number.{OFF}")
            continue

        candidate = Path(answer).expanduser()
        if not candidate.is_dir():
            print(f"  {ORANGE}That folder does not exist.{OFF}")
            continue

        root = repository_root(candidate)
        if root is None:
            print(f"  {ORANGE}That folder is not inside a git repository.{OFF}")
            continue
        return root


def main():
    banner()
    update_self()

    recent = load_recent()
    chosen = choose_repository(recent)
    if chosen is None:
        print("\nNothing chosen.")
        return

    save_recent([chosen] + [path for path in recent if path != chosen])

    print(f"\n{BOLD}Opening{OFF} {chosen}")
    # Import and call rather than spawning a new interpreter: when this is
    # frozen, sys.executable is this launcher, not python.
    sys.path.insert(0, str(HERE))
    import server

    sys.argv = ["visual-git", chosen]
    server.main()


if __name__ == "__main__":
    main()
