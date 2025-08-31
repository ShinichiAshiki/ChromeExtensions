// --------------------------
// 初期化（保存されている状態を復元）
// --------------------------
document.addEventListener("DOMContentLoaded", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const body = document.body;

    if (!tab || !tab.url) {
        body.innerHTML = "<p>タブ情報が取得できませんでした。</p>";
        return;
    }

    // URLオブジェクトに変換
    const url = new URL(tab.url);
    const hostname = url.hostname;
    const pathname = url.pathname;

    // Amazon.co.jp かつ検索結果(/s)またはカテゴリ(/b)ページか判定
    const isSearch = /^\/s(\/|\?|$)/.test(pathname);
    const isCategory = /^\/b(\/|\?|$)/.test(pathname);

    if (!hostname.endsWith("amazon.co.jp") || (!isSearch && !isCategory)) {
        body.innerHTML = "<p>この拡張機能は Amazon.co.jp の検索結果、若しくはカテゴリページでのみ使用できます。</p>";
        return;
    }

    // 保存されているフィルター状態を復元
    chrome.storage.local.get(["filters"], (result) => {
        const filters = result.filters || {};
        document.getElementById("emi").checked = !!filters.emi;
        document.getElementById("half").checked = !!filters.half;
        document.getElementById("deal").checked = !!filters.deal;
        document.getElementById("timedeal").checked = !!filters.timedeal;
    });
});

// --------------------------
// 適用ボタンを押したとき
// --------------------------
document.getElementById("apply").addEventListener("click", async () => {
    const filters = {
        emi: document.getElementById("emi").checked,
        half: document.getElementById("half").checked,
        deal: document.getElementById("deal").checked,
        timedeal: document.getElementById("timedeal").checked
    };
    console.log(filters);
    // 保存
    chrome.storage.local.set({ filters });

    // 現在のタブに適用
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: applyFilters,
        args: [filters]
    });
});

// --------------------------
// ページに注入される処理
// --------------------------
function applyFilters(filters) {
    let url = new URL(window.location.href);

    // 一度削除（リセット）
    url.searchParams.delete("emi");
    url.searchParams.delete("pct-off");
    url.searchParams.delete("i");
    url.searchParams.delete("rh");

    // 条件を付与
    if (filters.emi) url.searchParams.set("emi", "AN1VRQENFRJN5");
    if (filters.half) url.searchParams.set("pct-off", "50-");
    if (filters.deal) url.searchParams.set("i", "todays-deals");
    if (filters.timedeal) url.searchParams.set("rh", "p_n_deal_type:26921224051");

    // URL が変わったらリロード
    if (url.href !== window.location.href) {
        window.location.href = url.href;
    }
}