# Presenter Guide and Demo Script

Total time: about 10 minutes (5 minutes of slides, 4 minutes of live demo, 1 minute of questions). Slides are in `docs/slides.md` (Marp format).

## Before you start

- Open `index.html` in a browser and click **Load sample content**. Keep the tab ready.
- Open the Hub in a second window as a backup, and keep the README screenshots to hand in case something fails.
- Decide who presents the slides and who drives the demo.

## Slide by slide

| # | Slide | What to say | Time |
|---|---|---|---|
| 1 | Title | Introduce the group, the KMS (Wiki.js), the domain (education). | 30 s |
| 2 | What is Wiki.js | Modern wiki engine on Node.js. Open source, flexible editing, Git-backed. It is the *technology* part of a KMS. | 45 s |
| 3 | The problem | Notes in chats, policies in PDFs, answers in inboxes. Link to *brain drain* and *silos* from the lecture. | 45 s |
| 4 | The Hub structure | Five spaces and four roles. Structure plus permissions is *governance*. | 45 s |
| 5 | The KM cycle | Seven stages, with the loop back to the start. | 45 s |
| 6 | Live demo | See the script below. | 4 min |
| 7 | Strengths and limits | Be honest about both. This earns marks. | 45 s |
| 8 | Conclusion | One sentence: *one living hub for every course, policy and answer.* | 30 s |

## Demo script (4 minutes)

1. **Dashboard.** "The seven cards are the KM cycle, counted live from the data."
2. **Stage 1 and 2, create and capture.** Press **+ New page**, choose *Course page*, type a title. Click **+ Tips from experience**. "Slides are explicit knowledge. This section is tacit knowledge, the lecturer's experience written down." Press **Submit for review**.
3. **Stage 3, refine.** Switch role to **Editor**. Open the page, write a note and **Request changes**. Switch back to **Lecturer**, edit, resubmit. As **Editor**, **Approve and publish**. Open the **History** tab. "Every change is kept and can be restored."
4. **Stage 4, store.** Show the spaces, tags and a *Review due* flag. Open **How it works** and show the roles table.
5. **Stage 5 and 6, share and apply.** Switch to **Student**. Search "wifi", open a page, show the contents links and reading time.
6. **Stage 7, feedback.** Rate a page, post a comment. Search for something that does not exist (for example "timetable"). Switch to **Editor**, open **Analytics**, show the knowledge gap, press **Write page**. "The failed search becomes a new page. That is the cycle restarting."
7. **Close.** Show **Data and backup** and export the JSON.

## Likely questions

| Question | Answer |
|---|---|
| Why Wiki.js and not Confluence or SharePoint? | Free, open source, the university controls its data, and simple to deploy for a department. Commercial tools add formal workflows and support but cost more. |
| Is the prototype the real Wiki.js? | No. Wiki.js is the studied KMS and a Docker setup is included. The Hub is our own lightweight prototype that demonstrates the same KM cycle. |
| How is tacit knowledge captured? | Interviews or shadowing with senior staff, written into *Tips from experience* sections. Comments reveal more. |
| How do you stop outdated pages? | Review-by dates with *Review due* flags, an owner per space, version history and feedback. |
| Are the roles secure? | In the prototype they are simulated for demonstration. A real system enforces roles on a server with single sign-on. |
| Where is data stored? | In the browser (`localStorage`). Export and import JSON to move it. |
| What would you improve? | Shared storage with a real backend, real authentication, file uploads, notifications and AI-assisted search. |

## If something goes wrong

- **Blank dashboard:** click **Load sample content**.
- **Lost data:** *Data and backup > Import* a previous export.
- **Projector too small:** zoom the browser (Ctrl or Cmd and `+`). The layout adapts.
