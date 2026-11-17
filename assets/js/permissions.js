/*! Role-based permissions for the Hub (client-side policy). MIT License. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.KMSPerm = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  var ROLES = ["Student", "Lecturer", "Editor", "Admin"];
  function isEditorial(role) { return role === "Editor" || role === "Admin"; }
  function canCreate(role) { return role !== "Student"; }
  function canPublish(role) { return isEditorial(role); }
  function canDelete(role) { return role === "Admin"; }
  function canAnalytics(role) { return isEditorial(role); }
  function canEdit(role, page, me) {
    if (isEditorial(role)) return true;
    return role === "Lecturer" && page.authorId === me.id && (page.status === "draft" || page.status === "changes");
  }
  function canSee(role, page, me) {
    if (isEditorial(role) || page.status === "published") return true;
    return role === "Lecturer" && page.authorId === me.id;
  }
  var matrix = [
    ["Read published pages", 1, 1, 1, 1],
    ["Search, comment and rate", 1, 1, 1, 1],
    ["Write drafts and submit for review", 0, 1, 1, 1],
    ["Edit own drafts", 0, 1, 1, 1],
    ["Edit any page", 0, 0, 1, 1],
    ["Approve, publish, request changes", 0, 0, 1, 1],
    ["Restore earlier versions", 0, 0, 1, 1],
    ["View analytics and knowledge gaps", 0, 0, 1, 1],
    ["Delete pages, erase data", 0, 0, 0, 1]
  ];
  return { ROLES: ROLES, canCreate: canCreate, canPublish: canPublish, canDelete: canDelete,
    canAnalytics: canAnalytics, canEdit: canEdit, canSee: canSee, matrix: matrix };
});
