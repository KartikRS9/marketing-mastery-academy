# 📋 Marketing Mastery Academy — Future Tickets / Product Backlog

> **GitHub Repo:** [KartikRS9/marketing-mastery-academy](https://github.com/KartikRS9/marketing-mastery-academy)
> **Last Updated:** 2026-08-04
> **Current State:** Chapters 1, 2, 7 fully populated · Ch3 DOCX extracted · 8 figures integrated · PWA · 4 themes · 5 personas · Download Notes

---

## 🗂️ Backlog Summary

| Epic | Label | Tickets | Open P0/P1 |
|------|-------|---------|-----------|
| Content Population | `CONTENT` | 6 | 4 |
| Visuals & Figures | `VISUALS` | 5 | 2 |
| AI & Interactive | `AI` | 5 | 1 |
| Mobile / PWA | `MOBILE` | 4 | 1 |
| Export & Study Tools | `EXPORT` | 4 | 1 |
| Backend & Sync | `BACKEND` | 4 | 0 |
| Search | `SEARCH` | 3 | 1 |
| Gamification | `GAMIFY` | 4 | 0 |
| Accessibility | `A11Y` | 4 | 2 |
| Performance | `PERF` | 4 | 1 |
| **Total** | | **47** | **13** |

---

## Priority Legend

| Priority | Meaning |
|----------|---------|
| **P0** | Critical / Blocking — must ship next sprint |
| **P1** | High — core user value, ship this quarter |
| **P2** | Medium — valuable improvement, plan next quarter |
| **P3** | Low — nice-to-have / future consideration |

## Effort Legend

| Size | Story Points | Rough Time |
|------|-------------|-----------|
| **S** | 1–2 | < 1 day |
| **M** | 3–5 | 1–3 days |
| **L** | 8–13 | 1–2 weeks |
| **XL** | 21+ | 2–4 weeks |

---

## Epic 1 — CONTENT: Populate All 20 Chapters with Real Kotler Data

> **Goal:** Replace all dynamic stub generators with authentic Kotler & Keller content so learners get accurate, exam-ready material across the full textbook.

| Ticket ID | Title | Description | Acceptance Criteria | Priority | Effort |
|-----------|-------|-------------|---------------------|----------|--------|
| **CONTENT-01** | Extract & ingest Chapter 3 DOCX into live lesson data | The Ch3.docx file is available on disk. Parse its structured content (lessons, key concepts, frameworks, examples) and replace the stub generator for Chapter 3 with real lesson objects matching the Ch1/Ch2 data shape. | • Ch3 lessons rendered with real titles, concepts, and body text · No stub placeholder text visible · Lesson count matches DOCX structure · Figures referenced where applicable | **P0** | **M** |
| **CONTENT-02** | Source and extract Chapters 4–6 content from textbook | Kotler Ch4 (Managing Marketing Information), Ch5 (Consumer Markets), Ch6 (Business Markets) are high-priority chapters for MBA use. Extract key frameworks (5-step research process, Buyer Decision Model, B2B factors) and populate lesson arrays. | • Three chapters fully populated with real section titles and body · All key Kotler frameworks represented · Stub generator disabled for Ch4–6 · Chapter progress bar reflects real lesson count | **P0** | **L** |
| **CONTENT-03** | Populate Chapters 8–11 (Products, Brands, Pricing, Channels) | Core marketing-mix chapters (8 Product Levels, 9 Brand Equity, 10 Pricing Strategies, 11 Channel Management) are essential for completeness. | • 4 chapters populated · Each chapter has ≥ 8 lessons · Kotler definitions used verbatim where possible · No lorem ipsum or stub text | **P0** | **XL** |
| **CONTENT-04** | Populate Chapters 12–15 (Retailing, IMC, Advertising, Digital) | Chapters covering retailing, integrated marketing communications, advertising decisions, and digital/social media marketing. | • 4 chapters populated · IMC framework fully represented in Ch13 · Digital marketing section includes social media, SEO, SEM concepts · Lessons structured identically to Ch1/Ch2 | **P1** | **XL** |
| **CONTENT-05** | Populate Chapters 16–20 (Sales Force, Direct, Global, Sustainability) | Final chapters covering personal selling, direct & online marketing, global marketing, and socially responsible marketing. | • 5 chapters populated · Global marketing entry modes covered (exporting, JV, FDI) · Sustainable marketing principles present · Backlog stub generator fully retired | **P1** | **XL** |
| **CONTENT-06** | Add "Did You Know?" callout facts per lesson | Each lesson should include 1–2 Kotler-cited statistics or real-world brand examples (e.g., "Nike spends 10% of revenue on marketing") displayed as a highlighted callout card. | • Every lesson has ≥ 1 callout fact · Facts are sourced from the textbook or credible marketing research · Callout styled distinctly from body text · Facts visible in Download Notes export | **P2** | **M** |

---

## Epic 2 — VISUALS: Extract and Integrate All 49 Textbook Figures

> **Goal:** Every Kotler figure and exhibit in the textbook (49 total) should be correctly mapped to its lesson and rendered with a caption, alt text, and zoom interaction.

| Ticket ID | Title | Description | Acceptance Criteria | Priority | Effort |
|-----------|-------|-------------|---------------------|----------|--------|
| **VISUALS-01** | Audit all 49 figures and create a figure-to-lesson mapping manifest | Create a JSON manifest (`figures-manifest.json`) listing each figure number, textbook chapter, associated lesson slug, filename, and caption text. This is the source of truth for all figure integration work. | • JSON manifest created with 49 entries · Each entry has: `figureId`, `chapter`, `lessonSlug`, `filename`, `caption`, `altText` · Manifest committed to repo · Figures without images flagged with `status: "pending"` | **P0** | **S** |
| **VISUALS-02** | Extract and clean remaining 41 figure images from textbook PDF | 8 figures are already integrated. The remaining 41 need to be extracted from the textbook PDF, cropped cleanly, exported as optimized WebP/PNG at ≥ 1200px width, and added to `/assets/figures/`. | • 41 images extracted and added to repo · File naming follows `fig-XX-YY.webp` convention · Images ≤ 200 KB each after compression · No watermarks or page artifacts visible | **P0** | **L** |
| **VISUALS-03** | Build figure lightbox / zoom modal component | Clicking any figure image should open a full-screen lightbox with the full-resolution image, figure number, caption, and close button. | • Lightbox opens on figure click · Keyboard-accessible (Esc to close, arrow keys for multi-figure navigation) · Caption displayed below image · Works on mobile with pinch-to-zoom · Smooth open/close animation | **P1** | **M** |
| **VISUALS-04** | Map all 49 figures to their correct lessons in lesson data | Using the manifest from VISUALS-01, update every chapter's lesson data array to reference the correct `figureId`. Figures should render in the correct lesson segment position. | • All 49 figures referenced in lesson data · No figure appears in wrong chapter · Lessons with no figure have `figure: null` (no broken image) · Verified against textbook page numbers | **P1** | **M** |
| **VISUALS-05** | Add figure gallery view per chapter | Each chapter detail page should include a "Figures Gallery" tab/section showing all figures for that chapter in a responsive grid with captions. | • Gallery tab appears on chapter page · All chapter figures rendered in grid · Clicking figure opens lightbox (VISUALS-03) · Gallery hidden for chapters with 0 figures | **P2** | **M** |

---

## Epic 3 — AI/INTERACTIVE: Socratic Mode Live Q&A & Adaptive Quiz Engine

> **Goal:** Make the app conversational and adaptive so learners engage deeply rather than passively reading, using AI-driven dialogue and intelligent quiz generation.

| Ticket ID | Title | Description | Acceptance Criteria | Priority | Effort |
|-----------|-------|-------------|---------------------|----------|--------|
| **AI-01** | Implement Socratic Mode — AI tutor that asks guided questions | Add a "Socratic Mode" toggle per lesson. When active, the lesson content is hidden and an AI tutor asks the student a series of probing questions about the topic, provides Socratic follow-up, and reveals the lesson summary at the end. Uses Gemini API (or OpenAI). | • Socratic Mode toggle visible in lesson view · AI asks ≥ 3 contextual questions per lesson · Learner's answers evaluated and follow-up generated · Session ends with concept summary · Mode disabled gracefully when API key absent | **P1** | **XL** |
| **AI-02** | Adaptive Quiz Engine — personalize difficulty based on performance | The current quiz system delivers static questions. Upgrade to an adaptive engine that tracks per-concept accuracy and surfaces harder questions on weak areas and easier ones on mastered areas. | • Quiz difficulty adjusts after each session · Weak concept areas flagged on dashboard · Learner can trigger "Focus Quiz" on weak areas only · Engine state persisted in localStorage · Accuracy per concept shown in progress view | **P1** | **L** |
| **AI-03** | AI-generated practice exam paper (full 20-chapter mock) | Generate a timed, 60-question multiple choice exam paper drawing from all 20 chapters. Questions should be unique per session (AI-generated or from a large bank). | • 60-question exam with timer (90 min default) · Questions distributed across all chapters · Score report generated at end · Incorrect answers link back to source lesson · PDF export of score report | **P2** | **L** |
| **AI-04** | "Explain This to Me" button — ELI5 mode per lesson section | Each lesson section should have an "Explain Simply" button that sends the section text to an AI and returns a plain-language, analogy-rich explanation shown in a side panel. | • Button appears on each lesson section card · AI explanation rendered in < 5 seconds · Explanation uses relatable analogies · Side panel dismissible · Usage tracked per session (rate limiting) | **P2** | **M** |
| **AI-05** | Concept Comparison Tool — AI-powered side-by-side concept analyzer | Allow learners to select two Kotler concepts (e.g., "Positioning vs. Differentiation") and generate an AI comparison table with definition, use-case, example, and key distinction. | • UI to select two concepts from a dropdown · AI returns structured comparison in < 8 seconds · Output displayed as formatted table · Comparison saveable as a note · Available from Search or lesson detail | **P3** | **M** |

---

## Epic 4 — MOBILE: Full Mobile PWA Enhancements

> **Goal:** Deliver a polished, app-like mobile experience with native-feel gestures, offline completeness, and home-screen install prompts.

| Ticket ID | Title | Description | Acceptance Criteria | Priority | Effort |
|-----------|-------|-------------|---------------------|----------|--------|
| **MOBILE-01** | Implement swipe gesture navigation between lessons | On mobile, learners should be able to swipe left/right to navigate to the next/previous lesson within a chapter, mirroring native app behavior. | • Swipe left advances to next lesson · Swipe right returns to previous lesson · Swipe velocity threshold prevents accidental navigation · Visual swipe hint shown on first use · Works with iOS Safari and Android Chrome | **P1** | **M** |
| **MOBILE-02** | Add install-to-home-screen prompt with custom UI | Replace the default browser install banner with a branded, dismissible "Add to Home Screen" prompt card that appears after 3rd visit. | • Custom prompt card displayed with app icon and name · "Install" and "Dismiss" actions work correctly · Prompt re-appears after 7 days if dismissed · Not shown if already installed · Prompt styled with current theme | **P1** | **S** |
| **MOBILE-03** | Offline content caching for all chapters | Currently only visited pages are cached. Pre-cache all chapter lesson data (JSON) and key assets on first load so the full app works offline even for unvisited chapters. | • Service worker pre-caches all lesson JSON on install · All 20 chapters accessible offline · Network-first for API calls, cache-first for static assets · Cache version bumped on new content deploy · Storage usage shown in Settings | **P2** | **L** |
| **MOBILE-04** | Mobile-optimized quiz interface with swipeable answer cards | Replace the current quiz button layout with swipeable answer cards on mobile — swipe right for "confident", swipe left for "unsure", tap to select. | • Swipeable card UI on screens < 768px · Answer cards snap smoothly · Color feedback (green/red) on swipe · Score calculated correctly · Falls back to tap-to-select on desktop | **P2** | **M** |

---

## Epic 5 — EXPORT: PDF Export, Flashcard Export & Spaced Repetition

> **Goal:** Let learners take their study materials offline and outside the app in multiple formats, and implement scientifically-backed spaced repetition for retention.

| Ticket ID | Title | Description | Acceptance Criteria | Priority | Effort |
|-----------|-------|-------------|---------------------|----------|--------|
| **EXPORT-01** | PDF Export — styled chapter study guide | Generate a beautifully formatted PDF for any chapter containing: chapter title, all lesson summaries, key concepts, figures (with captions), and callout facts. | • PDF generated client-side (jsPDF or Puppeteer) · Includes chapter cover page with branding · Figures embedded at correct positions · Font and color scheme matches app theme · File named `MMA-Ch{N}-StudyGuide.pdf` | **P1** | **L** |
| **EXPORT-02** | Flashcard Export — Anki-compatible `.apkg` format | Allow learners to export all key terms and definitions for a chapter as an Anki deck. Each flashcard has the term on front, definition + example on back. | • `.apkg` file generated and downloaded · Cards follow Term → Definition structure · Deck named `MMA - Chapter N: {Title}` · All key terms from lesson data included · Instructions shown for importing into Anki | **P2** | **M** |
| **EXPORT-03** | Spaced Repetition System (SRS) for key concepts | Implement a built-in SRS scheduler (SM-2 algorithm) so learners are prompted to review concepts at optimal intervals (1 day, 3 days, 7 days, etc.). | • SRS review queue visible on dashboard · Daily review card count shown · SM-2 interval calculated per card · Review session UI (flip card style) · Next review date persisted in localStorage · Option to reset a card's interval | **P2** | **L** |
| **EXPORT-04** | "Share a Concept" — generate shareable image card | Let learners tap "Share" on any key concept to generate a branded 1080×1080 PNG image card (like an Instagram story) with the concept name, definition, and app branding. | • Share button on each key concept · Image generated client-side (Canvas API) · Includes concept text, chapter name, logo · Download or native share (Web Share API) · Works on mobile and desktop | **P3** | **M** |

---

## Epic 6 — BACKEND: User Accounts & Cloud Progress Sync

> **Goal:** Optionally persist learner progress, streaks, and preferences to a cloud backend so data survives device changes and enables multi-device learning.

| Ticket ID | Title | Description | Acceptance Criteria | Priority | Effort |
|-----------|-------|-------------|---------------------|----------|--------|
| **BACKEND-01** | Firebase Authentication — Google Sign-In | Add optional sign-in with Google via Firebase Auth. Learners can use the app fully without signing in (localStorage mode), but signing in unlocks cloud sync. | • Sign-in button in header/settings · Google OAuth flow completes successfully · User's display name and avatar shown when signed in · Sign-out clears session but not local progress · Auth state persisted across page reloads | **P2** | **M** |
| **BACKEND-02** | Cloud Progress Sync via Firestore | When signed in, sync lesson completion, quiz scores, streak data, and persona selection to Firestore. Auto-merge on multi-device conflict (last-write-wins per field). | • Progress synced to Firestore on change · Data loads from cloud on sign-in · Offline writes queued and synced when online · No data loss on sign-out (local copy retained) · Sync status indicator in UI | **P2** | **L** |
| **BACKEND-03** | Admin Dashboard — content management for instructors | An instructor-facing admin page (Firebase-auth-gated) to view aggregate class progress: chapters completed, average quiz scores, most-struggled concepts. | • Admin role flag in Firestore user document · Aggregate stats page visible to admins only · Per-chapter completion rates shown · Top 5 weak concepts across all users · CSV export of class analytics | **P3** | **XL** |
| **BACKEND-04** | Anonymous telemetry & crash reporting | Instrument the app with opt-in anonymous usage telemetry (page views, feature usage, quiz completion rates) and client-side error reporting (e.g., Sentry). | • Opt-in prompt shown on first load · Telemetry fires only with consent · Error events reported to Sentry with stack trace · No PII collected · Privacy policy page created | **P3** | **M** |

---

## Epic 7 — SEARCH: Full-Text Search Across All Chapters

> **Goal:** Let learners instantly find any concept, framework, or term across all 20 chapters without knowing which chapter it belongs to.

| Ticket ID | Title | Description | Acceptance Criteria | Priority | Effort |
|-----------|-------|-------------|---------------------|----------|--------|
| **SEARCH-01** | Implement full-text search index across all lesson content | Build a client-side search index (Fuse.js or MiniSearch) over all lesson titles, concepts, body text, and key terms. Search bar accessible from the main header. | • Search input in global header · Results appear within 100ms of typing · Results show: lesson title, chapter name, match snippet · Clicking result navigates to lesson · Search index built from lesson data at app load | **P1** | **M** |
| **SEARCH-02** | Filter search results by chapter, persona, or content type | Extend search with filter chips to narrow results by chapter (Ch1–Ch20), persona (Conceptual/Practitioner/etc.), or content type (Lesson / Key Term / Figure). | • Filter chips appear above search results · Multiple filters combinable · Active filters highlighted · "Clear Filters" resets all · Filter state preserved in URL query params | **P2** | **S** |
| **SEARCH-03** | Search history & saved searches | Store the learner's last 10 search queries in localStorage and display as quick-access chips below the search bar. Allow pinning a search as "saved". | • Last 10 searches shown below search bar · Clicking a history chip re-runs search · Saved searches persist across sessions · "Clear History" option in settings · Saved searches synced to cloud (BACKEND-02 dependency) | **P3** | **S** |

---

## Epic 8 — GAMIFICATION: Streaks, Badges & Chapter Completion Certificates

> **Goal:** Motivate consistent learning behavior through a well-designed reward system that feels meaningful rather than superficial.

| Ticket ID | Title | Description | Acceptance Criteria | Priority | Effort |
|-----------|-------|-------------|---------------------|----------|--------|
| **GAMIFY-01** | Daily study streak tracker with streak shield | Track consecutive days a learner opens the app and completes ≥ 1 lesson. Display a flame streak counter. Offer one "streak shield" per week to protect a missed day. | • Streak counter displayed on dashboard · Streak increments on ≥ 1 lesson completion per day · Missed day breaks streak (unless shield active) · Shield recharged weekly · Streak record (personal best) tracked | **P2** | **M** |
| **GAMIFY-02** | Achievement badge system (15 badges) | Award badges for milestones: First Lesson, Chapter Complete, 7-Day Streak, Quiz Ace (100%), Night Owl (study after 10PM), Speedrunner (lesson in < 2 min), Marketing Guru (all chapters done), etc. | • 15 distinct badges designed and defined · Badge awarded immediately on condition met · Toast notification on badge unlock · Badge gallery visible in profile/settings · Badge earned date shown on hover | **P2** | **M** |
| **GAMIFY-03** | Chapter completion certificate generator | On completing all lessons and passing the chapter quiz (≥ 80%), generate a printable completion certificate as a PDF with the learner's name, chapter title, date, and a unique certificate ID. | • Certificate generated on chapter completion · Learner prompted to enter name if not signed in · PDF includes app logo, learner name, chapter, date · Unique certificate ID in footer · "Verify Certificate" URL (future: QR code) | **P3** | **L** |
| **GAMIFY-04** | XP points system and level progression | Award XP for actions: lesson read (+10), quiz passed (+25), quiz aced (+50), chapter completed (+100), streak maintained (+5/day). Display level (Learner → Expert → Guru → Legend) based on total XP. | • XP awarded on qualifying actions · Level badge displayed in header · Level-up animation triggered on milestone · XP breakdown visible in profile · Leaderboard (optional, requires BACKEND-02) | **P3** | **M** |

---

## Epic 9 — ACCESSIBILITY: ARIA Labels, Keyboard Navigation & Screen Reader Support

> **Goal:** Ensure the app is fully usable by learners with disabilities, meeting WCAG 2.1 AA standards throughout.

| Ticket ID | Title | Description | Acceptance Criteria | Priority | Effort |
|-----------|-------|-------------|---------------------|----------|--------|
| **A11Y-01** | Audit entire app with axe-core and fix all critical violations | Run a full automated accessibility audit using axe-core or Lighthouse. Document all violations. Fix all Critical (Level A) and Serious (Level AA) issues. | • axe-core audit shows 0 critical violations · Lighthouse A11Y score ≥ 90 · Audit report committed to repo · All fixes documented in PR | **P0** | **M** |
| **A11Y-02** | Full keyboard navigation support across all interactive elements | Every interactive element (buttons, tabs, chapter cards, quiz options, modals) must be reachable and operable via keyboard alone (Tab, Shift+Tab, Enter, Space, Arrow keys). | • Tab order is logical and sequential · Focus ring clearly visible on all elements · No keyboard traps (modal focus contained, not locked) · Esc closes all modals · Arrow keys navigate quiz options | **P0** | **M** |
| **A11Y-03** | Add comprehensive ARIA labels and roles | Add `aria-label`, `aria-describedby`, `role`, `aria-expanded`, `aria-current` attributes to all interactive and structural components. | • All icon-only buttons have `aria-label` · Progress bars have `role="progressbar"` with `aria-valuenow` · Chapter cards announce completion state · Quiz announces score result on submit · Theme toggle announces current theme | **P1** | **M** |
| **A11Y-04** | Screen reader testing with NVDA and VoiceOver | Conduct manual screen reader testing with NVDA (Windows) and VoiceOver (macOS/iOS). Document and fix all issues found. | • All lesson content readable in logical order · Figures announced with alt text · Quiz interaction narrated clearly · Navigation landmarks (`<main>`, `<nav>`, `<aside>`) correctly structured · Test report committed to repo | **P1** | **L** |

---

## Epic 10 — PERFORMANCE: Lazy Loading, Image Optimization & Bundle Analysis

> **Goal:** Achieve sub-2-second First Contentful Paint on mobile 3G and a Lighthouse Performance score ≥ 90 across all pages.

| Ticket ID | Title | Description | Acceptance Criteria | Priority | Effort |
|-----------|-------|-------------|---------------------|----------|--------|
| **PERF-01** | Implement lazy loading for chapter content and figures | All chapter lesson data (beyond Ch1) and figure images should load on-demand rather than at initial bundle time. | • Initial JS bundle < 150 KB gzipped · Figure images use `loading="lazy"` · Chapter data modules dynamically imported on navigation · Lighthouse Performance score ≥ 85 on mobile · No layout shift (CLS < 0.1) | **P1** | **M** |
| **PERF-02** | Convert all figure images to WebP with responsive srcset | Re-export all 49 figures as WebP format and serve at multiple resolutions (400px, 800px, 1200px) using `<picture>` / `srcset` for optimal delivery per device. | • All figures served as WebP · `srcset` provides 3 resolution breakpoints · Fallback PNG for browsers without WebP support · Largest figure < 200 KB · Average figure size reduction ≥ 50% vs. PNG | **P2** | **M** |
| **PERF-03** | Bundle analysis and tree-shaking audit | Run a Webpack/Vite bundle analyzer to identify and eliminate dead code, large dependencies, and unused CSS. | • Bundle analyzer report generated and committed · Unused CSS removed (PurgeCSS or equivalent) · No dependency > 50 KB without justification · Total JS bundle < 200 KB gzipped · Report documents top 5 bundle contributors | **P2** | **S** |
| **PERF-04** | Implement Virtual Scrolling for long lesson lists | Chapter detail pages with many lessons (20+) should use virtual/windowed rendering so only visible lessons are in the DOM. | • Virtual scroll implemented for lists > 15 items · DOM node count stays constant while scrolling · No perceptible scroll jank on mid-range Android · Works with keyboard navigation (A11Y-02 compatible) · Tested on Chrome DevTools device simulator | **P3** | **M** |

---

## 📌 Dependency Map

```
CONTENT-01 → VISUALS-04
CONTENT-02,03,04,05 → SEARCH-01
VISUALS-01 → VISUALS-02 → VISUALS-04 → VISUALS-05
VISUALS-03 → VISUALS-05
BACKEND-01 → BACKEND-02 → BACKEND-03
BACKEND-02 → SEARCH-03
BACKEND-02 → GAMIFY-04 (Leaderboard)
A11Y-01 → A11Y-02 → A11Y-03 → A11Y-04
AI-01 (requires Gemini/OpenAI API key)
EXPORT-01 → GAMIFY-03 (Certificate uses PDF generator)
PERF-01 → PERF-02
```

---

## 🚀 Recommended Sprint Order

### Sprint 1 (Now — Week 2)
- `CONTENT-01` — Ch3 DOCX ingest *(unblocks everything)*
- `VISUALS-01` — Figure manifest *(unblocks all visual work)*
- `A11Y-01` — Accessibility audit *(low-hanging fruit, high impact)*
- `SEARCH-01` — Basic full-text search *(high learner value)*

### Sprint 2 (Week 3–4)
- `CONTENT-02` — Chapters 4–6
- `VISUALS-02` — Extract remaining 41 figures
- `VISUALS-03` — Lightbox component
- `A11Y-02` + `A11Y-03` — Keyboard nav + ARIA
- `MOBILE-01` — Swipe navigation
- `PERF-01` — Lazy loading

### Sprint 3 (Week 5–6)
- `CONTENT-03` — Chapters 8–11
- `VISUALS-04` — Map figures to lessons
- `EXPORT-01` — PDF chapter export
- `AI-02` — Adaptive quiz engine
- `MOBILE-02` — Install prompt

### Sprint 4+ (Future Quarters)
- Remaining CONTENT tickets
- `AI-01` Socratic Mode
- `BACKEND-01/02` Cloud sync
- `GAMIFY` full suite
- `EXPORT-02/03` Flashcards + SRS

---

## 📊 Effort vs. Priority Matrix

```
Priority │  S           M             L             XL
─────────┼──────────────────────────────────────────────────────
P0       │ VISUALS-01   A11Y-01       CONTENT-02    CONTENT-01
         │              A11Y-02       VISUALS-02
─────────┼──────────────────────────────────────────────────────
P1       │ MOBILE-02    AI-04         AI-02         AI-01
         │ SEARCH-02    VISUALS-03    CONTENT-04    CONTENT-03
         │              SEARCH-01     EXPORT-01
         │              MOBILE-01     A11Y-04
         │              A11Y-03       PERF-01
─────────┼──────────────────────────────────────────────────────
P2       │ PERF-03      CONTENT-06    MOBILE-03     CONTENT-05
         │ SEARCH-03    EXPORT-02     EXPORT-03
         │              GAMIFY-01     PERF-02
         │              GAMIFY-02     BACKEND-02
         │              BACKEND-01
         │              VISUALS-05
─────────┼──────────────────────────────────────────────────────
P3       │ SEARCH-03    AI-05         GAMIFY-03     BACKEND-03
         │              EXPORT-04     PERF-04
         │              GAMIFY-04
         │              BACKEND-04
```

---

*Document maintained by: Engineering / Product team*
*Repo: https://github.com/KartikRS9/marketing-mastery-academy*
