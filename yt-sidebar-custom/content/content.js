const STATE = { applied: false };

// DOM要素取得
function getElements() {
  const primary = document.querySelector("#primary-inner");
  const secondary = document.querySelector("#secondary-inner");
  const related = secondary ? secondary.querySelector("#related") : null;
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
  console.log("applyTabs");
  if (STATE.applied) return false;
  if (!window.location.href.includes("/watch")) return false;

  const { primary, secondary, related, playlist, chat, comments } = getElements();
  if (!primary || !secondary) return false;

  // タブ対象を決定
  const tabs = [];
  const live = isLiveVideo();
  console.log("isLiveVideo:", live);
  if (live) {
    // 生放送中 → liveチャット固定、下に関連・プレイリスト
    if (related) tabs.push({ el: related, name: "関連動画" });
    if (playlist) tabs.push({ el: playlist, name: "プレイリスト" });
  } else {
    // 通常動画・アーカイブ → コメントもタブ化
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

  // secondary にタブをセット
  secondary.appendChild(tabBar);
  secondary.appendChild(contentContainer);

  STATE.applied = true;
  return true;
}

// 元に戻す処理(TODO:検討)
function resetTabs() {
  console.log("resetTabs");
  if (!STATE.applied) return;
  const { secondary } = getElements();
  if (!secondary) return;

  secondary.innerHTML = "";
  STATE.applied = false;
}

// コメント出現までポーリング
function tryApplyForAWhile() {
  console.log("tryApplyForAWhile");
  let tries = 0;
  const max = 50;
  const timer = setInterval(() => {
    if (applyTabs() || ++tries >= max) clearInterval(timer);
  }, 1000);
}

// SPA遷移対応
window.addEventListener("yt-navigate-start", () => {
  console.log("SPA start resetSwap");
  resetTabs();
});
window.addEventListener("yt-navigate-finish", () => {
  console.log("SPA finish tryApplyForAWhile");
  if (window.location.href.includes("/watch")) tryApplyForAWhile();
});

// 初回適用
if (window.location.href.includes("/watch")) {
  console.log("初回適用");
  tryApplyForAWhile();
}
