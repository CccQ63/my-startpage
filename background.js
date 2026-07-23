// Bing 搜索建议代理
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'getSuggestions') {
    var url = 'https://www.bing.com/AS/Suggestions?pt=page.home&mkt=zh-CN&qry=' + encodeURIComponent(request.q);
    fetch(url)
      .then(function(r) { return r.text(); })
      .then(function(text) {
        try {
          var results = [];
          // 尝试解析 JSONP 回包
          var match = text.match(/\[\["([^"]+)"\s*,\s*(\[.*?\])\s*\]/);
          if (match) {
            results = JSON.parse(match[2]);
          } else {
            // 尝试另一个格式
            var m2 = text.match(/\u005b\u005b.*?\u005d/);
            if (m2) {
              var data = JSON.parse(m2[0] + ']');
              if (data && data[0] && data[0][1]) results = data[0][1];
            }
          }
          sendResponse({ suggestions: results });
        } catch(e) {
          sendResponse({ suggestions: [] });
        }
      })
      .catch(function() { sendResponse({ suggestions: [] }); });
    return true; // 异步响应需要
  }
});
