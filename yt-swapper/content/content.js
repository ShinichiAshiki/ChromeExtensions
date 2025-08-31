const STATE = { applied: false };

// DOM要素を取得
function getElements() {
  const primary = document.querySelector("#primary-inner #below");
  const secondary = document.querySelector("#secondary-inner");
  const related = document.querySelector("#related");
  const comments = document.querySelector("#comments");
  return { primary, secondary, related, comments };
}

// レイアウト入れ替え
function applySwap() {
  if (STATE.applied) return false;
  if (!window.location.href.includes("/watch")) return false;

  const { primary, secondary, related, comments } = getElements();
  if (!primary || !secondary || !related || !comments) return false;

  secondary.appendChild(comments); // コメントを右に
  primary.appendChild(related);    // 関連動画を下に

  STATE.applied = true;
  return true;
}

// リセット処理
function resetSwap() {
  if (!STATE.applied) return;
  const { primary, secondary, related, comments } = getElements();
  if (!primary || !secondary || !related || !comments) return false;

  secondary.appendChild(related); // 関連動画を下に
  primary.appendChild(comments);  // コメントを下に

  STATE.applied = false;
}

// ページ適用関数（最大5秒ポーリング）
function tryApplyForAWhile() {
  let tries = 0;
  const max = 50;
  const timer = setInterval(() => {
    if (applySwap() || ++tries >= max) clearInterval(timer);
  }, 1000);
}

// SPA遷移対応
window.addEventListener("yt-navigate-start", () => {
  resetSwap();
});

window.addEventListener("yt-navigate-finish", () => {
  if (window.location.href.includes("/watch")) tryApplyForAWhile();
});

// 初回適用（/watch* ページの場合）
if (window.location.href.includes("/watch")) {
  tryApplyForAWhile();
}