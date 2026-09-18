// UI strings. English is the fallback: a key missing from another language
// falls back to it rather than showing the raw key.
//
// Command names (fetch, pull, push, stage, merge, rebase, hunk) are left in
// English in every language. They are what the buttons actually run, they are
// what developers say out loud, and translating them invents synonyms that
// collide with each other.

export const LANGUAGES = ["en", "ko", "ja"];

export const TRANSLATIONS = {
  en: {
    "topbar.language": "Language",
    "topbar.theme": "Theme",
    "topbar.refresh": "refresh",
    "topbar.refreshTitle": "Re-read the repository state",

    "header.ahead": "{n} ahead",
    "header.behind": "{n} behind",
    "header.inSync": "in sync with {upstream}",

    "remote.title": "Remote",
    "remote.hint": "Fetch only looks; pull moves your branch forward; push sends your commits.",
    "remote.fetch": "fetch",
    "remote.pull": "pull",
    "remote.push": "push",
    "remote.noUpstream": "No upstream yet — pushing will publish this branch to origin.",
    "remote.toPush": "{n} commit(s) to push",
    "remote.toPull": "{n} to pull",
    "remote.upToDate": "up to date with the remote",

    "branches.title": "Branches",
    "branches.hint": "Click a branch to check it out. Merge brings another branch into this one.",
    "branches.create": "create",
    "branches.placeholder": "new-branch-name",
    "branches.empty": "no branches yet",
    "branches.gone": "upstream gone",

    "stash.title": "Stash",
    "stash.hint": "Set the working tree aside without committing, then bring it back later.",
    "stash.push": "stash",
    "stash.placeholder": "optional label",
    "stash.empty": "nothing stashed",
    "stash.apply": "apply",
    "stash.drop": "drop",
    "confirm.stashDrop.title": "Drop this stash?",
    "confirm.stashDrop.text":
      "The stashed changes are deleted without ever having been committed, so git has no other copy of them.",
    "history.search": "search commits",
    "history.searchEmpty": "no commits match",
    "history.filtered": "{n} of {total} commits — the graph is hidden while filtering",

    "worktree.title": "Worktrees",
    "worktree.hint":
      "A worktree checks out another branch into its own folder, so you can have two branches open at once without stashing.",
    "worktree.add": "add",
    "worktree.placeholder": "branch for new worktree",
    "worktree.empty": "no worktrees yet",
    "worktree.open": "open",
    "worktree.remove": "remove",
    "worktree.current": "open here",
    "worktree.main": "main",
    "worktree.detached": "detached",
    "confirm.removeWorktree.title": "Remove this worktree?",
    "confirm.removeWorktree.text":
      "Its folder is deleted. The branch and its commits stay — only this checkout of them goes. git refuses if the folder has uncommitted changes.",

    "reflog.title": "Undo & recovery",
    "reflog.hint":
      "Every state your repository has been in is recorded here, including ones no branch points at any more. Restoring is how you undo a bad reset or rebase.",
    "reflog.empty": "no history recorded yet",

    "tabs.history": "History",
    "tabs.editor": "Editor",
    "history.rebase": "rewrite history…",
    "history.rebaseTitle": "Reorder, squash, reword or drop recent commits",
    "history.hint": "Each dot is a commit; each column is a line of development. Merges join two columns.",
    "history.empty": "no commits yet",
    "history.noMessage": "(no message)",
    "history.showCommit": "Show what this commit changed",

    "editor.hint": "Edit a file, save it, and it appears under Changes on the right — ready to stage and commit.",
    "editor.filter": "filter files",
    "editor.noFile": "no file open",
    "editor.unsaved": "unsaved",
    "editor.save": "save",
    "editor.noFiles": "no files match",
    "editor.create": "new",
    "editor.newPlaceholder": "path/for/new-file.cpp",
    "editor.rename": "rename",
    "editor.delete": "delete",
    "editor.renamePrompt": "New path for {path}",
    "confirm.deleteFile.title": "Delete {path}?",
    "confirm.deleteFile.text":
      "A tracked file is removed with git rm, so the deletion is staged and recoverable from the last commit. An untracked file is gone for good.",

    "staged.title": "Staged",
    "staged.unstageAll": "unstage all",
    "staged.hint": "These changes go into the next commit.",
    "staged.empty": "nothing staged",

    "changes.title": "Changes",
    "changes.stageAll": "stage all",
    "changes.hint": "Edited but not yet staged. Click a file to see and stage individual hunks.",
    "changes.empty": "working tree clean",
    "changes.conflicted": "Conflicted: edit the file to resolve, then stage it",

    "commit.title": "Commit",
    "commit.placeholder": "What changed, and why?",
    "commit.commit": "commit",
    "commit.amend": "amend",
    "commit.amendTitle": "Replace the last commit instead of adding a new one",
    "commit.undo": "undo last commit",
    "commit.undoTitle": "Remove the last commit but keep its changes staged",

    "diff.close": "close",
    "diff.empty": "no textual changes to show",
    "diff.stageHunk": "stage this hunk",
    "diff.unstageHunk": "unstage this hunk",

    "log.title": "Commands run",
    "log.hint": "Everything this app does is a plain git command — here they are.",
    "log.clear": "clear",

    "modal.cancel": "cancel",
    "modal.confirm": "confirm",

    "rebase.title": "Rewrite history",
    "rebase.hint":
      "Choose what happens to each commit, oldest at the top — that is the order git replays them in. squash folds a commit into the one above it, drop deletes it, reword changes its message. This rewrites commits, so avoid it on history you have already shared.",
    "rebase.run": "run rebase",
    "rebase.rewordPlaceholder": "new message",
    "rebase.squashPlaceholder": "combined message",

    "action.checkout": "checkout",
    "action.merge": "merge",
    "action.delete": "delete",
    "action.stage": "stage",
    "action.unstage": "unstage",
    "action.discard": "discard",
    "action.restore": "restore",
    "action.abort": "abort {which}",
    "action.forcePush": "force push (--force-with-lease)",

    "alert.needMessage": "Write a commit message first.",
    "alert.nothingToRewrite":
      "Nothing to rewrite here: this needs at least one ordinary commit sitting on top of an earlier one.",
    "alert.oldestSquash": "The oldest commit has nothing above it to fold into.",
    "alert.allDropped": "Dropping every commit would leave nothing to rebase.",
    "alert.inProgress":
      "A {which} is in progress. Resolve the conflicted files and commit, or abort to return to where you started.",
    "alert.dismiss": "Dismiss",

    "confirm.deleteBranch.title": "Delete {name}?",
    "confirm.deleteBranch.text":
      "Commits only reachable from this branch become hard to find, though the reflog keeps them for a while.",
    "confirm.restore.title": "Restore this state?",
    "confirm.restore.text":
      "Uncommitted changes in your working tree are lost. The state you are leaving is itself written to the reflog, so this is reversible the same way.",
    "confirm.discard.title": "Discard changes to {path}?",
    "confirm.discard.text":
      "These edits were never committed, so git has no copy of them. This cannot be undone.",
    "confirm.amend.title": "Replace the last commit?",
    "confirm.amend.text":
      "Amending creates a new commit in place of the old one. If the old one was already pushed, the remote will disagree with your branch.",
    "confirm.undoCommit.title": "Undo the last commit?",
    "confirm.undoCommit.text":
      "The commit is removed but every change it contained stays staged, ready to re-commit.",
    "confirm.rebase.title": "Rewrite these commits?",
    "confirm.rebase.text":
      "Rebasing replaces commits with new ones. If you have already pushed them, the remote and your branch will disagree. The reflog keeps the old chain if you need it back.",
    "confirm.forcePush.title": "Overwrite the remote branch?",
    "confirm.forcePush.text":
      "This replaces the commits on the remote with yours. --force-with-lease refuses if someone else pushed since your last fetch, but work of theirs that you have never fetched would still be lost.",
    "confirm.discardEdits.title": "Discard unsaved edits?",
    "confirm.discardEdits.text":
      "{path} has changes that were never written to disk. Git cannot recover these, because it has never seen them.",
    "confirm.discardEdits.command": "(nothing is run — this only discards what is in the editor)",
  },

  ko: {
    "topbar.language": "언어",
    "topbar.theme": "테마",
    "topbar.refresh": "새로고침",
    "topbar.refreshTitle": "저장소 상태를 다시 읽습니다",

    "header.ahead": "{n}개 앞섬",
    "header.behind": "{n}개 뒤처짐",
    "header.inSync": "{upstream} 기준 최신",

    "remote.title": "원격",
    "remote.hint": "fetch는 확인만 하고, pull은 브랜치를 앞으로 옮기며, push는 커밋을 보냅니다.",
    "remote.fetch": "fetch",
    "remote.pull": "pull",
    "remote.push": "push",
    "remote.noUpstream": "업스트림이 아직 없습니다. push하면 이 브랜치가 origin에 새로 만들어집니다.",
    "remote.toPush": "push할 커밋 {n}개",
    "remote.toPull": "pull할 커밋 {n}개",
    "remote.upToDate": "원격과 같은 상태",

    "branches.title": "브랜치",
    "branches.hint": "브랜치를 누르면 체크아웃합니다. merge는 다른 브랜치를 현재 브랜치로 합칩니다.",
    "branches.create": "생성",
    "branches.placeholder": "새 브랜치 이름",
    "branches.empty": "브랜치 없음",
    "branches.gone": "업스트림 사라짐",

    "stash.title": "스태시",
    "stash.hint": "커밋하지 않고 작업 내용을 잠시 치워 뒀다가 나중에 되돌립니다.",
    "stash.push": "stash",
    "stash.placeholder": "설명 (선택)",
    "stash.empty": "치워둔 작업 없음",
    "stash.apply": "적용",
    "stash.drop": "삭제",
    "confirm.stashDrop.title": "이 스태시를 삭제할까요?",
    "confirm.stashDrop.text":
      "커밋된 적 없는 변경이 그대로 사라집니다. git에 다른 사본이 없습니다.",
    "history.search": "커밋 검색",
    "history.searchEmpty": "일치하는 커밋 없음",
    "history.filtered": "{total}개 중 {n}개 — 검색 중에는 그래프를 숨깁니다",

    "worktree.title": "워크트리",
    "worktree.hint":
      "워크트리는 다른 브랜치를 별도 폴더에 펼쳐 둡니다. stash 없이 두 브랜치를 동시에 열어둘 수 있습니다.",
    "worktree.add": "추가",
    "worktree.placeholder": "워크트리로 열 브랜치",
    "worktree.empty": "워크트리 없음",
    "worktree.open": "열기",
    "worktree.remove": "제거",
    "worktree.current": "보는 중",
    "worktree.main": "메인",
    "worktree.detached": "detached",
    "confirm.removeWorktree.title": "이 워크트리를 제거할까요?",
    "confirm.removeWorktree.text":
      "해당 폴더가 삭제됩니다. 브랜치와 커밋은 그대로 남고 이 체크아웃만 사라집니다. 커밋하지 않은 변경이 있으면 git이 거부합니다.",

    "reflog.title": "되돌리기 & 복구",
    "reflog.hint":
      "저장소가 거쳐온 모든 상태가 기록됩니다. 어떤 브랜치도 가리키지 않게 된 상태까지 남아서, 잘못된 reset이나 rebase를 여기서 되돌릴 수 있습니다.",
    "reflog.empty": "기록 없음",

    "tabs.history": "히스토리",
    "tabs.editor": "에디터",
    "history.rebase": "히스토리 수정…",
    "history.rebaseTitle": "최근 커밋을 재배열, 합치기, 메시지 수정, 삭제합니다",
    "history.hint": "점 하나가 커밋, 세로 줄 하나가 개발 갈래입니다. 병합은 두 줄을 합칩니다.",
    "history.empty": "커밋 없음",
    "history.noMessage": "(메시지 없음)",
    "history.showCommit": "이 커밋이 바꾼 내용 보기",

    "editor.hint":
      "파일을 고치고 저장하면 오른쪽 변경사항에 나타납니다. 바로 스테이지하고 커밋할 수 있습니다.",
    "editor.filter": "파일 검색",
    "editor.noFile": "열린 파일 없음",
    "editor.unsaved": "저장 안 됨",
    "editor.save": "저장",
    "editor.noFiles": "검색 결과 없음",
    "editor.create": "새 파일",
    "editor.newPlaceholder": "경로/새-파일.cpp",
    "editor.rename": "이름 변경",
    "editor.delete": "삭제",
    "editor.renamePrompt": "{path}의 새 경로",
    "confirm.deleteFile.title": "{path}를 삭제할까요?",
    "confirm.deleteFile.text":
      "추적 중인 파일은 git rm으로 지워지므로 삭제가 스테이지되고 마지막 커밋에서 되살릴 수 있습니다. 추적되지 않는 파일은 완전히 사라집니다.",

    "staged.title": "스테이지됨",
    "staged.unstageAll": "모두 해제",
    "staged.hint": "다음 커밋에 들어갈 변경입니다.",
    "staged.empty": "스테이지된 변경 없음",

    "changes.title": "변경사항",
    "changes.stageAll": "모두 스테이지",
    "changes.hint":
      "수정했지만 아직 스테이지하지 않은 파일입니다. 파일을 누르면 diff를 보고 hunk 단위로 스테이지할 수 있습니다.",
    "changes.empty": "변경사항 없음",
    "changes.conflicted": "충돌: 파일을 직접 수정해 해결한 뒤 스테이지하세요",

    "commit.title": "커밋",
    "commit.placeholder": "무엇을, 왜 바꿨나요?",
    "commit.commit": "커밋",
    "commit.amend": "amend",
    "commit.amendTitle": "새 커밋을 만들지 않고 직전 커밋을 교체합니다",
    "commit.undo": "직전 커밋 취소",
    "commit.undoTitle": "직전 커밋을 없애되 변경 내용은 스테이지에 남깁니다",

    "diff.close": "닫기",
    "diff.empty": "표시할 텍스트 변경 없음",
    "diff.stageHunk": "이 hunk 스테이지",
    "diff.unstageHunk": "이 hunk 해제",

    "log.title": "실행한 명령",
    "log.hint": "이 앱이 하는 일은 전부 평범한 git 명령입니다. 그 목록입니다.",
    "log.clear": "지우기",

    "modal.cancel": "취소",
    "modal.confirm": "실행",

    "rebase.title": "히스토리 수정",
    "rebase.hint":
      "각 커밋을 어떻게 할지 고릅니다. 위쪽이 오래된 커밋이고, git이 재생하는 순서도 같습니다. squash는 바로 위 커밋에 합치고, drop은 삭제하며, reword는 메시지를 바꿉니다. 커밋을 새로 만드는 작업이므로 이미 공유한 히스토리에는 쓰지 마세요.",
    "rebase.run": "rebase 실행",
    "rebase.rewordPlaceholder": "새 메시지",
    "rebase.squashPlaceholder": "합칠 메시지",

    "action.checkout": "체크아웃",
    "action.merge": "merge",
    "action.delete": "삭제",
    "action.stage": "스테이지",
    "action.unstage": "해제",
    "action.discard": "버리기",
    "action.restore": "복구",
    "action.abort": "{which} 중단",
    "action.forcePush": "강제 push (--force-with-lease)",

    "alert.needMessage": "커밋 메시지를 먼저 입력하세요.",
    "alert.nothingToRewrite":
      "수정할 커밋이 없습니다. 이전 커밋 위에 놓인 일반 커밋이 최소 하나 필요합니다.",
    "alert.oldestSquash": "가장 오래된 커밋은 합쳐 넣을 대상이 위에 없습니다.",
    "alert.allDropped": "모든 커밋을 drop하면 rebase할 대상이 남지 않습니다.",
    "alert.inProgress":
      "{which} 작업이 진행 중입니다. 충돌한 파일을 해결하고 커밋하거나, 중단해서 시작 지점으로 돌아가세요.",
    "alert.dismiss": "닫기",

    "confirm.deleteBranch.title": "{name} 브랜치를 삭제할까요?",
    "confirm.deleteBranch.text":
      "이 브랜치에서만 닿을 수 있던 커밋은 찾기 어려워집니다. 다만 reflog에 한동안 남습니다.",
    "confirm.restore.title": "이 상태로 되돌릴까요?",
    "confirm.restore.text":
      "작업 디렉토리의 커밋되지 않은 변경은 사라집니다. 지금 떠나는 상태도 reflog에 기록되므로 같은 방법으로 다시 돌아올 수 있습니다.",
    "confirm.discard.title": "{path}의 변경을 버릴까요?",
    "confirm.discard.text": "커밋된 적 없는 수정이라 git에 사본이 없습니다. 되돌릴 수 없습니다.",
    "confirm.amend.title": "직전 커밋을 교체할까요?",
    "confirm.amend.text":
      "amend는 기존 커밋 자리에 새 커밋을 만듭니다. 이미 push한 커밋이라면 원격과 브랜치가 어긋납니다.",
    "confirm.undoCommit.title": "직전 커밋을 취소할까요?",
    "confirm.undoCommit.text":
      "커밋은 사라지지만 그 안의 변경은 모두 스테이지에 남아 바로 다시 커밋할 수 있습니다.",
    "confirm.rebase.title": "이 커밋들을 새로 만들까요?",
    "confirm.rebase.text":
      "rebase는 커밋을 새것으로 교체합니다. 이미 push했다면 원격과 브랜치가 어긋납니다. 이전 커밋들은 reflog에 남으므로 필요하면 되돌릴 수 있습니다.",
    "confirm.forcePush.title": "원격 브랜치를 덮어쓸까요?",
    "confirm.forcePush.text":
      "원격의 커밋을 지금 브랜치의 것으로 교체합니다. --force-with-lease는 마지막 fetch 이후 누군가 push했다면 거부하지만, 한 번도 fetch하지 않은 다른 사람의 작업은 그대로 사라집니다.",
    "confirm.discardEdits.title": "저장하지 않은 수정을 버릴까요?",
    "confirm.discardEdits.text":
      "{path}에 디스크로 기록되지 않은 변경이 있습니다. git이 본 적 없는 내용이라 복구할 수 없습니다.",
    "confirm.discardEdits.command": "(실행되는 명령 없음 — 에디터 내용만 버립니다)",
  },

  ja: {
    "topbar.language": "言語",
    "topbar.theme": "テーマ",
    "topbar.refresh": "再読み込み",
    "topbar.refreshTitle": "リポジトリの状態を読み直します",

    "header.ahead": "{n} 件先行",
    "header.behind": "{n} 件遅れ",
    "header.inSync": "{upstream} と同期済み",

    "remote.title": "リモート",
    "remote.hint": "fetch は確認するだけ、pull はブランチを進め、push はコミットを送ります。",
    "remote.fetch": "fetch",
    "remote.pull": "pull",
    "remote.push": "push",
    "remote.noUpstream": "上流がまだありません。push するとこのブランチが origin に作成されます。",
    "remote.toPush": "push するコミット {n} 件",
    "remote.toPull": "pull するコミット {n} 件",
    "remote.upToDate": "リモートと同じ状態",

    "branches.title": "ブランチ",
    "branches.hint":
      "ブランチを押すとチェックアウトします。merge は別のブランチを現在のブランチに取り込みます。",
    "branches.create": "作成",
    "branches.placeholder": "新しいブランチ名",
    "branches.empty": "ブランチなし",
    "branches.gone": "上流が消えています",

    "stash.title": "スタッシュ",
    "stash.hint": "コミットせずに作業内容を一時的に退避し、後で戻します。",
    "stash.push": "stash",
    "stash.placeholder": "説明 (任意)",
    "stash.empty": "退避した作業なし",
    "stash.apply": "適用",
    "stash.drop": "削除",
    "confirm.stashDrop.title": "このスタッシュを削除しますか?",
    "confirm.stashDrop.text":
      "一度もコミットされていない変更がそのまま消えます。git に他の控えはありません。",
    "history.search": "コミット検索",
    "history.searchEmpty": "該当するコミットなし",
    "history.filtered": "{total} 件中 {n} 件 — 検索中はグラフを隠します",

    "worktree.title": "ワークツリー",
    "worktree.hint":
      "ワークツリーは別のブランチを専用フォルダに展開します。stash せずに二つのブランチを同時に開いておけます。",
    "worktree.add": "追加",
    "worktree.placeholder": "ワークツリーにするブランチ",
    "worktree.empty": "ワークツリーなし",
    "worktree.open": "開く",
    "worktree.remove": "削除",
    "worktree.current": "表示中",
    "worktree.main": "メイン",
    "worktree.detached": "detached",
    "confirm.removeWorktree.title": "このワークツリーを削除しますか?",
    "confirm.removeWorktree.text":
      "そのフォルダが削除されます。ブランチとコミットは残り、この展開だけが消えます。未コミットの変更があれば git が拒否します。",

    "reflog.title": "取り消しと復旧",
    "reflog.hint":
      "リポジトリが通ってきた状態がすべて記録されます。どのブランチからも辿れなくなった状態も残るので、誤った reset や rebase をここから戻せます。",
    "reflog.empty": "記録なし",

    "tabs.history": "履歴",
    "tabs.editor": "エディタ",
    "history.rebase": "履歴を書き換える…",
    "history.rebaseTitle": "最近のコミットを並べ替え、まとめ、書き換え、削除します",
    "history.hint": "点がコミット、縦の列が開発の流れです。マージは二つの列をつなぎます。",
    "history.empty": "コミットなし",
    "history.noMessage": "(メッセージなし)",
    "history.showCommit": "このコミットの変更を表示",

    "editor.hint":
      "ファイルを編集して保存すると右の変更に現れます。そのままステージしてコミットできます。",
    "editor.filter": "ファイル検索",
    "editor.noFile": "開いているファイルなし",
    "editor.unsaved": "未保存",
    "editor.save": "保存",
    "editor.noFiles": "該当なし",
    "editor.create": "新規",
    "editor.newPlaceholder": "パス/新しいファイル.cpp",
    "editor.rename": "名前変更",
    "editor.delete": "削除",
    "editor.renamePrompt": "{path} の新しいパス",
    "confirm.deleteFile.title": "{path} を削除しますか?",
    "confirm.deleteFile.text":
      "追跡中のファイルは git rm で消えるため削除がステージされ、最後のコミットから戻せます。追跡されていないファイルは完全に消えます。",

    "staged.title": "ステージ済み",
    "staged.unstageAll": "すべて解除",
    "staged.hint": "次のコミットに入る変更です。",
    "staged.empty": "ステージされた変更なし",

    "changes.title": "変更",
    "changes.stageAll": "すべてステージ",
    "changes.hint":
      "編集済みでまだステージしていないファイルです。ファイルを押すと差分を見て hunk 単位でステージできます。",
    "changes.empty": "変更なし",
    "changes.conflicted": "衝突: ファイルを直して解決してからステージしてください",

    "commit.title": "コミット",
    "commit.placeholder": "何を、なぜ変えましたか?",
    "commit.commit": "コミット",
    "commit.amend": "amend",
    "commit.amendTitle": "新しいコミットを作らず直前のコミットを置き換えます",
    "commit.undo": "直前のコミットを取り消す",
    "commit.undoTitle": "直前のコミットを消し、変更はステージに残します",

    "diff.close": "閉じる",
    "diff.empty": "表示する変更なし",
    "diff.stageHunk": "この hunk をステージ",
    "diff.unstageHunk": "この hunk を解除",

    "log.title": "実行したコマンド",
    "log.hint": "このアプリがすることはすべて普通の git コマンドです。その一覧です。",
    "log.clear": "消去",

    "modal.cancel": "キャンセル",
    "modal.confirm": "実行",

    "rebase.title": "履歴を書き換える",
    "rebase.hint":
      "各コミットの扱いを選びます。上が古いコミットで、git が再生する順序も同じです。squash は直上のコミットにまとめ、drop は削除し、reword はメッセージを変えます。コミットを作り直すので、すでに共有した履歴には使わないでください。",
    "rebase.run": "rebase を実行",
    "rebase.rewordPlaceholder": "新しいメッセージ",
    "rebase.squashPlaceholder": "まとめたメッセージ",

    "action.checkout": "チェックアウト",
    "action.merge": "merge",
    "action.delete": "削除",
    "action.stage": "ステージ",
    "action.unstage": "解除",
    "action.discard": "破棄",
    "action.restore": "復元",
    "action.abort": "{which} を中断",
    "action.forcePush": "強制 push (--force-with-lease)",

    "alert.needMessage": "先にコミットメッセージを入力してください。",
    "alert.nothingToRewrite":
      "書き換えるコミットがありません。以前のコミットの上に乗った通常のコミットが最低一つ必要です。",
    "alert.oldestSquash": "最も古いコミットにはまとめる先が上にありません。",
    "alert.allDropped": "すべて drop すると rebase する対象が残りません。",
    "alert.inProgress":
      "{which} が進行中です。衝突したファイルを解決してコミットするか、中断して元の位置に戻ってください。",
    "alert.dismiss": "閉じる",

    "confirm.deleteBranch.title": "{name} を削除しますか?",
    "confirm.deleteBranch.text":
      "このブランチからしか辿れなかったコミットは見つけにくくなります。ただし reflog にしばらく残ります。",
    "confirm.restore.title": "この状態に戻しますか?",
    "confirm.restore.text":
      "作業ディレクトリの未コミットの変更は失われます。今離れる状態も reflog に記録されるので、同じ方法で戻れます。",
    "confirm.discard.title": "{path} の変更を破棄しますか?",
    "confirm.discard.text": "一度もコミットされていない編集なので git に控えがありません。取り消せません。",
    "confirm.amend.title": "直前のコミットを置き換えますか?",
    "confirm.amend.text":
      "amend は元のコミットの位置に新しいコミットを作ります。すでに push 済みなら、リモートとブランチが食い違います。",
    "confirm.undoCommit.title": "直前のコミットを取り消しますか?",
    "confirm.undoCommit.text":
      "コミットは消えますが、含まれていた変更はすべてステージに残り、すぐコミットし直せます。",
    "confirm.rebase.title": "これらのコミットを作り直しますか?",
    "confirm.rebase.text":
      "rebase はコミットを新しいものに置き換えます。すでに push 済みなら、リモートとブランチが食い違います。元のコミットは reflog に残るので必要なら戻せます。",
    "confirm.forcePush.title": "リモートのブランチを上書きしますか?",
    "confirm.forcePush.text":
      "リモートのコミットを今のブランチのもので置き換えます。--force-with-lease は最後の fetch 以降に誰かが push していれば拒否しますが、一度も fetch していない他人の作業は失われます。",
    "confirm.discardEdits.title": "保存していない編集を破棄しますか?",
    "confirm.discardEdits.text":
      "{path} にディスクへ書かれていない変更があります。git が見たことのない内容なので復元できません。",
    "confirm.discardEdits.command": "(実行されるコマンドはありません — エディタの内容を捨てるだけです)",
  },
};
