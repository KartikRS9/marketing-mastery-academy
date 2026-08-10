# 📘 Product Requirements Document
## Marketing Mastery

> **Version:** 1.0.0 &nbsp;|&nbsp; **Status:** Draft &nbsp;|&nbsp; **Date:** August 2026 &nbsp;|&nbsp; **Owner:** KartikRS9

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Personas](#4-user-personas)
5. [Functional Requirements](#5-functional-requirements)
   - 5.1 [Content & Navigation](#51-content--navigation)
   - 5.2 [Learning Profiles](#52-learning-profiles)
   - 5.3 [Visual Mapping](#53-visual-mapping)
   - 5.4 [Mastery Quizzes](#54-mastery-quizzes)
   - 5.5 [Feynman Review](#55-feynman-review)
   - 5.6 [Themes & Appearance](#56-themes--appearance)
   - 5.7 [Offline & PWA](#57-offline--pwa)
   - 5.8 [Notes Export](#58-notes-export)
   - 5.9 [Settings & Preferences](#59-settings--preferences)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Out of Scope](#7-out-of-scope)
8. [Assumptions](#8-assumptions)
9. [Dependencies](#9-dependencies)

---

## 1. Executive Summary

**Marketing Mastery** is a self-contained, offline-capable Progressive Web App (PWA) designed to transform passive reading of Philip Kotler & Gary Armstrong's *Principles of Marketing* (17th Edition) into an active, deeply engaging learning experience.

The application provides a structured, chapter-by-chapter curriculum covering all 20 chapters of the textbook, delivered through adaptive learning profiles, interactive visual concept maps, mastery quizzes, and Feynman-style review exercises. Built on a zero-dependency Vanilla HTML/CSS/JS stack with a lightweight Python HTTP server, the app is designed to be installable, offline-capable, and visually premium — supporting four curated themes that serve learners in any environment.

The product is aimed at **students and self-directed learners** who want a rigorous, textbook-faithful resource that goes beyond flashcards or summaries — and instead develops genuine conceptual mastery of marketing principles.

---

## 2. Problem Statement

### 2.1 Context

Marketing education is well-served at the introductory level by videos and summaries, but learners who want to develop **deep, exam-ready or career-applicable mastery** of Kotler & Armstrong's framework face a significant gap:

- Standard textbooks are passive reading experiences with no feedback mechanisms.
- Generic flashcard apps lack structured pedagogy or conceptual scaffolding.
- Online courses are expensive and often untethered from the specific textbook content.
- No existing free tool maps directly to the KA 17e chapter structure with adaptive learning modes.

### 2.2 User Pain Points

| Pain Point | Affected Persona | Severity |
|---|---|---|
| No interactive companion for KA 17e | All learners | 🔴 High |
| Visual learners lack concept maps tied to textbook content | Visual / Network learners | 🔴 High |
| No active-recall mechanism beyond rereading | All learners | 🔴 High |
| Offline access required for exam prep without internet | Students | 🟠 Medium |
| One-size-fits-all learning ignores different cognitive styles | All learners | 🟠 Medium |
| No structured note export for revision | Self-learners, Scholars | 🟡 Low–Medium |

> [!IMPORTANT]
> The core problem is the **absence of a structured, interactive, offline-capable learning system** faithfully aligned with *Principles of Marketing 17e* — not a lack of generic marketing content online.

---

## 3. Goals & Success Metrics

### 3.1 Product Goals

| # | Goal | Type |
|---|---|---|
| G1 | Deliver an interactive, chapter-structured companion for all 20 KA 17e chapters | Core |
| G2 | Enable active recall and self-assessment via quizzes and Feynman reviews | Pedagogical |
| G3 | Support multiple cognitive learning styles through 5 adaptive profiles | Adaptive |
| G4 | Provide a distraction-free, visually premium offline-capable PWA | UX/Technical |
| G5 | Allow learners to export structured notes for offline revision | Utility |

### 3.2 Success Metrics

| Metric | Target | Measurement Method |
|---|---|---|
| Chapter completion rate | ≥ 70% of enrolled chapters fully traversed | Session tracking (localStorage) |
| Quiz accuracy | Average ≥ 75% correct on first attempt per chapter | Quiz result logging |
| Feynman review completion | ≥ 60% of learners complete at least one review per chapter | Review state tracking |
| PWA install rate | ≥ 30% of returning users install to home screen | Browser install event |
| Offline usage | App fully functional in offline mode for all populated chapters | Service worker audit |
| Theme usage diversity | All 4 themes used by ≥ 5% of sessions | Settings state tracking |
| Notes export rate | ≥ 20% of chapter completions trigger a notes download | Export event logging |

> [!NOTE]
> Metrics for v1.0 are tracked via `localStorage` and are not centrally reported; instrumentation improvements are deferred to a future version.

---

## 4. User Personas

### 4.1 Persona A — The Marketing Student

> *"I have an exam in three weeks and I need to actually understand the material, not just memorize it."*

| Attribute | Detail |
|---|---|
| **Name** | Priya S. |
| **Age** | 21 |
| **Role** | Undergraduate Business Student |
| **Tech Literacy** | High |
| **Device** | Laptop (primary), Mobile (secondary) |
| **Usage Context** | Library, dorm room, occasionally offline in transit |
| **Textbook Access** | Has KA 17e PDF/physical copy |
| **Primary Goal** | Exam preparation with concept mastery |
| **Pain Points** | No active feedback from textbook; rereading is inefficient |
| **Key Features Used** | Mastery Quizzes, Timeline Navigation, Feynman Review, Download Notes |
| **Preferred Profile** | Socratic Trainer, Case Study Scholar |

---

### 4.2 Persona B — The Self-Directed Marketer

> *"I want to upskill in marketing strategy but don't have a professor guiding me."*

| Attribute | Detail |
|---|---|
| **Name** | Daniel O. |
| **Age** | 31 |
| **Role** | Product Manager / Career Switcher |
| **Tech Literacy** | Very High |
| **Device** | Desktop (primary), Tablet (travel) |
| **Usage Context** | Home office; occasional travel; offline use important |
| **Textbook Access** | Purchased KA 17e for self-study |
| **Primary Goal** | Build a deep, applied understanding of marketing frameworks |
| **Pain Points** | Generic content doesn't match KA 17e structure; needs concept maps |
| **Key Features Used** | Visual Mapping, Learning Profiles, Themes, Notes Export |
| **Preferred Profile** | Tech PM, Network Architect |

---

### 4.3 Persona C — The Casual Explorer

> *"I've heard about Kotler and want to dip into marketing concepts at my own pace."*

| Attribute | Detail |
|---|---|
| **Name** | Aisha M. |
| **Age** | 26 |
| **Role** | Marketing Coordinator (non-marketing degree) |
| **Tech Literacy** | Medium |
| **Device** | Mobile (primary) |
| **Usage Context** | Commute, lunch breaks, home |
| **Primary Goal** | Build foundational marketing vocabulary and mental models |
| **Pain Points** | Textbook is dense; wants bite-sized structured progression |
| **Key Features Used** | General Learning Profile, Timeline Navigation, Day/Night Toggle |
| **Preferred Profile** | General |

---

## 5. Functional Requirements

### 5.1 Content & Navigation

#### 5.1.1 Chapter Structure

| ID | Requirement | Priority |
|---|---|---|
| CN-01 | The app SHALL display all 20 chapters of KA 17e as navigable units | 🔴 Must |
| CN-02 | Each chapter SHALL display a title, chapter number, and completion status indicator | 🔴 Must |
| CN-03 | Chapters marked as "stub" SHALL display a placeholder with an expected completion note | 🟠 Should |
| CN-04 | Chapters 1, 2, and 7 SHALL be fully populated with all lesson content | 🔴 Must |
| CN-05 | Navigation between chapters SHALL preserve scroll position within the current session | 🟡 Nice |

**Fully Populated Chapters (v1.0):**

| Chapter | Title | Status |
|---|---|---|
| Ch 1 | Marketing: Creating Customer Value and Engagement | ✅ Complete |
| Ch 2 | Company and Marketing Strategy | ✅ Complete |
| Ch 7 | Customer Value–Driven Marketing Strategy | ✅ Complete |
| Ch 3–6, 8–20 | All remaining chapters | 🔄 Stub |

#### 5.1.2 Timeline Lesson Navigation

| ID | Requirement | Priority |
|---|---|---|
| TL-01 | Each chapter SHALL be broken into discrete lessons presented as a vertical/horizontal timeline | 🔴 Must |
| TL-02 | Learners SHALL be able to navigate forward and backward between lessons within a chapter | 🔴 Must |
| TL-03 | Timeline SHALL visually indicate completed, current, and upcoming lessons | 🔴 Must |
| TL-04 | Lesson completion state SHALL persist in `localStorage` across sessions | 🟠 Should |
| TL-05 | Timeline navigation SHALL be accessible via keyboard (arrow keys) | 🟡 Nice |

---

### 5.2 Learning Profiles

The app supports **5 distinct Learning Profiles** that alter the presentation style, focus areas, and supplementary content within each lesson.

| Profile ID | Name | Description | Target Persona |
|---|---|---|---|
| LP-01 | **General** | Balanced presentation of all content elements | Casual Explorer |
| LP-02 | **Socratic Trainer** | Emphasis on guided questions and self-interrogation | Student |
| LP-03 | **Network Architect** | Emphasizes relationships, concept maps, and structural frameworks | Self-directed Marketer |
| LP-04 | **Case Study Scholar** | Prioritizes real-world examples, brand cases, and applied scenarios | Student / Professional |
| LP-05 | **Tech PM** | Frames marketing concepts in product management and B2B technology contexts | Product Manager |

| ID | Requirement | Priority |
|---|---|---|
| LP-R01 | The app SHALL allow the user to select a Learning Profile before beginning a chapter | 🔴 Must |
| LP-R02 | Profile selection SHALL be accessible from the Settings modal at any time | 🔴 Must |
| LP-R03 | The selected profile SHALL persist across sessions via `localStorage` | 🟠 Should |
| LP-R04 | Profile-specific content SHALL be visually distinguished from base content | 🟠 Should |
| LP-R05 | Each profile SHALL modify at least one of: content emphasis, supplementary prompts, diagram focus | 🔴 Must |

---

### 5.3 Visual Mapping

| ID | Requirement | Priority |
|---|---|---|
| VM-01 | Each fully-populated chapter SHALL include at least one Mermaid.js concept map | 🔴 Must |
| VM-02 | Mermaid diagrams SHALL render client-side without a build step | 🔴 Must |
| VM-03 | The app SHALL display textbook figures as static image references where applicable | 🟠 Should |
| VM-04 | Concept maps SHALL be zoomable/scrollable on small screens | 🟠 Should |
| VM-05 | Mermaid diagrams SHALL use colors consistent with the active theme | 🟡 Nice |
| VM-06 | The Visual Mapping section SHALL be accessible from the chapter lesson view | 🔴 Must |

**Supported Mermaid Diagram Types:**

- `flowchart` — Process flows and decision trees
- `graph LR/TD` — Concept relationship maps
- `mindmap` — Hierarchical concept breakdowns
- `sequenceDiagram` — Customer journey / interaction flows (where applicable)

---

### 5.4 Mastery Quizzes

| ID | Requirement | Priority |
|---|---|---|
| MQ-01 | Each fully-populated chapter SHALL include a Mastery Quiz | 🔴 Must |
| MQ-02 | Quizzes SHALL contain a minimum of 5 questions per chapter | 🔴 Must |
| MQ-03 | Each question SHALL be multiple-choice with 4 options | 🔴 Must |
| MQ-04 | Correct answers SHALL be accompanied by a content-specific explanation | 🔴 Must |
| MQ-05 | Incorrect answers SHALL show the correct answer and a brief rationale | 🔴 Must |
| MQ-06 | Quiz score SHALL be displayed at the end with pass/fail feedback | 🔴 Must |
| MQ-07 | Quiz results SHALL be stored in `localStorage` per chapter | 🟠 Should |
| MQ-08 | Users SHALL be able to retake a quiz without clearing their score history | 🟠 Should |
| MQ-09 | Questions SHALL be shuffled on retake to reduce memorization gaming | 🟡 Nice |

> [!TIP]
> A passing score threshold of **70%** is recommended as the default mastery benchmark, configurable in settings for future versions.

---

### 5.5 Feynman Review

The Feynman Review feature is a structured self-explanation exercise inspired by the **Feynman Technique** — the learner explains a concept in their own words, then compares their explanation against a model answer.

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Each fully-populated chapter SHALL include a Feynman Review section | 🔴 Must |
| FR-02 | The review SHALL present 2–4 key concepts per chapter for self-explanation | 🔴 Must |
| FR-03 | A text area SHALL allow the learner to write their explanation | 🔴 Must |
| FR-04 | Upon submission, the app SHALL reveal a model explanation for comparison | 🔴 Must |
| FR-05 | The learner SHALL be able to rate their own explanation (e.g., Nailed it / Almost / Needs Work) | 🟠 Should |
| FR-06 | Self-ratings SHALL be persisted in `localStorage` | 🟠 Should |
| FR-07 | Model answers SHALL be faithful to KA 17e source content | 🔴 Must |

---

### 5.6 Themes & Appearance

The app provides **4 curated visual themes** designed for different learning environments and aesthetic preferences.

| Theme ID | Name | Description | Best For |
|---|---|---|---|
| TH-01 | **Chalkboard Executive** | Dark green board tones, serif accents, professional academic feel | Library / Night study |
| TH-02 | **Nebula Dark** | Deep space purples and blues with glowing accents | Evening focus sessions |
| TH-03 | **Nordic Minimal** | Clean whites, cool greys, Scandinavian minimal aesthetic | Daytime / bright environments |
| TH-04 | **Cyber Terminal** | Monochrome terminal green on black, hacker aesthetic | Developer learners / contrast |

| ID | Requirement | Priority |
|---|---|---|
| TH-R01 | All 4 themes SHALL be fully implemented and selectable at runtime | 🔴 Must |
| TH-R02 | Theme SHALL be applied globally to all UI components without a page reload | 🔴 Must |
| TH-R03 | Active theme SHALL persist in `localStorage` across sessions | 🔴 Must |
| TH-R04 | Day/Night toggle SHALL switch between a designated light and dark theme pair | 🟠 Should |
| TH-R05 | Theme transition SHALL use a CSS transition for a smooth visual change | 🟡 Nice |
| TH-R06 | All themes SHALL maintain WCAG AA contrast ratios for body text | 🟠 Should |

---

### 5.7 Offline & PWA

| ID | Requirement | Priority |
|---|---|---|
| PWA-01 | The app SHALL include a valid `manifest.json` for PWA installability | 🔴 Must |
| PWA-02 | The app SHALL register a Service Worker that caches all core assets on install | 🔴 Must |
| PWA-03 | All fully-populated chapter content SHALL be available offline after first load | 🔴 Must |
| PWA-04 | The app SHALL function without a network connection for all cached content | 🔴 Must |
| PWA-05 | The Service Worker SHALL use a cache-first strategy for static assets | 🔴 Must |
| PWA-06 | Stub chapter pages SHALL display a clear offline placeholder if not cached | 🟠 Should |
| PWA-07 | The app SHALL be installable from Chrome, Edge, and Safari (iOS) | 🟠 Should |
| PWA-08 | App icon SHALL be provided at 192×192 and 512×512 resolution | 🔴 Must |

> [!WARNING]
> Service Worker scope must be configured correctly relative to the Python HTTP server's serving root. Misconfiguration will cause offline mode to silently fail.

---

### 5.8 Notes Export

| ID | Requirement | Priority |
|---|---|---|
| NE-01 | Each chapter SHALL have a "Download Notes" action | 🔴 Must |
| NE-02 | Notes SHALL export as a standalone, self-contained HTML file | 🔴 Must |
| NE-03 | Exported HTML SHALL include chapter title, key concepts, definitions, and diagram placeholders | 🔴 Must |
| NE-04 | Export SHALL trigger a browser download without requiring a server round-trip | 🔴 Must |
| NE-05 | Exported notes SHALL be print-friendly (clean layout, no dark theme artifacts) | 🟠 Should |
| NE-06 | Learner's Feynman Review self-ratings MAY optionally be embedded in the export | 🟡 Nice |

---

### 5.9 Settings & Preferences

| ID | Requirement | Priority |
|---|---|---|
| ST-01 | A Settings modal SHALL be accessible from a persistent UI control | 🔴 Must |
| ST-02 | Settings SHALL include: Active Theme, Active Learning Profile, Day/Night toggle | 🔴 Must |
| ST-03 | Settings SHALL include a "Reset Progress" option with confirmation dialog | 🟠 Should |
| ST-04 | All settings SHALL be applied immediately upon change | 🔴 Must |
| ST-05 | Settings modal SHALL be dismissible via Escape key and close button | 🟠 Should |
| ST-06 | Settings state SHALL be fully persisted in `localStorage` | 🔴 Must |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| ID | Requirement | Target |
|---|---|---|
| NF-P01 | Initial page load time (first contentful paint) | ≤ 2s on a 4G connection |
| NF-P02 | Mermaid diagram render time per diagram | ≤ 500ms |
| NF-P03 | Theme switch transition | ≤ 300ms |
| NF-P04 | Quiz answer feedback latency | ≤ 100ms (client-side only) |
| NF-P05 | Notes HTML export generation time | ≤ 1s |

### 6.2 Reliability & Availability

| ID | Requirement |
|---|---|
| NF-R01 | The app SHALL function entirely offline for all cached chapters after first visit |
| NF-R02 | No chapter content SHALL be fetched from a remote API at runtime |
| NF-R03 | App state (progress, quiz results, profile) SHALL survive browser restarts via `localStorage` |

### 6.3 Compatibility

| Platform | Support Level |
|---|---|
| Chrome (Desktop) ≥ v100 | ✅ Full |
| Edge (Desktop) ≥ v100 | ✅ Full |
| Firefox (Desktop) ≥ v100 | ✅ Full |
| Safari (macOS) ≥ v15 | ✅ Full |
| Chrome (Android) ≥ v100 | ✅ Full |
| Safari (iOS) ≥ v15 | ✅ Full (PWA install supported) |
| IE 11 | ❌ Not Supported |

### 6.4 Accessibility

| ID | Requirement |
|---|---|
| NF-A01 | All interactive elements SHALL have accessible labels (ARIA or visible text) |
| NF-A02 | All themes SHALL maintain WCAG 2.1 AA contrast ratios for body text (≥ 4.5:1) |
| NF-A03 | Keyboard navigation SHALL be supported for: chapter selection, quiz answering, settings modal |
| NF-A04 | The app SHALL not rely on color alone to convey quiz correctness/incorrectness |

### 6.5 Maintainability

| ID | Requirement |
|---|---|
| NF-M01 | Chapter content SHALL be stored in structured JS objects or JSON, not hardcoded in HTML |
| NF-M02 | Each chapter's data structure SHALL follow a consistent schema for all 20 chapters |
| NF-M03 | Adding a new fully-populated chapter SHALL require changes to ≤ 3 files |
| NF-M04 | Theme definitions SHALL be entirely CSS custom property–based (`--var`) for easy extension |

### 6.6 Security

| ID | Requirement |
|---|---|
| NF-S01 | The Python HTTP server SHALL only serve static files; no user data is processed server-side |
| NF-S02 | No external user data SHALL be transmitted; all state is client-local |
| NF-S03 | HTML export generation SHALL sanitize any user-entered Feynman text before embedding |

---

## 7. Out of Scope

The following are explicitly **not** included in v1.0 of Marketing Mastery:

| # | Out-of-Scope Item | Rationale |
|---|---|---|
| OOS-01 | User accounts, authentication, or cloud sync | Adds backend complexity; privacy concern for v1 |
| OOS-02 | Server-side progress tracking or analytics | All state is local; no backend in v1 |
| OOS-03 | Spaced repetition system (SRS) / Anki-style flashcards | Planned for v2; distinct feature surface |
| OOS-04 | AI-generated content or GPT-based explanations | Content is textbook-faithful; no LLM dependency |
| OOS-05 | Video or audio content | Increases asset size beyond lightweight PWA goals |
| OOS-06 | Collaboration or social features (leaderboards, peer comparison) | Out of scope for single-learner tool |
| OOS-07 | Coverage of any textbook other than KA 17e | Product is explicitly KA 17e-scoped |
| OOS-08 | Content for Chapters 3–6, 8–20 (stub chapters) | Deferred to v1.x and v2.0 content sprints |
| OOS-09 | Native mobile app (iOS/Android) | PWA provides sufficient mobile support |
| OOS-10 | Instructor dashboard or class management tools | Persona scope is individual learner only |

> [!CAUTION]
> Stub chapters (Ch 3–6, 8–20) must clearly communicate their placeholder status in-app to avoid learner confusion or drop-off.

---

## 8. Assumptions

| # | Assumption |
|---|---|
| A-01 | The user has access to a copy of *Principles of Marketing* 17e (physical or PDF) for supplementary reference |
| A-02 | The Python HTTP server is run locally; no cloud hosting is required for v1.0 |
| A-03 | The app is used by a single learner per device; no multi-user session isolation is needed |
| A-04 | `localStorage` provides sufficient persistence; no IndexedDB or server-side storage is required for v1.0 |
| A-05 | Mermaid.js CDN is available on first load; subsequent offline use relies on Service Worker cache |
| A-06 | Font Awesome icons are loaded via CDN and cached by the Service Worker after first visit |
| A-07 | The learner's browser supports ES6+ JavaScript; no polyfills are required |
| A-08 | Content accuracy is validated by the developer against the KA 17e source text; no automated fact-checking is in scope |
| A-09 | "Day/Night toggle" maps to a predefined light/dark theme pair, not a system-preference auto-detect |
| A-10 | All textbook figures referenced are described in text/diagrams; no copyrighted images are embedded |

---

## 9. Dependencies

### 9.1 Runtime Dependencies

| Dependency | Version | Purpose | Delivery |
|---|---|---|---|
| Mermaid.js | ≥ 10.x | Client-side diagram rendering | CDN (cached by SW) |
| Font Awesome | ≥ 6.x | UI iconography | CDN (cached by SW) |
| Google Fonts | As specified | Typography (Inter, Outfit, etc.) | CDN (cached by SW) |
| Python HTTP Server | 3.x stdlib | Local static file serving | Local runtime |

### 9.2 Development Dependencies

| Dependency | Purpose |
|---|---|
| Git / GitHub | Version control and source hosting |
| Browser DevTools | Service Worker debugging, Lighthouse PWA audit |
| VS Code (recommended) | Authoring environment |

### 9.3 Content Dependencies

| Dependency | Notes |
|---|---|
| KA 17e Textbook | Primary source for all chapter content, definitions, concepts, and case studies |
| Chapter Content JSON/JS Objects | Must be authored per chapter before the chapter can be moved from stub to complete |
| App Icon Assets | 192×192 and 512×512 PNG required for PWA manifest |

### 9.4 Downstream Dependencies (Future)

| Item | Impact if Unavailable |
|---|---|
| Mermaid.js CDN | Diagrams will not render on first load; Service Worker must cache aggressively |
| Font Awesome CDN | Icons will fall back to text labels; UI degrades gracefully |
| Google Fonts CDN | System fonts used as fallback; visual impact but no functional impact |

---

## Appendix A — Chapter Inventory

| Ch | Title | Part | Status |
|---|---|---|---|
| 1 | Marketing: Creating Customer Value and Engagement | I | ✅ Complete |
| 2 | Company and Marketing Strategy: Partnering to Build Customer Engagement | I | ✅ Complete |
| 3 | Analyzing the Marketing Environment | II | 🔄 Stub |
| 4 | Managing Marketing Information to Gain Customer Insights | II | 🔄 Stub |
| 5 | Understanding Consumer and Business Buyer Behavior | II | 🔄 Stub |
| 6 | Customer Value–Driven Marketing Strategy | III | 🔄 Stub |
| 7 | Products, Services, and Brands: Building Customer Value | III | ✅ Complete |
| 8 | Developing New Products and Managing the Product Life Cycle | III | 🔄 Stub |
| 9 | Pricing: Understanding and Capturing Customer Value | IV | 🔄 Stub |
| 10 | Pricing Strategies: Additional Considerations | IV | 🔄 Stub |
| 11 | Marketing Channels: Delivering Customer Value | V | 🔄 Stub |
| 12 | Retailing and Wholesaling | V | 🔄 Stub |
| 13 | Engaging Consumers and Communicating Customer Value | VI | 🔄 Stub |
| 14 | Advertising and Public Relations | VI | 🔄 Stub |
| 15 | Personal Selling and Sales Promotion | VI | 🔄 Stub |
| 16 | Direct, Online, Social Media, and Mobile Marketing | VI | 🔄 Stub |
| 17 | The Global Marketplace | VII | 🔄 Stub |
| 18 | Sustainable Marketing: Social Responsibility and Ethics | VII | 🔄 Stub |
| 19 | — | — | 🔄 Stub |
| 20 | — | — | 🔄 Stub |

---

## Appendix B — Requirement Priority Legend

| Symbol | Label | Meaning |
|---|---|---|
| 🔴 Must | Must Have | Core functionality; v1.0 is incomplete without it |
| 🟠 Should | Should Have | Important but not blocking; targeted for v1.0 |
| 🟡 Nice | Nice to Have | Enhances experience; deferred if time-constrained |

---

*Document maintained by: KartikRS9 &nbsp;|&nbsp; Repository: [github.com/KartikRS9/marketing-mastery](https://github.com/KartikRS9/marketing-mastery)*
