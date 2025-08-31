/***** サクラチェッカーリンク自動挿入 *****/
const SAKURA_CHECK_URL = "https://sakura-checker.jp/search/";
const SAKURA_CHECK_TEXT = "サクラチェッカー";

(function () {
    // ASIN取得
    const url = document.location.href;
    const match = url.match(/\/([A-Z0-9]{10})(?:[/?]|$)/);
    if (!match) return;
    const asin = match[1];

    // サクラチェッカーリンク生成
    const linkUrl = SAKURA_CHECK_URL + asin;

    // ターゲット DOM
    const targetDom = document.getElementById("averageCustomerReviews");
    if (!targetDom) return;

    // リンク要素作成
    const span = document.createElement("span");
    const link = document.createElement("a");
    link.href = linkUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.innerText = SAKURA_CHECK_TEXT;
    span.appendChild(link);

    // スペーサー追加
    const spacer = document.createElement("span");
    spacer.className = "a-letter-space";
    targetDom.appendChild(spacer);
    targetDom.appendChild(span);
})();