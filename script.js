(function() {
  var sf = document.getElementById('searchForm');
  var si = document.getElementById('searchInput');
  var ct = document.getElementById('shortcuts');
  var sg = document.getElementById('suggestions');

  sf.addEventListener('submit', function(e) {
    e.preventDefault();
    var q = si.value.trim();
    if (q) {
      saveHistory(q);
      window.location.href = 'https://www.bing.com/search?q=' + encodeURIComponent(q);
    }
  });

  var def = [
    { n: 'B站', u: 'https://www.bilibili.com', i: 'B' },
    { n: '知乎', u: 'https://www.zhihu.com', i: '知' },
    { n: '微博', u: 'https://weibo.com', i: '微' },
    { n: '百度', u: 'https://www.baidu.com', i: '百' },
    { n: 'GitHub', u: 'https://github.com', i: 'G' },
    { n: 'YouTube', u: 'https://www.youtube.com', i: 'Y' },
    { n: '掘金', u: 'https://juejin.cn', i: '掘' },
    { n: 'CSDN', u: 'https://www.csdn.net', i: 'C' },
    { n: '抖音', u: 'https://www.douyin.com', i: '抖' }
  ];

  function rn(sites) {
    ct.innerHTML = '';
    for (var i = 0; i < sites.length; i++) {
      var s = sites[i];
      var a = document.createElement('a');
      a.className = 'shortcut'; a.href = s.u; a.title = s.n;
      var ic = document.createElement('div');
      ic.className = 'shortcut-icon'; ic.textContent = s.i;
      var nm = document.createElement('div');
      nm.className = 'shortcut-name'; nm.textContent = s.n;
      a.appendChild(ic); a.appendChild(nm);
      ct.appendChild(a);
    }
  }

  var sites;
  try {
    var saved = localStorage.getItem('sp_sites');
    sites = saved ? JSON.parse(saved) : def;
  } catch(e) { sites = def; }
  rn(sites);

  document.getElementById('settingsLink').addEventListener('click', function() {
    var raw = prompt(
      '编辑常用网站（每行一个：名称|网址）：',
      sites.map(function(s) { return s.n + '|' + s.u; }).join('\n'));
    if (!raw) return;
    var lines = raw.split('\n').filter(function(l) { return l.trim(); });
    var ns = [];
    for (var j = 0; j < lines.length; j++) {
      var pts = lines[j].split('|');
      if (pts.length >= 2) {
        ns.push({ n: pts[0].trim(), u: pts[1].trim(), i: pts[0].trim()[0] });
      }
    }
    if (ns.length > 0) {
      localStorage.setItem('sp_sites', JSON.stringify(ns));
      sites = ns; rn(sites);
    }
  });

  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      document.getElementById('settingsLink').click();
    }
  });

  // Search history
  function getHistory() {
    try {
      var h = localStorage.getItem('sp_history');
      return h ? JSON.parse(h) : [];
    } catch(e) { return []; }
  }

  function saveHistory(q) {
    q = q.trim();
    if (!q) return;
    var h = getHistory();
    var idx = h.indexOf(q);
    if (idx > -1) h.splice(idx, 1);
    h.unshift(q);
    if (h.length > 10) h = h.slice(0, 10);
    try { localStorage.setItem('sp_history', JSON.stringify(h)); } catch(e) {}
  }

  // Suggestions dropdown
  var timer = null;
  var selIdx = -1;

  si.addEventListener('input', function() {
    clearTimeout(timer);
    var q = si.value.trim();
    if (q) {
      timer = setTimeout(function() { fetchSugs(q); }, 200);
    } else {
      sg.classList.remove('active');
      si.classList.remove('suggestions-active');
      selIdx = -1;
    }
  });

  si.addEventListener('focus', function() {
    var q = si.value.trim();
    if (q && sg.children.length > 0) {
      sg.classList.add('active');
      si.classList.add('suggestions-active');
    }
  });

  si.addEventListener('keydown', function(e) {
    if (!sg.classList.contains('active')) return;
    var allItems = sg.querySelectorAll('.suggestion-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selIdx = Math.min(selIdx + 1, allItems.length - 1);
      doHighlight(allItems, true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selIdx = Math.max(selIdx - 1, -1);
      doHighlight(allItems, true);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selIdx >= 0 && selIdx < allItems.length) {
        si.value = allItems[selIdx].getAttribute('data-text');
      }
      sg.classList.remove('active');
      si.classList.remove('suggestions-active');
      sf.dispatchEvent(new Event('submit'));
    } else if (e.key === 'Escape') {
      sg.classList.remove('active');
      si.classList.remove('suggestions-active');
      selIdx = -1;
    }
  });

  document.addEventListener('click', function(e) {
    if (!sf.contains(e.target)) {
      sg.classList.remove('active');
      si.classList.remove('suggestions-active');
    }
  });

  function doHighlight(allItems, updateInput) {
    for (var i = 0; i < allItems.length; i++) {
      allItems[i].classList.toggle('active', i === selIdx);
    }
    if (updateInput && selIdx >= 0 && selIdx < allItems.length) {
      si.value = allItems[selIdx].getAttribute('data-text');
    }
  }

  function fetchSugs(q) {
    fetch('https://sug.so.360.cn/suggest?word=' + encodeURIComponent(q))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data && data.result) {
          var list = [];
          for (var i = 0; i < data.result.length; i++) {
            list.push(data.result[i].word);
          }
          showDropdown(q, getHistory(), list);
        }
      })
      .catch(function() {});
  }

  function showDropdown(q, history, sugs) {
    sg.innerHTML = '';
    var histMatch = [];
    for (var i = 0; i < history.length; i++) {
      if (history[i].toLowerCase().indexOf(q.toLowerCase()) > -1) {
        histMatch.push(history[i]);
      }
    }
    if (histMatch.length > 0) {
      for (var j = 0; j < Math.min(histMatch.length, 3); j++) {
        addItem(histMatch[j], 'history');
      }
      if (sugs && sugs.length > 0) {
        var sep = document.createElement('div');
        sep.className = 'suggestion-separator';
        sg.appendChild(sep);
      }
    }
    if (sugs && sugs.length > 0) {
      for (var k = 0; k < Math.min(sugs.length, 5); k++) {
        addItem(sugs[k], 'suggest');
      }
    }
    if (sg.children.length > 0) {
      sg.classList.add('active');
      si.classList.add('suggestions-active');
    } else {
      sg.classList.remove('active');
      si.classList.remove('suggestions-active');
    }
    selIdx = -1;
  }

  function addItem(text, type) {
    var item = document.createElement('div');
    item.className = 'suggestion-item';
    item.setAttribute('data-text', text);
    var icon = document.createElement('span');
    icon.className = 'icon';
    icon.textContent = type === 'history' ? '\uD83D\uDD50' : '\uD83D\uDD0D';
    var label = document.createElement('span');
    label.textContent = text;
    item.appendChild(icon);
    item.appendChild(label);

    item.addEventListener('mousedown', function(e) {
      e.preventDefault();
      var t = this.getAttribute('data-text');
      si.value = t;
      sg.classList.remove('active');
      si.classList.remove('suggestions-active');
      saveHistory(t);
      window.location.href = 'https://www.bing.com/search?q=' + encodeURIComponent(t);
    });

    item.addEventListener('mouseenter', function() {
      var all = sg.querySelectorAll('.suggestion-item');
      for (var idx = 0; idx < all.length; idx++) {
        if (all[idx] === this) { selIdx = idx; break; }
      }
      doHighlight(all, false);
    });

    sg.appendChild(item);
  }
})();