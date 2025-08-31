console.log("run content.js");
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

// タブ化処理
function applyTabs() {
  if (STATE.applied) return false;
  if (!window.location.href.includes("/watch")) return false;

  const { primary, secondary, related, playlist, chat, comments } = getElements();
  if (!primary || !secondary) return false;

  const tabs = [];
  if (related) tabs.push({ el: related, name: "関連動画" });
  if (comments) tabs.push({ el: comments, name: "コメント" });
  if (chat) tabs.push({ el: chat, name: "チャット" });
  if (playlist) tabs.push({ el: playlist, name: "プレイリスト" });

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

  secondary.innerHTML = "";
  secondary.appendChild(tabBar);
  secondary.appendChild(contentContainer);

  STATE.applied = true;
  return true;
}

// コメント出現までポーリング
function tryApplyForAWhile(maxTries = 50, interval = 1000) {
  let tries = 0;
  const timer = setInterval(() => {
    if (applyTabs() || ++tries >= maxTries) clearInterval(timer);
  }, interval);
}

// SPA遷移対応
window.addEventListener("yt-navigate-start", () => { STATE.applied = false; });
window.addEventListener("yt-navigate-finish", () => {
  if (window.location.href.includes("/watch")) tryApplyForAWhile();
});

// 初回適用
if (window.location.href.includes("/watch")) tryApplyForAWhile();
