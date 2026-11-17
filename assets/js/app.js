/*! Riverside Knowledge Hub: user interface. MIT License. */
(function () {
  "use strict";
  var C = window.KMSCore, S = window.KMSStore, P = window.KMSPerm;
  var SPACES = ["Students", "Teaching", "Research", "Admin", "IT Help"];
  var LABEL = { draft: "Draft", review: "In review", changes: "Changes requested", published: "Published" };
  var TEMPLATES = {
    blank: "",
    course: "## Learning outcomes\n- \n\n## Key concepts\n\n## Examples\n\n## Common mistakes and tips\n- \n\n## Exercises\n1. \n",
    policy: "## Purpose\n\n## Scope\n\n## Policy\n1. \n\n## Responsibilities\n\n## Contacts\n",
    howto: "## Before you start\n\n## Steps\n1. \n2. \n3. \n\n## Troubleshooting\n- \n",
    lesson: "## What happened\n\n## What we learned\n- \n\n## What we will do differently\n- \n"
  };
  var UI = { view: "dash", pid: null, space: null, tag: null, q: "", ed: null, tab: "article", confirm: "", rn: "" };
  var $ = function (s) { return document.querySelector(s); };
  var esc = C.esc;

  function me() { return { id: "local", name: S.state.prefs.name || "You" }; }
  function role() { return S.state.prefs.role; }
  function visible() {
    return S.all().filter(function (p) { return P.canSee(role(), p, me()); })
      .sort(function (a, b) { return (b.updated || 0) - (a.updated || 0); });
  }
  function ago(t) {
    var s = (Date.now() - t) / 1000;
    if (s < 60) return "just now"; if (s < 3600) return Math.floor(s / 60) + " min ago";
    if (s < 86400) return Math.floor(s / 3600) + " h ago";
    return new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }
  function toast(m) {
    var t = $("#toast"); t.textContent = m; t.className = "toast on";
    clearTimeout(toast.h); toast.h = setTimeout(function () { t.className = "toast"; }, 2300);
  }
  function download(name, text) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function chips(p) {
    var h = '<span class="chip ' + p.status + '">' + LABEL[p.status] + "</span>";
    if (C.isDue(p)) h += '<span class="chip due">Review due</span>';
    (p.tags || []).forEach(function (t) { h += '<span class="chip tag">#' + esc(t) + "</span>"; });
    return h;
  }
  function item(p, q) {
    var ts = C.terms(q || "");
    var text = q ? C.highlight(C.snippet(p, q), ts) : esc(C.plain(p.body).slice(0, 130));
    return '<button class="item" data-a="open" data-id="' + p.id + '"><div class="row"><b>' + esc(p.title) +
      '</b><span class="sub meta" style="margin:0">' + esc(p.space) + " · " + ago(p.updated) + "</span></div><p>" + text + "</p>" + chips(p) + "</button>";
  }

  /* ---------- sidebar ---------- */
  function side() {
    var all = S.all(), vis = visible();
    var h = '<div class="brand"><div class="logo"></div>Riverside Hub</div><div class="sec">WORKSPACE</div>';
    [["dash", "Dashboard"], ["review", "Review queue", all.filter(function (p) { return p.status === "review"; }).length],
     ["browse", "All pages", vis.length], ["tags", "Tags"], ["analytics", "Analytics"], ["guide", "How it works"], ["data", "Data and backup"]]
      .forEach(function (n) {
        var on = UI.view === n[0] && !UI.space && !UI.tag;
        h += '<button class="nv' + (on ? " on" : "") + '" data-a="nav" data-v="' + n[0] + '">' + n[1] + (n[2] != null ? "<small>" + n[2] + "</small>" : "") + "</button>";
      });
    h += '<div class="sec">SPACES</div>';
    SPACES.forEach(function (s) {
      var c = vis.filter(function (p) { return p.space === s; }).length;
      h += '<button class="nv' + (UI.view === "browse" && UI.space === s ? " on" : "") + '" data-a="space" data-s="' + s + '">' + s + "<small>" + c + "</small></button>";
    });
    h += '<div class="who"><label for="nm">DISPLAY NAME</label><input id="nm" data-c="name" value="' + esc(S.state.prefs.name) + '" maxlength="40">' +
      '<label for="role">SIGNED IN AS (SIMULATED)</label><select id="role" data-c="role">';
    P.ROLES.forEach(function (r) { h += "<option" + (r === role() ? " selected" : "") + ">" + r + "</option>"; });
    h += "</select><p>" + { Student: "Read, search, comment, rate.", Lecturer: "Write drafts, submit for review.",
      Editor: "Review, publish, restore.", Admin: "Everything, plus delete." }[role()] + "</p></div>";
    return h;
  }

  /* ---------- views ---------- */
  function dash() {
    var all = S.all(), st = C.stats(all, S.state.cfg), cycle = C.kmCycle(st);
    var h = "<h1>Welcome to the Hub</h1><p class=\"sub\">One place for every course, policy and answer at Riverside University. You are viewing as <b>" + role() + "</b>.</p>";
    if (!all.length) {
      h += '<div class="card empty"><h2 class="s" style="margin-top:0">The Hub is empty</h2><p>Load the sample content or write the first page.</p>' +
        '<button class="btn alt" data-a="seed">Load sample content</button>' + (P.canCreate(role()) ? '<button class="btn" data-a="new">Write first page</button>' : "") + "</div>";
    }
    h += '<h2 class="s">The KM cycle, live from your data</h2><div class="grid">';
    cycle.forEach(function (c) {
      h += '<button class="kc" data-a="nav" data-v="' + c.go + '"><span class="n">' + c.n + " · " + c.name.toUpperCase() + "</span><b>" + c.value + "</b><span>" + c.label + "</span></button>";
    });
    h += "</div>";
    var att = [];
    if (P.canPublish(role()) && st.review) att.push(st.review + " page(s) are waiting for your review.");
    visible().forEach(function (p) {
      if (C.isDue(p)) att.push("“" + p.title + "” is past its review date.");
      if (p.status === "changes") att.push("Changes were requested on “" + p.title + "”.");
    });
    if (att.length) { h += '<h2 class="s">Needs attention</h2>'; att.slice(0, 6).forEach(function (a) { h += '<div class="note">' + esc(a) + "</div>"; }); }
    h += '<h2 class="s">Recently updated</h2>';
    var L = visible().slice(0, 5); L.forEach(function (p) { h += item(p); });
    if (!L.length) h += '<p class="sub">Nothing to show yet.</p>';
    return h;
  }
  function browse() {
    var L = visible().filter(function (p) { return (!UI.space || p.space === UI.space) && (!UI.tag || (p.tags || []).indexOf(UI.tag) >= 0); });
    var h = "<h1>" + esc(UI.tag ? "#" + UI.tag : UI.space || "All pages") + '</h1><p class="sub">' + L.length + " page(s) you can see.</p>";
    L.forEach(function (p) { h += item(p); });
    if (!L.length) h += '<div class="card empty">No pages here yet.' + (P.canCreate(role()) ? '<br><br><button class="btn" data-a="new">Write a page</button>' : "") + "</div>";
    return h;
  }
  function tags() {
    var T = C.tagCounts(visible()), h = "<h1>Tags</h1><p class=\"sub\">Browse knowledge by topic.</p><div>";
    T.forEach(function (t) { h += '<button class="chip" data-a="tag" data-t="' + esc(t.tag) + '">#' + esc(t.tag) + " · " + t.count + "</button>"; });
    return h + (T.length ? "" : '<p class="sub">No tags yet.</p>') + "</div>";
  }
  function searchView() {
    var R = C.search(visible(), UI.q);
    var h = "<h1>Search</h1><p class=\"sub\">" + R.length + " result(s) for “" + esc(UI.q) + "”.</p>";
    R.forEach(function (r) { h += item(r.page, UI.q); });
    if (!R.length) h += '<div class="card empty"><h2 class="s" style="margin-top:0">Nothing found</h2><p>This search is recorded as a knowledge gap so editors can fill it.</p>' +
      (P.canCreate(role()) ? '<button class="btn" data-a="new">Write this page</button>' : "") + "</div>";
    return h;
  }
  function pageView() {
    var p = S.state.pages[UI.pid];
    if (!p) return '<p class="empty">Page not found.</p>';
    var canEdit = P.canEdit(role(), p, me()), pub = P.canPublish(role());
    var h = '<button class="btn ghost sm" data-a="back">← Back</button><div class="row"><div><p class="sub meta" style="margin:0">' + esc(p.space) +
      " · v" + p.versions[0].n + " · by " + esc(p.author) + " · updated " + ago(p.updated) + " · " + C.readingTime(p.body) + " min read</p><h1>" + esc(p.title) + "</h1></div><div>";
    if (canEdit) h += '<button class="btn" data-a="edit" data-id="' + p.id + '">Edit</button>';
    if (p.status === "draft" && canEdit && !pub) h += '<button class="btn alt" data-a="submitq" data-id="' + p.id + '">Submit for review</button>';
    h += "</div></div><div>" + chips(p) + "</div>";
    if (p.status === "changes") {
      var last = (p.comments || []).filter(function (c) { return c.kind === "change"; }).pop();
      if (last) h += '<div class="note"><b>Changes requested:</b> ' + esc(last.text) + "</div>";
    }
    if (p.status === "review" && pub) {
      h += '<div class="card" style="margin:14px 0"><b>Review this page</b><label class="f" for="rn">REVIEWER NOTE (REQUIRED TO REQUEST CHANGES)</label>' +
        '<input class="t" id="rn" value="' + esc(UI.rn) + '" placeholder="What should the author fix?"><div style="margin-top:12px">' +
        '<button class="btn alt" data-a="approve">Approve and publish</button><button class="btn bad" data-a="changes">Request changes</button></div></div>';
    }
    var nc = (p.comments || []).length;
    h += '<div class="tabs" role="tablist">';
    [["article", "Article"], ["history", "History (" + p.versions.length + ")"], ["talk", "Discussion (" + nc + ")"]].forEach(function (t) {
      h += '<button class="tab' + (UI.tab === t[0] ? " on" : "") + '" role="tab" data-a="tab" data-t="' + t[0] + '">' + t[1] + "</button>";
    });
    h += "</div>";
    if (UI.tab === "article") {
      var toc = C.toc(p.body).filter(function (x) { return x.level <= 2; });
      if (toc.length > 2) { h += '<div class="toc" aria-label="On this page">'; toc.forEach(function (x) { h += '<button data-a="jump" data-id="' + esc(x.id) + '">' + esc(x.text) + "</button>"; }); h += "</div>"; }
      h += '<div class="card art">' + C.markdown(p.body) + "</div>";
      if (p.res && p.res.length) {
        h += '<h2 class="s">Resources</h2><div>';
        p.res.forEach(function (r) { h += r.u ? '<a class="chip" href="' + esc(r.u) + '" target="_blank" rel="noopener noreferrer">📎 ' + esc(r.n) + "</a>" : '<span class="chip">📎 ' + esc(r.n) + "</span>"; });
        h += "</div>";
      }
      var up = 0, dn = 0, mine = (p.helpful || {})[me().id];
      Object.keys(p.helpful || {}).forEach(function (k) { p.helpful[k] > 0 ? up++ : dn++; });
      h += '<div class="card" style="margin-top:18px"><div class="row"><b>Was this page helpful?</b><div>' +
        '<button class="btn sm ' + (mine === 1 ? "alt" : "ghost") + '" data-a="vote" data-v="1">👍 Yes · ' + up + "</button>" +
        '<button class="btn sm ' + (mine === -1 ? "bad" : "ghost") + '" data-a="vote" data-v="-1">👎 No · ' + dn + "</button></div></div></div>";
      h += '<p class="sub meta" style="margin-top:14px">' + (p.views || 0) + " view(s)" + (p.reviewBy ? " · review by " + esc(p.reviewBy) : "") + "</p>";
    }
    if (UI.tab === "history") {
      h += '<div class="card">';
      p.versions.forEach(function (v, i) {
        h += '<div class="ver"><div><b>v' + v.n + " · " + esc(v.note || "Edited") + "</b><small>" + esc(v.by) + " (" + esc(v.role) + ") · " + ago(v.at) + "</small></div>" +
          (i === 0 ? '<span class="chip">Current</span>' : pub ? '<button class="btn ghost sm" style="margin:0" data-a="restore" data-n="' + v.n + '">Restore</button>' : "") + "</div>";
      });
      h += "</div>";
    }
    if (UI.tab === "talk") {
      h += '<div class="card"><label class="f" for="cmt" style="margin-top:0">ADD A COMMENT</label><textarea class="t plain" id="cmt" placeholder="Ask a question, report an error or suggest an improvement…"></textarea>' +
        '<div style="margin-top:10px"><button class="btn" data-a="comment">Post comment</button></div>';
      (p.comments || []).slice().reverse().forEach(function (c) {
        var staff = c.role !== "Student";
        h += '<div class="cmt"><div class="av' + (staff ? " lime" : "") + '">' + esc((c.by || "?").charAt(0).toUpperCase()) + '</div><div style="flex:1"><b>' + esc(c.by) +
          '</b> <small style="display:inline">' + esc(c.role) + " · " + ago(c.at) + "</small>" + (c.kind === "change" ? ' <span class="chip changes">Change request</span>' : "") +
          (c.resolved ? ' <span class="chip published">Resolved</span>' : "") + "<div>" + esc(c.text) + "</div>" +
          (pub && !c.resolved ? '<button class="btn ghost sm" style="margin:6px 0 0" data-a="resolve" data-id="' + c.id + '">Mark resolved</button>' : "") + "</div></div>";
      });
      if (!nc) h += '<p class="sub" style="margin-top:14px">No comments yet.</p>';
      h += "</div>";
    }
    if (P.canDelete(role())) h += '<div style="margin-top:22px"><button class="btn bad sm" data-a="del" data-id="' + p.id + '">' + (UI.confirm === p.id ? "Click again to delete forever" : "Delete page") + "</button></div>";
    return h;
  }
  function editor() {
    var e = UI.ed;
    var h = '<button class="btn ghost sm" data-a="back">← Cancel</button><h1>' + (e.id ? "Edit page" : "New page") + '</h1><p class="sub">Create, capture and refine knowledge. Markdown is supported.</p>';
    if (!e.id) {
      h += '<label class="f" for="tpl">START FROM A TEMPLATE</label><select class="t" id="tpl" data-c="tpl">';
      [["blank", "Blank page"], ["course", "Course page"], ["policy", "Policy"], ["howto", "How-to guide"], ["lesson", "Lesson learned"]].forEach(function (t) { h += '<option value="' + t[0] + '">' + t[1] + "</option>"; });
      h += "</select>";
    }
    h += '<label class="f" for="ti">TITLE</label><input class="t" id="ti" data-f="title" value="' + esc(e.title) + '" placeholder="For example: Week 4: Stacks and Queues">';
    h += '<div class="two"><div><label class="f" for="sp">SPACE</label><select class="t" id="sp" data-f="space">';
    SPACES.forEach(function (s) { h += "<option" + (s === e.space ? " selected" : "") + ">" + s + "</option>"; });
    h += '</select></div><div><label class="f" for="rb">REVIEW BY (OPTIONAL)</label><input class="t" id="rb" type="date" data-f="reviewBy" value="' + esc(e.reviewBy) + '"></div></div>';
    h += '<label class="f" for="tg">TAGS (COMMA SEPARATED)</label><input class="t" id="tg" data-f="tags" value="' + esc(e.tags) + '" placeholder="cs101, lecture, week-4">';
    h += '<label class="f" for="body">CONTENT</label><div class="tb">';
    [["h", "Heading"], ["b", "Bold"], ["li", "List"], ["code", "Code"], ["q", "Quote"], ["tips", "+ Tips from experience"]].forEach(function (t) {
      h += '<button type="button" class="btn ghost sm" data-a="ins" data-s="' + t[0] + '">' + t[1] + "</button>";
    });
    h += '</div><div class="two"><textarea class="t" id="body" data-f="body" placeholder="Write the lesson, policy or guide…">' + esc(e.body) +
      '</textarea><div class="prev art" id="pv" aria-label="Preview">' + C.markdown(e.body) + "</div></div>";
    h += '<label class="f" for="rs">RESOURCES (ONE PER LINE: NAME | HTTPS LINK)</label><textarea class="t plain" id="rs" data-f="res" placeholder="Lecture slides | https://example.com/slides.pdf">' + esc(e.res) + "</textarea>";
    h += '<label class="f" for="nt">WHAT DID YOU CHANGE? (SAVED IN HISTORY)</label><input class="t" id="nt" data-f="note" value="' + esc(e.note) + '" placeholder="For example: Added examples">';
    h += '<div style="margin-top:22px"><button class="btn ghost" data-a="save" data-k="draft">Save</button>' +
      (P.canPublish(role()) ? '<button class="btn alt" data-a="save" data-k="publish">Save and publish</button>' : '<button class="btn alt" data-a="save" data-k="submit">Submit for review</button>') + "</div>";
    return h;
  }
  function reviewView() {
    var L = S.all().filter(function (p) { return p.status === "review" || (p.status === "changes" && P.canSee(role(), p, me())); });
    var h = "<h1>Review queue</h1><p class=\"sub\">Knowledge is checked before it is published." + (P.canPublish(role()) ? "" : " Editors and admins approve pages.") + "</p>";
    L.forEach(function (p) { h += item(p); });
    return h + (L.length ? "" : '<div class="card empty">Nothing waiting for review.</div>');
  }
  function analytics() {
    var h = "<h1>Analytics</h1><p class=\"sub\">How the knowledge is used, and where it is missing.</p>";
    if (!P.canAnalytics(role())) return h + '<div class="card empty">Analytics are available to Editors and Admins. Change the role at the bottom of the sidebar.</div>';
    var all = S.all(), st = C.stats(all, S.state.cfg), cfg = S.state.cfg;
    var top = all.filter(function (p) { return p.status === "published"; }).sort(function (a, b) { return (b.views || 0) - (a.views || 0); }).slice(0, 6);
    var mx = Math.max(1, top.length ? top[0].views || 1 : 1);
    function kc(n, v, l) { return '<div class="kc static"><span class="n">' + n + "</span><b>" + v + "</b><span>" + l + "</span></div>"; }
    h += '<div class="grid">' + kc("PAGES", st.total, st.published + " published") + kc("VIEWS", st.views, "total page views") + kc("SEARCHES", st.searches, "recorded") +
      kc("HELPFUL", st.up + st.down ? Math.round(st.up / (st.up + st.down) * 100) + "%" : "–", st.up + " yes · " + st.down + " no") + "</div>";
    h += '<h2 class="s">Most viewed pages</h2><div class="card">';
    top.forEach(function (p) { h += '<div class="bl"><span>' + esc(p.title) + '</span><div class="bar"><i style="width:' + Math.round((p.views || 0) / mx * 100) + '%"></i></div><b>' + (p.views || 0) + "</b></div>"; });
    if (!top.length) h += '<p class="sub">No views yet.</p>';
    h += "</div>";
    var g = Object.keys(cfg.gaps || {}).sort(function (a, b) { return cfg.gaps[b] - cfg.gaps[a]; }).slice(0, 8);
    h += '<h2 class="s">Knowledge gaps (searches with no result)</h2><div class="card">';
    g.forEach(function (k) {
      h += '<div class="row" style="padding:8px 0;border-bottom:1px solid var(--line)"><span>“' + esc(k) + "” · " + cfg.gaps[k] + '×</span><span><button class="btn alt sm" style="margin:0 6px 0 0" data-a="fill" data-t="' + esc(k) +
        '">Write page</button><button class="btn ghost sm" style="margin:0" data-a="dismiss" data-t="' + esc(k) + '">Dismiss</button></span></div>';
    });
    if (!g.length) h += '<p class="sub">No gaps recorded. Search for something that does not exist to see one appear.</p>';
    h += "</div>";
    var bad = all.filter(function (p) { return Object.keys(p.helpful || {}).some(function (k) { return p.helpful[k] < 0; }); });
    h += '<h2 class="s">Pages rated not helpful</h2>'; bad.forEach(function (p) { h += item(p); });
    if (!bad.length) h += '<p class="sub">None yet.</p>';
    return h;
  }
  function guide() {
    var h = '<h1>How the Hub works</h1><p class="sub">The Hub supports every stage of the knowledge management cycle.</p><div class="card"><table class="m"><tr><th>STAGE</th><th>WHAT HAPPENS</th><th>WHERE IN THE HUB</th></tr>';
    [["1 Create", "New knowledge is written", "New page, templates"], ["2 Capture", "Explicit and tacit knowledge is recorded", "Resources, “Tips from experience”"],
     ["3 Refine", "Content is reviewed and improved", "Review queue, version history"], ["4 Store", "Knowledge is organised and protected", "Spaces, tags, roles"],
     ["5 Share", "People find what they need", "Search, tags, share links"], ["6 Apply", "Knowledge is used", "Reading pages, view counts"],
     ["7 Feedback", "The system improves", "Comments, ratings, knowledge gaps"]].forEach(function (r) { h += "<tr><td><b>" + r[0] + "</b></td><td>" + r[1] + "</td><td>" + r[2] + "</td></tr>"; });
    h += '</table></div><h2 class="s">Roles</h2><div class="card" style="overflow-x:auto"><table class="m"><tr><th>CAPABILITY</th>';
    P.ROLES.forEach(function (r) { h += '<th class="c">' + r.toUpperCase() + "</th>"; });
    h += "</tr>"; P.matrix.forEach(function (r) { h += "<tr><td>" + r[0] + "</td>"; for (var i = 1; i < 5; i++) h += '<td class="c">' + (r[i] ? "✓" : "–") + "</td>"; h += "</tr>"; });
    h += '</table></div><p class="note">Roles are simulated in this prototype so the workflow can be demonstrated on one device. A production system would use real sign-in (for example, single sign-on).</p>';
    h += '<h2 class="s">Keyboard shortcuts</h2><div class="card"><p><kbd>/</kbd> focus search &nbsp; <kbd>N</kbd> new page &nbsp; <kbd>Esc</kbd> leave a field</p></div>';
    return h;
  }
  function dataView() {
    var h = "<h1>Data and backup</h1><p class=\"sub\">Everything is saved in this browser. Export a backup, move it to another device, or start fresh.</p>";
    if (S.isMemoryOnly()) h += '<div class="note">Browser storage is unavailable, so changes will be lost when you close this tab. Export a backup before leaving.</div>';
    h += '<div class="card"><button class="btn" data-a="export">Export backup (JSON)</button>';
    if (P.canPublish(role())) h += '<button class="btn alt" data-a="import">Import backup</button>';
    h += '<button class="btn ghost" data-a="seed">Load sample content</button>';
    if (P.canDelete(role())) h += '<button class="btn bad" data-a="reset">' + (UI.confirm === "reset" ? "Click again to erase everything" : "Erase all data") + "</button>";
    return h + "</div>";
  }

  /* ---------- render ---------- */
  function renderSide() { $("#side").innerHTML = side(); }
  function renderView() {
    var v = UI.view, m = { dash: dash, browse: browse, tags: tags, search: searchView, page: pageView, edit: editor, review: reviewView, analytics: analytics, guide: guide, data: dataView };
    $("#view").innerHTML = (m[v] || dash)();
    $("#newb").style.display = P.canCreate(role()) ? "" : "none";
  }
  function render() { renderSide(); renderView(); }
  function go(v, o) {
    UI.view = v; UI.confirm = "";
    if (v !== "browse") { UI.space = null; UI.tag = null; }
    if (o) Object.keys(o).forEach(function (k) { UI[k] = o[k]; });
    render(); window.scrollTo(0, 0);
  }

  /* ---------- actions ---------- */
  function blankEd(p) {
    UI.ed = p ? { id: p.id, title: p.title, space: p.space, tags: (p.tags || []).join(", "), reviewBy: p.reviewBy || "", body: p.body,
      res: (p.res || []).map(function (r) { return r.n + (r.u ? " | " + r.u : ""); }).join("\n"), note: "" }
      : { id: null, title: "", space: UI.space || "Teaching", tags: "", reviewBy: "", body: TEMPLATES.course, res: "", note: "" };
  }
  function addVersion(p, note) {
    var n = (p.versions[0] ? p.versions[0].n : 0) + 1;
    p.versions.unshift({ n: n, by: me().name, role: role(), at: Date.now(), note: note, title: p.title, body: p.body });
    p.versions = p.versions.slice(0, 30);
  }
  function copyPage(id) { return JSON.parse(JSON.stringify(S.state.pages[id])); }
  function save(kind) {
    var e = UI.ed;
    if (!e.title.trim()) { toast("Add a title first"); return; }
    var p = e.id ? copyPage(e.id) : { id: C.uid(), authorId: me().id, author: me().name, created: Date.now(), status: "draft", views: 0, versions: [], comments: [], helpful: {} };
    p.title = e.title.trim(); p.space = e.space; p.tags = C.parseTags(e.tags); p.reviewBy = e.reviewBy; p.body = e.body; p.res = C.parseResources(e.res);
    if (kind === "publish" && P.canPublish(role())) p.status = "published";
    else if (kind === "submit") p.status = P.canPublish(role()) ? "published" : "review";
    addVersion(p, e.note || (e.id ? "Edited page" : "Created page"));
    p.updated = Date.now(); S.put(p);
    toast(kind === "submit" ? "Submitted for review" : kind === "publish" ? "Published" : "Saved");
    go("page", { pid: p.id, tab: "article" });
  }
  var SNIP = { h: "\n## Heading\n", b: "**bold**", li: "\n- ", code: "\n```\ncode\n```\n", q: "\n> Tip: ", tips: "\n\n## Common mistakes and tips\n- " };
  function act(a, d) {
    var p, x;
    switch (a) {
      case "nav": go(d.v); break;
      case "space": go("browse", { space: d.s, tag: null }); break;
      case "tag": go("browse", { tag: d.t, space: null }); break;
      case "open":
        p = S.state.pages[d.id];
        if (p && p.status === "published") { p.views = (p.views || 0) + 1; S.save(); }
        go("page", { pid: d.id, tab: "article", rn: "" }); break;
      case "back": go(UI.tag || UI.space ? "browse" : "dash"); break;
      case "new": blankEd(null); go("edit"); break;
      case "edit": blankEd(S.state.pages[d.id]); go("edit"); break;
      case "fill": blankEd(null); UI.ed.title = d.t.charAt(0).toUpperCase() + d.t.slice(1); UI.ed.tags = d.t; go("edit"); break;
      case "dismiss": delete S.state.cfg.gaps[d.t]; S.save(); render(); break;
      case "save": save(d.k); break;
      case "ins":
        x = $("#body"); var i = x.selectionStart;
        x.value = x.value.slice(0, i) + SNIP[d.s] + x.value.slice(x.selectionEnd);
        UI.ed.body = x.value; $("#pv").innerHTML = C.markdown(x.value); x.focus(); break;
      case "submitq": p = copyPage(d.id); p.status = "review"; addVersion(p, "Submitted for review"); p.updated = Date.now(); S.put(p); toast("Submitted for review"); render(); break;
      case "approve": p = copyPage(UI.pid); p.status = "published"; addVersion(p, "Approved and published"); p.updated = Date.now(); S.put(p); toast("Page published"); render(); break;
      case "changes":
        x = ($("#rn").value || "").trim();
        if (!x) { toast("Write what should change"); return; }
        p = copyPage(UI.pid); p.status = "changes";
        p.comments.push({ id: C.uid("c"), by: me().name, role: role(), at: Date.now(), text: x, kind: "change", resolved: false });
        p.updated = Date.now(); S.put(p); UI.rn = ""; toast("Changes requested"); render(); break;
      case "restore":
        p = copyPage(UI.pid);
        x = p.versions.filter(function (v) { return String(v.n) === d.n; })[0];
        if (x) { p.title = x.title; p.body = x.body; addVersion(p, "Restored v" + x.n); p.updated = Date.now(); S.put(p); toast("Version restored"); go("page", { tab: "article" }); }
        break;
      case "tab": UI.tab = d.t; renderView(); break;
      case "jump": x = document.getElementById(d.id); if (x) x.scrollIntoView({ behavior: "smooth", block: "start" }); break;
      case "vote":
        p = copyPage(UI.pid); p.helpful = p.helpful || {}; x = +d.v;
        if (p.helpful[me().id] === x) delete p.helpful[me().id]; else p.helpful[me().id] = x;
        S.put(p); renderView(); break;
      case "comment":
        x = ($("#cmt").value || "").trim();
        if (!x) { toast("Write a comment first"); return; }
        p = copyPage(UI.pid); p.comments = p.comments || [];
        p.comments.push({ id: C.uid("c"), by: me().name, role: role(), at: Date.now(), text: x, kind: "comment", resolved: false });
        S.put(p); toast("Comment posted"); renderView(); break;
      case "resolve": p = copyPage(UI.pid); p.comments.forEach(function (c) { if (c.id === d.id) c.resolved = true; }); S.put(p); renderView(); break;
      case "del":
        if (UI.confirm === d.id) { S.del(d.id); UI.confirm = ""; toast("Page deleted"); go("dash"); } else { UI.confirm = d.id; renderView(); }
        break;
      case "seed": S.seed(window.KMS_SAMPLE); toast("Sample content loaded"); render(); break;
      case "reset":
        if (UI.confirm === "reset") { S.reset(); UI.confirm = ""; toast("All data erased"); go("dash"); } else { UI.confirm = "reset"; renderView(); }
        break;
      case "export": download("riverside-hub-backup.json", S.exportJSON()); break;
      case "import": $("#imp").click(); break;
      case "theme":
        var cur = S.state.prefs.theme, next = cur === "" ? "dark" : cur === "dark" ? "light" : "";
        S.state.prefs.theme = next; S.save(); applyTheme(); toast("Theme: " + (next || "automatic")); break;
    }
  }
  function applyTheme() {
    var t = S.state.prefs.theme;
    if (t) document.documentElement.setAttribute("data-theme", t); else document.documentElement.removeAttribute("data-theme");
  }

  /* ---------- events ---------- */
  document.addEventListener("click", function (e) { var t = e.target.closest("[data-a]"); if (t) act(t.dataset.a, t.dataset); });
  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t.id === "rn") { UI.rn = t.value; return; }
    if (t.dataset && t.dataset.f && UI.ed) { UI.ed[t.dataset.f] = t.value; if (t.dataset.f === "body") $("#pv").innerHTML = C.markdown(t.value); }
  });
  document.addEventListener("change", function (e) {
    var t = e.target, c = t.dataset && t.dataset.c;
    if (c === "role") { S.state.prefs.role = t.value; S.save(); if (UI.view === "edit") UI.view = "dash"; render(); }
    else if (c === "name") { S.state.prefs.name = t.value.trim() || "You"; S.save(); toast("Display name saved"); }
    else if (c === "tpl" && UI.ed) { UI.ed.body = TEMPLATES[t.value]; $("#body").value = UI.ed.body; $("#pv").innerHTML = C.markdown(UI.ed.body); }
    else if (t.dataset && t.dataset.f && UI.ed) UI.ed[t.dataset.f] = t.value;
    else if (t.id === "imp" && t.files[0]) {
      var r = new FileReader();
      r.onload = function () {
        try { var res = S.importJSON(String(r.result)); toast("Imported " + res.added + " page(s)" + (res.skipped ? ", skipped " + res.skipped : "")); render(); }
        catch (err) { toast("Import failed: " + err.message); }
        t.value = "";
      };
      r.readAsText(t.files[0]);
    }
  });
  var qt;
  $("#q").addEventListener("input", function (e) {
    var v = e.target.value; UI.q = v;
    if (v.trim()) { UI.space = null; UI.tag = null; UI.view = "search"; renderSide(); renderView(); }
    else if (UI.view === "search") go("dash");
    clearTimeout(qt);
    qt = setTimeout(function () {
      var s = UI.q.trim().toLowerCase();
      if (s.length < 3) return;
      S.state.cfg.searches = (S.state.cfg.searches || 0) + 1;
      if (!C.search(visible(), s).length) S.state.cfg.gaps[s] = (S.state.cfg.gaps[s] || 0) + 1;
      S.save();
    }, 1200);
  });
  document.addEventListener("keydown", function (e) {
    var el = document.activeElement, typing = el && /INPUT|TEXTAREA|SELECT/.test(el.tagName);
    if (e.key === "Escape" && typing) { el.blur(); return; }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "/") { e.preventDefault(); $("#q").focus(); }
    else if ((e.key === "n" || e.key === "N") && P.canCreate(role())) { e.preventDefault(); act("new", {}); }
  });

  /* ---------- start ---------- */
  S.load(); applyTheme(); render();
})();
