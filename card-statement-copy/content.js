(function () {
  // prevent multiple buttons
  if (document.getElementById("tsv-copy-btn")) return;

  // create button
  const btn = document.createElement("button");
  btn.id = "tsv-copy-btn";
  btn.textContent = "TSVコピー";
  btn.style.position = "fixed";
  btn.style.top = "10px";
  btn.style.right = "10px";
  btn.style.zIndex = "9999";
  btn.style.padding = "8px 12px";
  btn.style.background = "#1976d2";
  btn.style.color = "#fff";
  btn.style.border = "none";
  btn.style.borderRadius = "4px";
  btn.style.cursor = "pointer";

  document.body.appendChild(btn);

  btn.addEventListener("click", () => {
    const rows = document.querySelectorAll(".stmt-payment-lists__i");
    const lines = [];

    rows.forEach(row => {
      const cols = row.querySelectorAll(".stmt-payment-lists__tbl .stmt-payment-lists__data");
      if (cols.length < 5) return;

      const date = cols[0].innerText.trim();
      const shop = cols[1].innerText.trim();
      const user = cols[2].innerText.trim();
      const pay = cols[3].innerText.trim();
      const amount = cols[4].innerText
        .replace(/[¥￥,\s]/g, "")
        .trim();

      lines.push([date, shop, user, pay, amount].join("\t"));
    });

    const tsv = lines.join("\n");
  });
})();
