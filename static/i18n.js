// UI strings. English is the fallback: a key missing from another language
// falls back to it rather than showing the raw key.

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

    "editor.hint": "Edit a file, save it, and it appears under Changes on the right — ready to stage and commit.",
    "editor.filter": "filter files",
    "editor.noFile": "no file open",
    "editor.unsaved": "unsaved",
    "editor.save": "save",
    "editor.noFiles": "no files match",

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
    "alert.needAmendMessage": "Write the replacement message in the commit box first.",
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
    "topbar.refreshTitle": "저장소 상태를 다시 읽는다",

    "header.ahead": "{n} 앞섬",
    "header.behind": "{n} 뒤처짐",
    "header.inSync": "{upstream}와 동일",

    "remote.title": "원격",
    "remote.hint": "fetch는 보기만 하고, pull은 브랜치를 앞으로 옮기며, push는 커밋을 보낸다.",
    "remote.fetch": "가져오기",
    "remote.pull": "끌어오기",
    "remote.push": "올리기",
    "remote.noUpstream": "아직 업스트림이 없다 — push하면 이 브랜치가 origin에 새로 올라간다.",
    "remote.toPush": "올릴 커밋 {n}개",
    "remote.toPull": "받을 커밋 {n}개",
    "remote.upToDate": "원격과 동일한 상태",

    "branches.title": "브랜치",
    "branches.hint": "브랜치를 누르면 체크아웃한다. merge는 다른 브랜치를 현재 브랜치로 합친다.",
    "branches.create": "생성",
    "branches.placeholder": "새-브랜치-이름",
    "branches.empty": "브랜치가 없다",

    "worktree.title": "워크트리",
    "worktree.hint":
      "워크트리는 다른 브랜치를 별도 폴더에 체크아웃한다. stash 없이 두 브랜치를 동시에 열어둘 수 있다.",
    "worktree.add": "추가",
    "worktree.placeholder": "새 워크트리의 브랜치",
    "worktree.empty": "워크트리가 없다",
    "worktree.open": "열기",
    "worktree.remove": "제거",
    "worktree.current": "현재 열림",
    "worktree.main": "본체",
    "worktree.detached": "분리됨",
    "confirm.removeWorktree.title": "이 워크트리를 제거할까?",
    "confirm.removeWorktree.text":
      "해당 폴더가 삭제된다. 브랜치와 커밋은 남고, 이 체크아웃만 사라진다. 커밋하지 않은 변경이 있으면 git이 거부한다.",

    "reflog.title": "되돌리기 & 복구",
    "reflog.hint":
      "저장소가 거쳐온 모든 상태가 여기 기록된다. 어떤 브랜치도 가리키지 않게 된 상태까지 남는다. 잘못된 reset이나 rebase는 여기서 되돌린다.",
    "reflog.empty": "기록이 아직 없다",

    "tabs.history": "히스토리",
    "tabs.editor": "에디터",
    "history.rebase": "히스토리 수정…",
    "history.rebaseTitle": "최근 커밋의 순서 변경, 합치기, 메시지 수정, 삭제",
    "history.hint": "점 하나가 커밋이고, 세로 줄 하나가 개발 갈래다. 병합은 두 줄을 합친다.",
    "history.empty": "커밋이 없다",
    "history.noMessage": "(메시지 없음)",

    "editor.hint": "파일을 고치고 저장하면 오른쪽 변경사항에 나타난다 — 바로 스테이지하고 커밋할 수 있다.",
    "editor.filter": "파일 검색",
    "editor.noFile": "열린 파일 없음",
    "editor.unsaved": "저장 안 됨",
    "editor.save": "저장",
    "editor.noFiles": "일치하는 파일 없음",

    "staged.title": "스테이지됨",
    "staged.unstageAll": "전체 내리기",
    "staged.hint": "다음 커밋에 들어갈 변경사항이다.",
    "staged.empty": "스테이지된 것 없음",

    "changes.title": "변경사항",
    "changes.stageAll": "전체 올리기",
    "changes.hint": "수정했지만 아직 스테이지하지 않았다. 파일을 누르면 diff를 보고 hunk 단위로 스테이지할 수 있다.",
    "changes.empty": "작업 디렉토리가 깨끗하다",
    "changes.conflicted": "충돌: 파일을 직접 고쳐 해결한 뒤 스테이지한다",

    "commit.title": "커밋",
    "commit.placeholder": "무엇을, 왜 바꿨는가?",
    "commit.commit": "커밋",
    "commit.amend": "수정",
    "commit.amendTitle": "새 커밋을 만들지 않고 마지막 커밋을 교체한다",
    "commit.undo": "마지막 커밋 취소",
    "commit.undoTitle": "마지막 커밋을 없애되 변경 내용은 스테이지에 남긴다",

    "diff.close": "닫기",
    "diff.empty": "표시할 텍스트 변경이 없다",
    "diff.stageHunk": "이 hunk 올리기",
    "diff.unstageHunk": "이 hunk 내리기",

    "log.title": "실행한 명령",
    "log.hint": "이 앱이 하는 모든 일은 평범한 git 명령이다 — 그 목록이다.",
    "log.clear": "지우기",

    "modal.cancel": "취소",
    "modal.confirm": "확인",

    "rebase.title": "히스토리 수정",
    "rebase.hint":
      "각 커밋을 어떻게 할지 고른다. 위가 오래된 커밋이고, git이 재생하는 순서도 그렇다. squash는 바로 위 커밋에 합치고, drop은 삭제하며, reword는 메시지를 바꾼다. 커밋을 새로 쓰는 작업이므로 이미 공유한 히스토리에는 쓰지 않는 편이 좋다.",
    "rebase.run": "rebase 실행",
    "rebase.rewordPlaceholder": "새 메시지",
    "rebase.squashPlaceholder": "합친 메시지",

    "action.checkout": "체크아웃",
    "action.merge": "병합",
    "action.delete": "삭제",
    "action.stage": "올리기",
    "action.unstage": "내리기",
    "action.discard": "버리기",
    "action.restore": "복구",
    "action.abort": "{which} 중단",
    "action.forcePush": "강제 푸시 (--force-with-lease)",

    "alert.needMessage": "커밋 메시지를 먼저 작성한다.",
    "alert.needAmendMessage": "교체할 메시지를 커밋 칸에 먼저 작성한다.",
    "alert.nothingToRewrite": "수정할 것이 없다. 이전 커밋 위에 놓인 일반 커밋이 최소 하나는 있어야 한다.",
    "alert.oldestSquash": "가장 오래된 커밋은 합쳐 넣을 대상이 위에 없다.",
    "alert.allDropped": "모든 커밋을 drop하면 rebase할 것이 남지 않는다.",
    "alert.inProgress":
      "{which}가 진행 중이다. 충돌한 파일을 해결하고 커밋하거나, 중단해서 시작 지점으로 돌아간다.",
    "alert.dismiss": "닫기",

    "confirm.deleteBranch.title": "{name} 브랜치를 삭제할까?",
    "confirm.deleteBranch.text":
      "이 브랜치에서만 닿을 수 있던 커밋은 찾기 어려워진다. 다만 reflog에 한동안 남는다.",
    "confirm.restore.title": "이 상태로 되돌릴까?",
    "confirm.restore.text":
      "작업 디렉토리의 커밋되지 않은 변경은 사라진다. 지금 떠나는 상태도 reflog에 기록되므로 같은 방식으로 다시 돌아올 수 있다.",
    "confirm.discard.title": "{path}의 변경을 버릴까?",
    "confirm.discard.text": "커밋된 적 없는 수정이라 git에 사본이 없다. 되돌릴 수 없다.",
    "confirm.amend.title": "마지막 커밋을 교체할까?",
    "confirm.amend.text":
      "amend는 기존 커밋 자리에 새 커밋을 만든다. 이미 push한 커밋이라면 원격과 브랜치가 어긋난다.",
    "confirm.undoCommit.title": "마지막 커밋을 취소할까?",
    "confirm.undoCommit.text": "커밋은 사라지지만 그 안의 변경은 모두 스테이지에 남아 바로 다시 커밋할 수 있다.",
    "confirm.rebase.title": "이 커밋들을 새로 쓸까?",
    "confirm.rebase.text":
      "rebase는 커밋을 새것으로 교체한다. 이미 push했다면 원격과 브랜치가 어긋난다. 이전 사슬은 reflog에 남으므로 필요하면 되돌릴 수 있다.",
    "confirm.forcePush.title": "원격 브랜치를 덮어쓸까?",
    "confirm.forcePush.text":
      "원격의 커밋을 내 것으로 교체한다. --force-with-lease는 마지막 fetch 이후 누군가 push했다면 거부하지만, 한 번도 fetch하지 않은 남의 작업은 그대로 사라진다.",
    "confirm.discardEdits.title": "저장하지 않은 수정을 버릴까?",
    "confirm.discardEdits.text":
      "{path}에 디스크에 기록되지 않은 변경이 있다. git이 본 적 없는 내용이라 복구할 수 없다.",
    "confirm.discardEdits.command": "(실행되는 명령 없음 — 에디터의 내용만 버린다)",
  },

  ja: {
    "topbar.language": "言語",
    "topbar.theme": "テーマ",
    "topbar.refresh": "再読み込み",
    "topbar.refreshTitle": "リポジトリの状態を読み直す",

    "header.ahead": "{n} 先行",
    "header.behind": "{n} 遅れ",
    "header.inSync": "{upstream} と同期",

    "remote.title": "リモート",
    "remote.hint": "fetch は見るだけ、pull はブランチを進め、push はコミットを送る。",
    "remote.fetch": "取得",
    "remote.pull": "取り込み",
    "remote.push": "送信",
    "remote.noUpstream": "上流がまだない — push するとこのブランチが origin に作られる。",
    "remote.toPush": "送信するコミット {n} 件",
    "remote.toPull": "取り込むコミット {n} 件",
    "remote.upToDate": "リモートと同じ状態",

    "branches.title": "ブランチ",
    "branches.hint": "ブランチを押すとチェックアウトする。merge は別のブランチを現在のブランチに取り込む。",
    "branches.create": "作成",
    "branches.placeholder": "新しいブランチ名",
    "branches.empty": "ブランチがない",

    "worktree.title": "ワークツリー",
    "worktree.hint":
      "ワークツリーは別のブランチを専用のフォルダに展開する。stash せずに二つのブランチを同時に開いておける。",
    "worktree.add": "追加",
    "worktree.placeholder": "新しいワークツリーのブランチ",
    "worktree.empty": "ワークツリーがない",
    "worktree.open": "開く",
    "worktree.remove": "削除",
    "worktree.current": "表示中",
    "worktree.main": "本体",
    "worktree.detached": "detached",
    "confirm.removeWorktree.title": "このワークツリーを削除する?",
    "confirm.removeWorktree.text":
      "そのフォルダが削除される。ブランチとコミットは残り、この展開だけが消える。未コミットの変更があれば git が拒否する。",

    "reflog.title": "取り消しと復旧",
    "reflog.hint":
      "リポジトリが通ってきた状態がすべて記録される。どのブランチからも辿れなくなった状態も残る。誤った reset や rebase はここから戻す。",
    "reflog.empty": "まだ記録がない",

    "tabs.history": "履歴",
    "tabs.editor": "エディタ",
    "history.rebase": "履歴を書き換える…",
    "history.rebaseTitle": "最近のコミットを並べ替え、まとめ、書き換え、削除する",
    "history.hint": "点がコミット、列が開発の流れ。マージは二つの列をつなぐ。",
    "history.empty": "コミットがない",
    "history.noMessage": "(メッセージなし)",

    "editor.hint": "ファイルを編集して保存すると右の変更に現れる — そのままステージしてコミットできる。",
    "editor.filter": "ファイル検索",
    "editor.noFile": "開いているファイルなし",
    "editor.unsaved": "未保存",
    "editor.save": "保存",
    "editor.noFiles": "該当するファイルがない",

    "staged.title": "ステージ済み",
    "staged.unstageAll": "すべて解除",
    "staged.hint": "次のコミットに入る変更。",
    "staged.empty": "ステージされたものがない",

    "changes.title": "変更",
    "changes.stageAll": "すべてステージ",
    "changes.hint": "編集済みだがまだステージしていない。ファイルを押すと差分を見て hunk 単位でステージできる。",
    "changes.empty": "作業ディレクトリはきれい",
    "changes.conflicted": "衝突: ファイルを直して解決してからステージする",

    "commit.title": "コミット",
    "commit.placeholder": "何を、なぜ変えたか?",
    "commit.commit": "コミット",
    "commit.amend": "修正",
    "commit.amendTitle": "新しいコミットを作らず直前のコミットを置き換える",
    "commit.undo": "直前のコミットを取り消す",
    "commit.undoTitle": "直前のコミットを消すが変更はステージに残す",

    "diff.close": "閉じる",
    "diff.empty": "表示するテキストの変更がない",
    "diff.stageHunk": "この hunk をステージ",
    "diff.unstageHunk": "この hunk を解除",

    "log.title": "実行したコマンド",
    "log.hint": "このアプリがすることはすべて普通の git コマンド — その一覧。",
    "log.clear": "消去",

    "modal.cancel": "キャンセル",
    "modal.confirm": "実行",

    "rebase.title": "履歴を書き換える",
    "rebase.hint":
      "各コミットの扱いを選ぶ。上が古いコミットで、git が再生する順序もそれに従う。squash は直上のコミットにまとめ、drop は削除し、reword はメッセージを変える。コミットを作り直すので、すでに共有した履歴には使わない方がよい。",
    "rebase.run": "rebase を実行",
    "rebase.rewordPlaceholder": "新しいメッセージ",
    "rebase.squashPlaceholder": "まとめたメッセージ",

    "action.checkout": "チェックアウト",
    "action.merge": "マージ",
    "action.delete": "削除",
    "action.stage": "ステージ",
    "action.unstage": "解除",
    "action.discard": "破棄",
    "action.restore": "復元",
    "action.abort": "{which} を中断",
    "action.forcePush": "強制 push (--force-with-lease)",

    "alert.needMessage": "先にコミットメッセージを書く。",
    "alert.needAmendMessage": "置き換えるメッセージを先にコミット欄に書く。",
    "alert.nothingToRewrite": "書き換えるものがない。以前のコミットの上に乗った通常のコミットが最低一つ必要。",
    "alert.oldestSquash": "最も古いコミットにはまとめる先が上にない。",
    "alert.allDropped": "すべて drop すると rebase する対象が残らない。",
    "alert.inProgress":
      "{which} が進行中。衝突したファイルを解決してコミットするか、中断して元の位置に戻る。",
    "alert.dismiss": "閉じる",

    "confirm.deleteBranch.title": "{name} を削除する?",
    "confirm.deleteBranch.text":
      "このブランチからしか辿れなかったコミットは見つけにくくなる。ただし reflog にはしばらく残る。",
    "confirm.restore.title": "この状態に戻す?",
    "confirm.restore.text":
      "作業ディレクトリの未コミットの変更は失われる。今離れる状態も reflog に記録されるので、同じ方法で戻れる。",
    "confirm.discard.title": "{path} の変更を破棄する?",
    "confirm.discard.text": "一度もコミットされていない編集なので git に控えがない。取り消せない。",
    "confirm.amend.title": "直前のコミットを置き換える?",
    "confirm.amend.text":
      "amend は元のコミットの位置に新しいコミットを作る。すでに push 済みなら、リモートとブランチが食い違う。",
    "confirm.undoCommit.title": "直前のコミットを取り消す?",
    "confirm.undoCommit.text": "コミットは消えるが、含まれていた変更はすべてステージに残り、すぐ commit し直せる。",
    "confirm.rebase.title": "これらのコミットを書き換える?",
    "confirm.rebase.text":
      "rebase はコミットを新しいものに置き換える。すでに push 済みなら、リモートとブランチが食い違う。元の並びは reflog に残るので必要なら戻せる。",
    "confirm.forcePush.title": "リモートのブランチを上書きする?",
    "confirm.forcePush.text":
      "リモートのコミットを自分のもので置き換える。--force-with-lease は最後の fetch 以降に誰かが push していれば拒否するが、一度も fetch していない他人の作業は失われる。",
    "confirm.discardEdits.title": "保存していない編集を破棄する?",
    "confirm.discardEdits.text":
      "{path} にディスクへ書かれていない変更がある。git が見たことのない内容なので復元できない。",
    "confirm.discardEdits.command": "(実行されるコマンドはない — エディタの内容を捨てるだけ)",
  },
};
