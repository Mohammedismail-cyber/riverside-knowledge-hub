const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../assets/js/core.js");
const P = require("../assets/js/permissions.js");

test("markdown escapes HTML", () => {
  const html = C.markdown("<script>alert(1)</script>");
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
});
test("markdown renders headings with ids, lists and links", () => {
  const html = C.markdown("# Title\n- a\n- b\n[x](https://example.com)");
  assert.match(html, /<h2 id="title">Title<\/h2>/);
  assert.match(html, /<ul><li>a<\/li><li>b<\/li><\/ul>/);
  assert.match(html, /href="https:\/\/example\.com"/);
});
test("markdown blocks javascript: links", () => {
  assert.ok(!C.markdown("[x](javascript:alert(1))").includes("href"));
});
test("toc lists headings", () => {
  const t = C.toc("# A\ntext\n## B c");
  assert.deepEqual(t.map(x => x.id), ["a", "b-c"]);
});
test("search ranks title above body", () => {
  const pages = [
    { id: 1, title: "Library", body: "wifi", tags: [], space: "Students" },
    { id: 2, title: "Wi-Fi Setup", body: "connect", tags: ["wifi"], space: "IT Help" }
  ];
  const r = C.search(pages, "wifi");
  assert.equal(r[0].page.id, 2);
  assert.equal(C.search(pages, "zzz").length, 0);
});
test("reading time is at least one minute", () => assert.equal(C.readingTime("short"), 1));
test("review due only for published pages past the date", () => {
  assert.equal(C.isDue({ status: "published", reviewBy: "2020-01-01" }, "2026-01-01"), true);
  assert.equal(C.isDue({ status: "draft", reviewBy: "2020-01-01" }, "2026-01-01"), false);
  assert.equal(C.isDue({ status: "published", reviewBy: "" }, "2026-01-01"), false);
});
test("parseTags lowercases and removes duplicates", () => {
  assert.deepEqual(C.parseTags("CS101, lecture, cs101,,"), ["cs101", "lecture"]);
});
test("parseResources keeps only https links", () => {
  const r = C.parseResources("Slides | https://a.com/x\nBad | javascript:alert(1)\n");
  assert.equal(r[0].u, "https://a.com/x");
  assert.equal(r[1].u, "");
});
test("kmCycle returns seven stages", () => {
  const st = C.stats([{ status: "published", views: 3, comments: [], helpful: { a: 1 }, body: "tips" }], { gaps: { x: 1 }, searches: 2 });
  const cycle = C.kmCycle(st);
  assert.equal(cycle.length, 7);
  assert.equal(cycle[3].value, 1);
  assert.equal(cycle[5].value, 3);
  assert.equal(cycle[6].value, 2);
});
test("permissions follow the role policy", () => {
  const me = { id: "u1" };
  const draft = { status: "draft", authorId: "u1" };
  const pub = { status: "published", authorId: "other" };
  assert.equal(P.canCreate("Student"), false);
  assert.equal(P.canEdit("Lecturer", draft, me), true);
  assert.equal(P.canEdit("Lecturer", pub, me), false);
  assert.equal(P.canEdit("Editor", pub, me), true);
  assert.equal(P.canSee("Student", draft, me), false);
  assert.equal(P.canSee("Student", pub, me), true);
  assert.equal(P.canDelete("Editor"), false);
  assert.equal(P.canDelete("Admin"), true);
});
