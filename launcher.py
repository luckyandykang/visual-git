#!/usr/bin/env python3
"""visual-git launcher: update, pick a repository, run the server.

Opens a small window when tkinter is available and falls back to a prompt in
the terminal when it is not. Written to behave the same run from source or
frozen into an executable: when frozen, the folder to update is the one
holding the executable rather than the temporary directory the bundle unpacks
into.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import threading
from pathlib import Path

# pythonw.exe gives a process with no console, where stdout and stderr are
# None. Anything that prints would then raise, so send it nowhere instead.
for _stream in ("stdout", "stderr"):
    if getattr(sys, _stream) is None:
        setattr(sys, _stream, open(os.devnull, "w", encoding="utf-8"))

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

BG = "#0f1216"
SURFACE = "#161a21"
SURFACE_2 = "#1d222b"
BORDER = "#262c37"
TEXT = "#e4e8ef"
TEXT_DIM = "#9aa4b4"
TEXT_FAINT = "#6b7686"
ACCENT = "#4f9dfd"
ORANGE = "#f2994a"


# --- shared logic ----------------------------------------------------------


def run(args, cwd):
    return subprocess.run(
        args, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace"
    )


def update_self():
    """Returns a short line describing what happened, for either front end."""
    result = run(["git", "pull"], HERE)
    if result.returncode != 0:
        reason = (result.stderr or result.stdout).strip().splitlines()
        return False, reason[0] if reason else "git pull failed"
    if "Already up to date" in result.stdout:
        return True, "Up to date."
    return True, "Updated."


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


def remember(chosen):
    save_recent([chosen] + [path for path in load_recent() if path != chosen])


# --- window ----------------------------------------------------------------


def run_gui(tkinter, filedialog):
    root = tkinter.Tk()
    root.title("visual-git")
    root.configure(bg=BG)
    root.minsize(520, 460)
    try:
        root.iconphoto(True, tkinter.PhotoImage(file=str(HERE / "docs" / "logo.png")))
    except Exception:
        pass  # an icon is not worth failing to start over

    state = {"server": None, "url": None}

    outer = tkinter.Frame(root, bg=BG, padx=24, pady=22)
    outer.pack(fill="both", expand=True)

    # header: mark, name, tagline
    header = tkinter.Frame(outer, bg=BG)
    header.pack(fill="x")
    try:
        logo = tkinter.PhotoImage(file=str(HERE / "docs" / "logo.png")).subsample(9, 9)
        badge = tkinter.Label(header, image=logo, bg=BG)
        badge.image = logo  # tkinter does not keep its own reference
        badge.pack(side="left", padx=(0, 14))
    except Exception:
        pass
    titles = tkinter.Frame(header, bg=BG)
    titles.pack(side="left", anchor="w")
    tkinter.Label(
        titles, text="visual-git", bg=BG, fg=TEXT, font=("Segoe UI", 19, "bold")
    ).pack(anchor="w")
    tkinter.Label(
        titles, text="a local web GUI for git", bg=BG, fg=TEXT_FAINT, font=("Segoe UI", 10)
    ).pack(anchor="w")

    status = tkinter.Label(outer, text="Checking for updates...", bg=BG, fg=TEXT_FAINT,
                           font=("Segoe UI", 9), anchor="w")
    status.pack(fill="x", pady=(16, 0))

    # body: swapped for the running view once a server starts
    body = tkinter.Frame(outer, bg=BG)
    body.pack(fill="both", expand=True, pady=(14, 0))

    tkinter.Label(body, text="RECENT", bg=BG, fg=TEXT_DIM, font=("Segoe UI", 8, "bold"),
                  anchor="w").pack(fill="x")

    listbox = tkinter.Listbox(
        body,
        bg=SURFACE,
        fg=TEXT,
        selectbackground=ACCENT,
        selectforeground="#ffffff",
        highlightthickness=1,
        highlightbackground=BORDER,
        highlightcolor=BORDER,
        borderwidth=0,
        font=("Consolas", 9),
        activestyle="none",
    )
    listbox.pack(fill="both", expand=True, pady=(6, 12))

    recent = load_recent()
    for path in recent:
        listbox.insert("end", path)
    if recent:
        listbox.selection_set(0)

    tkinter.Label(body, text="OR A PATH", bg=BG, fg=TEXT_DIM, font=("Segoe UI", 8, "bold"),
                  anchor="w").pack(fill="x", pady=(0, 6))

    picker = tkinter.Frame(body, bg=BG)
    picker.pack(fill="x")
    entry = tkinter.Entry(
        picker,
        bg=SURFACE,
        fg=TEXT,
        insertbackground=TEXT,
        highlightthickness=1,
        highlightbackground=BORDER,
        highlightcolor=ACCENT,
        borderwidth=0,
        font=("Consolas", 9),
    )
    entry.pack(side="left", fill="x", expand=True, ipady=6)

    def button(parent, text, command, primary=False):
        return tkinter.Button(
            parent,
            text=text,
            command=command,
            bg=ACCENT if primary else SURFACE_2,
            fg="#ffffff" if primary else TEXT,
            activebackground=ACCENT if primary else BORDER,
            activeforeground="#ffffff" if primary else TEXT,
            relief="flat",
            borderwidth=0,
            highlightthickness=0,
            font=("Segoe UI", 10, "bold" if primary else "normal"),
            cursor="hand2",
            padx=16,
            pady=7,
        )

    def browse():
        chosen = filedialog.askdirectory(title="Choose a git repository")
        if chosen:
            entry.delete(0, "end")
            entry.insert(0, chosen)

    button(picker, "Browse…", browse).pack(side="left", padx=(8, 0))

    message = tkinter.Label(body, text="", bg=BG, fg=ORANGE, font=("Segoe UI", 9), anchor="w")
    message.pack(fill="x", pady=(10, 0))

    def start():
        typed = entry.get().strip().strip('"')
        if typed:
            candidate = Path(typed).expanduser()
            if not candidate.is_dir():
                message.config(text="That folder does not exist.")
                return
            root_path = repository_root(candidate)
            if root_path is None:
                message.config(text="That folder is not inside a git repository.")
                return
        else:
            selection = listbox.curselection()
            if not selection:
                message.config(text="Pick a repository, or type a path.")
                return
            root_path = listbox.get(selection[0])

        sys.path.insert(0, str(HERE))
        import server

        try:
            httpd, url = server.create_server(root_path)
        except OSError as exc:
            message.config(text=str(exc))
            return

        remember(root_path)
        state["server"] = httpd
        state["url"] = url
        threading.Thread(target=httpd.serve_forever, daemon=True).start()
        server.open_ui(url)
        show_running(root_path, url)

    open_button = button(outer, "Open", start, primary=True)
    open_button.pack(fill="x", pady=(16, 0), ipady=2)
    root.bind("<Return>", lambda _event: start())

    def reopen(url):
        import server

        server.open_ui(url)

    def show_running(repo_path, url):
        """Replace the picker with the address, once a server is up."""
        body.destroy()
        open_button.destroy()
        status.config(text="Running", fg=ACCENT)

        running = tkinter.Frame(outer, bg=BG)
        running.pack(fill="both", expand=True, pady=(14, 0))
        tkinter.Label(running, text=repo_path, bg=BG, fg=TEXT, font=("Consolas", 9),
                      anchor="w", wraplength=440, justify="left").pack(fill="x")
        tkinter.Label(running, text=url, bg=BG, fg=TEXT_FAINT, font=("Consolas", 8),
                      anchor="w", wraplength=440, justify="left").pack(fill="x", pady=(8, 0))
        tkinter.Label(
            running,
            text="Closing this window stops the server.",
            bg=BG,
            fg=TEXT_FAINT,
            font=("Segoe UI", 9),
            anchor="w",
        ).pack(fill="x", pady=(14, 0))

        buttons = tkinter.Frame(outer, bg=BG)
        buttons.pack(fill="x", pady=(16, 0))
        button(buttons, "Open window", lambda: reopen(url), primary=True).pack(
            side="left", fill="x", expand=True
        )
        button(buttons, "Quit", root.destroy).pack(side="left", padx=(8, 0))

    def on_close():
        if state["server"]:
            state["server"].shutdown()
        root.destroy()

    root.protocol("WM_DELETE_WINDOW", on_close)

    def check_updates():
        ok, text = update_self()
        status.config(text=text, fg=TEXT_FAINT if ok else ORANGE)

    root.after(80, check_updates)
    root.mainloop()


# --- terminal fallback -----------------------------------------------------


def run_console():
    print("\nvisual-git")
    ok, text = update_self()
    print(f"  {text}")

    recent = load_recent()
    if recent:
        print("\nRecent repositories")
        for index, path in enumerate(recent, 1):
            print(f"  {index}  {path}")
        print("\nEnter a number, or a path (blank for 1)")
    else:
        print("\nEnter the path to a git repository")

    while True:
        try:
            answer = input("> ").strip().strip('"')
        except (EOFError, KeyboardInterrupt):
            print("\nNothing chosen.")
            return

        if not answer:
            if recent:
                chosen = recent[0]
                break
            continue
        if answer.isdigit() and recent:
            index = int(answer) - 1
            if 0 <= index < len(recent):
                chosen = recent[index]
                break
            print("  There is no entry with that number.")
            continue

        candidate = Path(answer).expanduser()
        if not candidate.is_dir():
            print("  That folder does not exist.")
            continue
        root_path = repository_root(candidate)
        if root_path is None:
            print("  That folder is not inside a git repository.")
            continue
        chosen = root_path
        break

    remember(chosen)
    print(f"\nOpening {chosen}")
    sys.path.insert(0, str(HERE))
    import server

    sys.argv = ["visual-git", chosen]
    server.main()


def main():
    if "--console" not in sys.argv:
        try:
            import tkinter
            from tkinter import filedialog
        except ImportError:
            pass
        else:
            run_gui(tkinter, filedialog)
            return
    run_console()


if __name__ == "__main__":
    main()
