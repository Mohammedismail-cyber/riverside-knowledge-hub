# Knowledge Management Systems: Creative Assignment Report

**Course topic:** Topic 2, Knowledge Management Systems
**Group members:** [Name 1] and [Name 2]
**Studied KMS:** Wiki.js (open source) | **Domain:** Education | **Prototype:** Riverside Knowledge Hub

## 1. Introduction

Universities produce large amounts of knowledge: lecture notes, course outlines, policies, research guides and the experience of staff. Too often it sits in chat groups, inboxes and personal files, so students cannot find it and staff take it with them when they leave.

This project studies **Wiki.js**, an open-source wiki platform, and shows how it can support a **Campus Knowledge Hub** for a fictional institution, *Riverside University*. To demonstrate the ideas in a working system, we also built the **Riverside Hub**, a lightweight prototype included in this repository that follows the full KM cycle.

## 2. The chosen KMS: Wiki.js

Wiki.js is a modern wiki engine written in JavaScript and run on Node.js. It is free, open source (AGPL-3.0) and self-hosted, so the institution keeps its data. A ready-to-run deployment is provided in `deploy/wikijs/`.

### 2.1 Core features

| Feature | Meaning | KMS component |
|---|---|---|
| Multiple editors | Markdown, visual and code editors | Technology |
| Git storage sync | Pages can be backed up and versioned in Git | Technology, processes |
| Search | Built-in search, with external engines such as Elasticsearch as options | Technology |
| Authentication | LDAP, SAML, Google, Microsoft and more | Integrations |
| Multi-language | Interface and page locales | Multilingual support |
| Page history | Every change is stored and can be restored | Processes |
| Groups and page rules | Control who can read or edit which pages | Governance |
| Tags and page tree | Organisation and discovery | Content |
| Comments | Discussion on pages | People, feedback |

> Verify this list against the official documentation (docs.requarks.io) before presenting.

### 2.2 Suitable applications

University and school knowledge hubs, company wikis and handbooks, technical documentation, team knowledge bases and help centres. It is less suitable where formal approval workflows, deep analytics, built-in AI assistants or confidential personal records are required.

### 2.3 Fit with the KMS framework from the lecture

| Component | In Wiki.js |
|---|---|
| People | Students, lecturers, department editors and admins in permission groups |
| Processes | Page creation, review, page history, scheduled checks |
| Technology | Editors, search, Git sync, authentication, comments |
| Content | Course pages, policies, guides, attachments |
| Strategy and governance | Groups, page rules, ownership of spaces |

## 3. Domain: Education

### 3.1 Problems before the Hub

1. Students cannot find course material.
2. Lecturers leave and their know-how goes with them (tacit knowledge, "brain drain").
3. Departments work in silos and repeat each other's work.
4. New students and staff get lost.

### 3.2 The solution

One hub with five spaces: **Students**, **Teaching**, **Research**, **Admin** and **IT Help**, and four groups: **Students** (read and comment), **Lecturers** (write drafts), **Editors** (review and publish) and **Admins** (manage).

## 4. The prototype: Riverside Knowledge Hub

The prototype is a browser application (no server) that implements the same ideas as a working system. See `docs/ARCHITECTURE.md` and the screenshots in the README.

## 5. The KM cycle in the Hub

Demonstration case: the CS101 page *Week 1: Arrays and Lists*.

| Stage | What happens | In the Hub |
|---|---|---|
| 1 Creation | The lecturer writes new knowledge | Editor, templates, live preview |
| 2 Capture | Explicit knowledge is stored and tacit knowledge is written down | Resources and a *Tips from experience* section |
| 3 Refinement | Content is checked and improved | Review queue, change requests, version history |
| 4 Storage | Knowledge is organised and protected | Spaces, tags, review-by dates, role permissions |
| 5 Sharing | People find what they need | Ranked search, tags, table of contents |
| 6 Application | Knowledge is used | Reading view, view counts |
| 7 Feedback | The system improves | Comments, helpful votes, knowledge gaps, analytics |

Feedback returns to Stage 1: a failed search becomes a *knowledge gap*, and an editor turns it into a new page, so the cycle restarts.

## 6. Benefits, limitations and recommendations

**Benefits:** one searchable source of truth, preserved know-how, faster onboarding, safer and more consistent practice, no licence cost.

**Limitations of Wiki.js:** needs a technical administrator, Node.js and a database; no formal approval workflow; analytics rely on external tools; not for confidential records.

**Limitations of the prototype:** simulated roles, single-browser storage, no file uploads, no multi-user sync.

**Recommendations:** appoint a Knowledge Manager and one editor per department, add a review date to important pages, recognise contributors, and link the Hub from the learning platform.

## 7. Conclusion

Wiki.js is a modern, open-source KMS that suits an education setting. Following the full KM cycle from creation to feedback keeps a university's knowledge organised, shared and continuously improving. The Riverside Hub makes those ideas concrete in a working application.

## Glossary

| Term | Meaning |
|---|---|
| KMS | Technology, people, processes and content used to manage knowledge |
| Explicit knowledge | Written down knowledge such as slides and policies |
| Tacit knowledge | Experience-based know-how in people's minds |
| Governance | Rules for who owns, edits and approves content |
| Knowledge gap | Something people look for that the system does not contain |

## References

- Wiki.js documentation: docs.requarks.io
- Course notes, Topic 2: Knowledge Management Systems
