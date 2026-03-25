const highlightButton = document.getElementById("highlightBtn");

highlightButton.addEventListener("click", async function () {
  const keyword = document.getElementById("keyword").value;

  // Bỏ qua input rỗng để tránh inject script không cần thiết.
  if (!keyword) {
    return;
  }

  // Lấy tab đang active trong cửa sổ hiện tại.
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  const tab = tabs[0];

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    args: [keyword],

    // Chạy logic highlight trong context của trang web, không phải popup.
    func: function (keyword) {
      const regex = new RegExp(keyword, "gi");

      function walk(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.nodeValue;

          if (regex.test(text)) {
            const span = document.createElement("span");

            // Bọc phần khớp bằng thẻ <mark> để highlight trực quan.
            span.innerHTML = text.replace(regex, function (match) {
              return "<mark>" + match + "</mark>";
            });

            node.replaceWith(span);
          }
        } else {
          node.childNodes.forEach(walk);
        }
      }

      // Bắt đầu duyệt từ body để xử lý phần nội dung hiển thị của trang.
      walk(document.body);
    }
  });
});