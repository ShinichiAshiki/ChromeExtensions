const STATE = { applied: false };

// DOM要素取得
function getElements() {
  const primary = document.querySelector("#primary-inner");
  const secondary = document.querySelector("#secondary-inner");

  return {
    primary,
    secondary,
    related: secondary?.querySelector("#related.style-scope.ytd-watch-flexy"),
    playlist: secondary?.querySelector("#playlist"),
    chat: secondary?.querySelector("#chat-container"),
    comments: primary?.querySelector("#comments")
  };
}

function getChatContainer() {
  return document.querySelector("#chat-container");
}

function hideChat() {
  const chat = getChatContainer();
  if (chat) {
    chat.style.display = "none";
  }
}

function showChat() {
  const chat = getChatContainer();
  if (chat) {
    chat.style.display = "";
  }
}

// タブ化処理
function applyTabs() {
  if (STATE.applied) return false;
  if (!window.location.href.includes("/watch")) return false;

  const {
    primary,
    secondary,
    related,
    playlist,
    chat,
    comments
  } = getElements();

  if (!primary || !secondary) return false;

  const isLive = !!document
    .querySelector("#ytd-player")
    ?.querySelector(".ytp-live");

  const tabs = [];

  if (related) {
    tabs.push({
      el: related,
      name: "関連動画"
    });
  }

  if (!isLive && comments) {
    tabs.push({
      el: comments,
      name: "コメント"
    });
  }

  if (chat) {
    tabs.push({
      el: null,
      name: "チャット",
      isChat: true
    });
  }

  if (playlist) {
    tabs.push({
      el: playlist,
      name: "プレイリスト"
    });
  }

  if (tabs.length === 0) return false;

  // タブバー
  const tabBar = document.createElement("div");
  tabBar.id = "yt-sidebar-tabs";
  tabBar.style.display = "flex";
  tabBar.style.borderBottom = "1px solid #ccc";

  // コンテンツ領域
  const contentContainer = document.createElement("div");
  contentContainer.id = "yt-sidebar-contents";

  tabs.forEach((tab, index) => {
    const tabBtn = document.createElement("button");

    tabBtn.textContent = tab.name;
    tabBtn.style.flex = "1";
    tabBtn.style.padding = "5px";
    tabBtn.style.cursor = "pointer";
    tabBtn.style.border = "none";
    tabBtn.style.background = index === 0 ? "#ddd" : "#fff";

    const wrapper = document.createElement("div");
    wrapper.className = "yt-tab-content";

    if (tab.isChat) {
      wrapper.style.display = "none";
    } else {
      wrapper.style.display = index === 0 ? "block" : "none";
    }

    wrapper.style.maxHeight = "100vh";
    wrapper.style.overflowY = "auto";
    wrapper.style.overscrollBehavior = "contain";

    if (tab.el) {
      wrapper.appendChild(tab.el);
    }

    tabBtn.addEventListener("click", () => {
      document
        .querySelectorAll(".yt-tab-content")
        .forEach(el => (el.style.display = "none"));

      document
        .querySelectorAll("#yt-sidebar-tabs button")
        .forEach(el => (el.style.background = "#fff"));

      if (tab.isChat) {
        showChat();
      } else {
        hideChat();
        wrapper.style.display = "block";
      }

      tabBtn.style.background = "#ddd";
    });

    tabBar.appendChild(tabBtn);
    contentContainer.appendChild(wrapper);
  });

  // 上部へ配置
  secondary.prepend(contentContainer);
  secondary.prepend(tabBar);

  hideChat();

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

  if (contentContainer) {
    const moved = contentContainer.querySelectorAll(
      "#related, #playlist, #comments"
    );

    moved.forEach(el => {
      if (el.id === "comments") {
        primary?.appendChild(el);
      } else {
        secondary.appendChild(el);
      }
    });
  }

  tabBar?.remove();
  contentContainer?.remove();

  showChat();

  STATE.applied = false;
}

// ポーリング
function tryApplyForAWhile() {
  let tries = 0;
  const max = 50;

  const timer = setInterval(() => {
    if (applyTabs() || ++tries >= max || STATE.applied) {
      clearInterval(timer);
    }
  }, 1000);
}

// SPA遷移対応
window.addEventListener("yt-navigate-start", resetTabs);

window.addEventListener("yt-navigate-finish", () => {
  if (window.location.href.includes("/watch")) {
    tryApplyForAWhile();
  }
});

// 初回適用
if (window.location.href.includes("/watch")) {
  tryApplyForAWhile();
}