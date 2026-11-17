/*! Persistence for the Hub: localStorage with JSON import/export. MIT License. */
(function (root) {
  "use strict";
  var C = root.KMSCore;
  var KEY = "riverside-kms/v2";
  var state = { pages: {}, cfg: { gaps: {}, searches: 0 }, prefs: { theme: "", name: "You", role: "Lecturer" } };
  var memoryOnly = false;

  function load() {
    try {
      var j = JSON.parse(root.localStorage.getItem(KEY));
      if (j && j.schema === 2) {
        state.pages = j.pages || {};
        state.cfg = Object.assign({ gaps: {}, searches: 0 }, j.cfg || {});
        state.prefs = Object.assign(state.prefs, j.prefs || {});
      }
    } catch (e) { memoryOnly = true; }
  }
  function save() {
    try {
      root.localStorage.setItem(KEY, JSON.stringify({ schema: 2, pages: state.pages, cfg: state.cfg, prefs: state.prefs }));
    } catch (e) { memoryOnly = true; }
  }
  function all() { return Object.keys(state.pages).map(function (k) { return state.pages[k]; }); }
  function put(p) { state.pages[p.id] = JSON.parse(JSON.stringify(p)); save(); }
  function del(id) { delete state.pages[id]; save(); }
  function exportJSON() {
    return JSON.stringify({ app: "riverside-knowledge-hub", schema: 2, exported: new Date().toISOString(), pages: all(), cfg: state.cfg }, null, 2);
  }
  function clean(p) {
    if (!p || typeof p.title !== "string" || !p.title.trim()) return null;
    var STAT = ["draft", "review", "changes", "published"];
    var now = Date.now();
    var body = typeof p.body === "string" ? p.body : "";
    return {
      id: typeof p.id === "string" && p.id ? p.id : C.uid(), title: p.title.trim().slice(0, 200),
      space: typeof p.space === "string" ? p.space : "Teaching",
      tags: Array.isArray(p.tags) ? p.tags.map(String).slice(0, 20) : [],
      body: body, status: STAT.indexOf(p.status) >= 0 ? p.status : "draft",
      author: String(p.author || "Imported"), authorId: String(p.authorId || "import"),
      created: +p.created || now, updated: +p.updated || now, reviewBy: String(p.reviewBy || ""),
      res: Array.isArray(p.res) ? p.res.filter(function (r) { return r && r.n; }).map(function (r) { return { n: String(r.n), u: /^https?:\/\//.test(r.u || "") ? r.u : "" }; }) : [],
      views: +p.views || 0, helpful: p.helpful && typeof p.helpful === "object" ? p.helpful : {},
      comments: Array.isArray(p.comments) ? p.comments : [],
      versions: Array.isArray(p.versions) && p.versions.length ? p.versions : [{ n: 1, by: "Import", role: "Admin", at: now, note: "Imported", title: p.title, body: body }]
    };
  }
  function importJSON(text) {
    var data = JSON.parse(text), list = Array.isArray(data) ? data : data.pages, added = 0, skipped = 0;
    if (!Array.isArray(list)) throw new Error("No pages found in this file.");
    list.forEach(function (raw) { var p = clean(raw); if (p) { state.pages[p.id] = p; added++; } else skipped++; });
    if (data.cfg && data.cfg.gaps) state.cfg.gaps = Object.assign(state.cfg.gaps, data.cfg.gaps);
    save();
    return { added: added, skipped: skipped };
  }
  function seed(sample) {
    sample.forEach(function (s, i) {
      var t = Date.now() - (i + 1) * 864e5 * 1.7;
      var p = clean({
        id: C.uid(), title: s.title, space: s.space, tags: s.tags, body: s.body, status: s.status || "published",
        author: s.author, authorId: "seed", created: t, updated: t, reviewBy: s.reviewBy, res: s.res || [],
        views: s.views || 0, comments: (s.comments || []).map(function (c) {
          return { id: C.uid("c"), by: c.by, role: c.role, at: t + 36e5, text: c.text, kind: c.kind || "comment", resolved: !!c.resolved };
        }),
        versions: [{ n: 1, by: s.author, role: s.role || "Lecturer", at: t, note: "Created page", title: s.title, body: s.body }]
      });
      state.pages[p.id] = p;
    });
    save();
  }
  function reset() { state.pages = {}; state.cfg = { gaps: {}, searches: 0 }; save(); }
  root.KMSStore = { state: state, load: load, save: save, all: all, put: put, del: del, exportJSON: exportJSON,
    importJSON: importJSON, seed: seed, reset: reset, isMemoryOnly: function () { return memoryOnly; } };
})(typeof window !== "undefined" ? window : this);
