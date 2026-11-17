/*! Riverside Knowledge Hub: core logic (pure functions, no DOM). MIT License. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.KMSCore = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function uid(prefix) {
    return (prefix || "p") + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }
  function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  /* ---------- Markdown (small, safe subset) ---------- */
  function inline(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  }
  function markdown(text) {
    var out = "", list = null, inCode = false, buf = [];
    function closeList() { if (list) { out += "</" + list + ">"; list = null; } }
    String(text || "").split("\n").forEach(function (line) {
      var m;
      if (line.indexOf("```") === 0) {
        if (inCode) { out += "<pre><code>" + esc(buf.join("\n")) + "</code></pre>"; buf = []; inCode = false; }
        else { closeList(); inCode = true; }
        return;
      }
      if (inCode) { buf.push(line); return; }
      if ((m = line.match(/^(#{1,3}) (.*)/))) {
        closeList();
        var n = m[1].length + 1;
        out += "<h" + n + ' id="' + slug(m[2]) + '">' + inline(m[2]) + "</h" + n + ">";
        return;
      }
      if ((m = line.match(/^[-*] (.*)/))) {
        if (list !== "ul") { closeList(); out += "<ul>"; list = "ul"; }
        out += "<li>" + inline(m[1]) + "</li>"; return;
      }
      if ((m = line.match(/^\d+\. (.*)/))) {
        if (list !== "ol") { closeList(); out += "<ol>"; list = "ol"; }
        out += "<li>" + inline(m[1]) + "</li>"; return;
      }
      if ((m = line.match(/^> (.*)/))) { closeList(); out += "<blockquote>" + inline(m[1]) + "</blockquote>"; return; }
      closeList();
      if (line.trim()) out += "<p>" + inline(line) + "</p>";
    });
    closeList();
    if (inCode) out += "<pre><code>" + esc(buf.join("\n")) + "</code></pre>";
    return out;
  }
  function toc(body) {
    var out = [];
    String(body || "").split("\n").forEach(function (l) {
      var m = l.match(/^(#{1,3}) (.*)/);
      if (m) out.push({ level: m[1].length, text: m[2].trim(), id: slug(m[2]) });
    });
    return out;
  }
  function plain(body) {
    return String(body || "").replace(/```[\s\S]*?```/g, " ").replace(/[#>*`_\[\]()-]+/g, " ").replace(/\s+/g, " ").trim();
  }
  function readingTime(body) {
    var words = plain(body).split(" ").filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }

  /* ---------- Search ---------- */
  function terms(q) { return String(q || "").toLowerCase().trim().split(/\s+/).filter(Boolean); }
  function scorePage(p, ts) {
    var t = (p.title || "").toLowerCase(), b = (p.body || "").toLowerCase();
    var g = (p.tags || []).join(" ").toLowerCase(), s = (p.space || "").toLowerCase(), sc = 0;
    ts.forEach(function (x) {
      if (t.indexOf(x) >= 0) sc += 5;
      if (g.indexOf(x) >= 0) sc += 3;
      if (s.indexOf(x) >= 0) sc += 1;
      if (b.indexOf(x) >= 0) sc += 1;
    });
    return sc;
  }
  function search(pages, q) {
    var ts = terms(q);
    if (!ts.length) return [];
    return pages.map(function (p) { return { page: p, score: scorePage(p, ts) }; })
      .filter(function (r) { return r.score > 0; })
      .sort(function (a, b) { return b.score - a.score; });
  }
  function snippet(p, q, len) {
    len = len || 150;
    var text = plain(p.body), ts = terms(q), i = ts.length ? text.toLowerCase().indexOf(ts[0]) : -1;
    var start = Math.max(0, i < 0 ? 0 : i - 40);
    return text.slice(start, start + len);
  }
  function highlight(text, ts) {
    var h = esc(text);
    ts.forEach(function (t) {
      var re = new RegExp("(" + esc(t).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
      h = h.replace(re, "<mark>$1</mark>");
    });
    return h;
  }

  /* ---------- Governance helpers ---------- */
  function isDue(p, today) {
    today = today || new Date().toISOString().slice(0, 10);
    return !!(p.reviewBy && p.status === "published" && p.reviewBy < today);
  }
  function parseTags(s) {
    var seen = {};
    return String(s || "").split(",").map(function (t) { return t.trim().toLowerCase(); })
      .filter(function (t) { if (!t || seen[t]) return false; seen[t] = 1; return true; });
  }
  function parseResources(text) {
    return String(text || "").split("\n").map(function (l) {
      var a = l.split("|"), n = a[0].trim(), u = (a[1] || "").trim();
      return n ? { n: n, u: /^https?:\/\//.test(u) ? u : "" } : null;
    }).filter(Boolean);
  }
  function tagCounts(pages) {
    var c = {};
    pages.forEach(function (p) { (p.tags || []).forEach(function (t) { c[t] = (c[t] || 0) + 1; }); });
    return Object.keys(c).sort(function (a, b) { return c[b] - c[a] || a.localeCompare(b); })
      .map(function (t) { return { tag: t, count: c[t] }; });
  }

  /* ---------- KM cycle statistics ---------- */
  function stats(pages, cfg) {
    cfg = cfg || {};
    var s = { total: pages.length, draft: 0, review: 0, changes: 0, published: 0, views: 0, comments: 0, up: 0, down: 0, captured: 0 };
    pages.forEach(function (p) {
      s[p.status] = (s[p.status] || 0) + 1;
      s.views += p.views || 0;
      s.comments += (p.comments || []).length;
      Object.keys(p.helpful || {}).forEach(function (k) { p.helpful[k] > 0 ? s.up++ : s.down++; });
      if ((p.res && p.res.length) || /tips|mistakes|lessons/i.test(p.body || "")) s.captured++;
    });
    s.gaps = Object.keys(cfg.gaps || {}).length;
    s.searches = cfg.searches || 0;
    return s;
  }
  function kmCycle(st) {
    return [
      { n: 1, name: "Create", value: st.draft + st.changes, label: "pages being written", go: "browse" },
      { n: 2, name: "Capture", value: st.captured, label: "with tips or resources", go: "browse" },
      { n: 3, name: "Refine", value: st.review, label: "waiting for review", go: "review" },
      { n: 4, name: "Store", value: st.published, label: "published pages", go: "browse" },
      { n: 5, name: "Share", value: st.searches, label: "searches made", go: "analytics" },
      { n: 6, name: "Apply", value: st.views, label: "page views", go: "analytics" },
      { n: 7, name: "Feedback", value: st.comments + st.up + st.down + st.gaps, label: "comments, ratings, gaps", go: "analytics" }
    ];
  }

  return { esc: esc, uid: uid, slug: slug, inline: inline, markdown: markdown, toc: toc, plain: plain,
    readingTime: readingTime, terms: terms, search: search, snippet: snippet, highlight: highlight,
    isDue: isDue, parseTags: parseTags, parseResources: parseResources, tagCounts: tagCounts,
    stats: stats, kmCycle: kmCycle };
});
