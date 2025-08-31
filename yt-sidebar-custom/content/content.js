const STATE = { applied: false };

// DOM要素取得
function getElements() {
  const primary = document.querySelector("#primary-inner");
  const secondary = document.querySelector("#secondary-inner");
  const related = secondary ? secondary.querySelector("#related.style-scope.ytd-watch-flexy") : null;
  const playlist = secondary ? secondary.querySelector("#playlist") : null;
  const chat = secondary ? secondary.querySelector("#chat") : null;
  const comments = primary ? primary.querySelector("#comments") : null;
  return { primary, secondary, related, playlist, chat, comments };
}

// 生放送判定
function isLiveVideo() {
  const player = document.querySelector('#ytd-player');
  return !!player?.querySelector('.ytp-live');
}

// タブ化処理
function applyTabs() {
  if (STATE.applied) return false;
  if (!window.location.href.includes("/watch")) return false;

  const { primary, secondary, related, playlist, chat, comments } = getElements();
  if (!primary || !secondary) return false;

  // タブ対象を決定
  const tabs = [];
  const live = isLiveVideo();
  if (live) {
    if (related) tabs.push({ el: related, name: "関連動画" });
    if (playlist) tabs.push({ el: playlist, name: "プレイリスト" });
  } else {
    if (related) tabs.push({ el: related, name: "関連動画" });
    if (comments) tabs.push({ el: comments, name: "コメント" });
    if (chat) tabs.push({ el: chat, name: "チャット" });
    if (playlist) tabs.push({ el: playlist, name: "プレイリスト" });
  }

  if (tabs.length === 0) return false;

  // タブバー作成
  const tabBar = document.createElement("div");
  tabBar.id = "yt-sidebar-tabs";
  tabBar.style.display = "flex";
  tabBar.style.borderBottom = "1px solid #ccc";

  const contentContainer = document.createElement("div");
  contentContainer.id = "yt-sidebar-contents";

  tabs.forEach((tab, i) => {
    const tabBtn = document.createElement("button");
    tabBtn.textContent = tab.name;
    tabBtn.style.flex = "1";
    tabBtn.style.padding = "5px";
    tabBtn.style.cursor = "pointer";
    tabBtn.style.border = "none";
    tabBtn.style.background = i === 0 ? "#ddd" : "#fff";

    const wrapper = document.createElement("div");
    wrapper.className = "yt-tab-content";
    wrapper.style.display = i === 0 ? "block" : "none";
    wrapper.style.maxHeight = "100vh";
    wrapper.style.overflowY = "auto";
    wrapper.style.overscrollBehavior = "contain";
    wrapper.appendChild(tab.el);

    tabBtn.addEventListener("click", () => {
      document.querySelectorAll(".yt-tab-content").forEach(c => c.style.display = "none");
      document.querySelectorAll("#yt-sidebar-tabs button").forEach(b => b.style.background = "#fff");
      wrapper.style.display = "block";
      tabBtn.style.background = "#ddd";
    });

    tabBar.appendChild(tabBtn);
    contentContainer.appendChild(wrapper);
  });

  // secondary の子にタブをセット
  secondary.appendChild(tabBar);
  secondary.appendChild(contentContainer);

  STATE.applied = true;
  return true;
}

// 元に戻す処理
function resetTabs() {
  if (!STATE.applied) return;
  const { secondary, primary } = getElements();
  if (!secondary) return;

  const tabBar = secondary.querySelector("#yt-sidebar-tabs");
  const contentContainer = secondary.querySelector("#yt-sidebar-contents");

  // 子要素を元に戻す
  if (contentContainer) {
    const moved = contentContainer.querySelectorAll("#related, #playlist, #chat, #comments");
    moved.forEach(el => {
      if (el.id === "comments") {
        primary.appendChild(el);
      } else {
        secondary.appendChild(el);
      }
    });
  }

  // タブバー・コンテンツ削除
  if (tabBar) tabBar.remove();
  if (contentContainer) contentContainer.remove();

  STATE.applied = false;
}

// ポーリング
function tryApplyForAWhile() {
  let tries = 0;
  const max = 50;
  const timer = setInterval(() => {
    if (applyTabs() || ++tries >= max || STATE.applied) clearInterval(timer);
  }, 1000);
}

// SPA遷移対応
window.addEventListener("yt-navigate-start", () => {
  resetTabs();
});
window.addEventListener("yt-navigate-finish", () => {
  if (window.location.href.includes("/watch")) tryApplyForAWhile();
});

// 初回適用
if (window.location.href.includes("/watch")) {
  tryApplyForAWhile();
}
