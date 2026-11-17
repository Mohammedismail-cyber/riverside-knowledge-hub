# Architecture

## Goals

- Work offline, with no build step, by opening `index.html`.
- Keep business logic pure and testable, separate from the interface.
- Be easy to read, extend, and explain in a class presentation.

## Modules

| File | Responsibility | Depends on |
|---|---|---|
| `core.js` | Markdown to safe HTML, table of contents, reading time, ranked search, review-due logic, tag parsing, KM-cycle statistics | nothing |
| `permissions.js` | Role policy: who can see, create, edit, publish, delete and view analytics | nothing |
| `store.js` | State, localStorage persistence, JSON import and export, sample seeding, input sanitising on import | `core.js` |
| `sample.js` | Sample university content | nothing |
| `app.js` | Rendering of all views, event handling, workflow actions | all of the above |

`core.js` and `permissions.js` use a small UMD wrapper, so they load in the browser as globals (`KMSCore`, `KMSPerm`) and in Node via `require` for tests.

## Data model

A page is a plain JSON object:

```json
{
  "id": "p...",
  "title": "Week 1: Arrays and Lists",
  "space": "Teaching",
  "tags": ["cs101", "lecture"],
  "body": "## Markdown ...",
  "status": "draft | review | changes | published",
  "author": "Lecturer",
  "authorId": "local",
  "created": 0, "updated": 0,
  "reviewBy": "2027-06-01",
  "res": [{ "n": "Slides", "u": "https://..." }],
  "views": 0,
  "helpful": { "userId": 1 },
  "comments": [{ "id": "c...", "by": "", "role": "", "at": 0, "text": "", "kind": "comment | change", "resolved": false }],
  "versions": [{ "n": 1, "by": "", "role": "", "at": 0, "note": "", "title": "", "body": "" }]
}
```

Application state is stored under the key `riverside-kms/v2` as `{ schema, pages, cfg, prefs }`. `cfg` holds search counts and knowledge gaps. `prefs` holds theme, display name and role.

## Workflow state machine

```
 draft ──submit──▶ review ──approve──▶ published
   ▲                  │
   └──── changes ◀────┘  (request changes, with a note)
```

Editors and Admins can publish directly. Lecturers can edit only their own pages while they are `draft` or `changes`.

## Security notes

- All user text is HTML-escaped before rendering. Only `https://` and `http://` links are turned into anchors, so `javascript:` links are never created.
- Imported JSON is validated and sanitised field by field.
- Roles are **client-side and simulated**. They are a policy demonstration, not access control. Real deployments must enforce permissions on a server.

## KM cycle mapping

| Stage | Feature | Code |
|---|---|---|
| Create | Editor, templates | `app.js: editor()` |
| Capture | Tips section, resources | `app.js: SNIP.tips`, `core.parseResources` |
| Refine | Review queue, history | `app.js: reviewView()`, `addVersion()` |
| Store | Spaces, tags, roles | `permissions.js`, `core.tagCounts` |
| Share | Ranked search | `core.search` |
| Apply | Reading view, views | `app.js: pageView()` |
| Feedback | Comments, votes, gaps | `app.js`, `core.stats` |

## Extending to a multi-user system

1. Replace `store.js` with an API client (for example REST over a Node or serverless backend with a database).
2. Add real authentication and enforce `permissions.js` rules on the server.
3. Store attachments in object storage and keep only references in the page record.
4. Add notifications for review requests and change requests.
