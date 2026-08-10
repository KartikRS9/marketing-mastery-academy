# Frontend Specification Document
## Marketing Mastery
**Version:** 1.0 | **Last Updated:** August 2026 | **Status:** Active

---

## Table of Contents
1. [Design System](#1-design-system)
2. [Typography Scale](#2-typography-scale)
3. [Spacing System](#3-spacing-system)
4. [Theme System](#4-theme-system)
5. [Component Inventory](#5-component-inventory)
6. [Interaction Specifications](#6-interaction-specifications)
7. [Responsive Breakpoints](#7-responsive-breakpoints)
8. [Tab Rendering Logic](#8-tab-rendering-logic)
9. [Mermaid Rendering Pipeline](#9-mermaid-rendering-pipeline)
10. [Animation Specifications](#10-animation-specifications)
11. [CSS Naming Conventions](#11-css-naming-conventions)
12. [Accessibility Notes](#12-accessibility-notes)

---

## 1. Design System

### 1.1 Color Tokens

All colors are defined as CSS Custom Properties on `:root` and overridden per theme class on `body`.

| Token | Default (Chalkboard) | Description |
|---|---|---|
| `--primary` | `hsl(40, 70%, 55%)` | Gold — primary actions, accents |
| `--secondary` | `hsl(263, 90%, 65%)` | Purple — secondary highlights |
| `--bg-main` | `#0a0c10` | Main background |
| `--bg-sidebar` | `#0d1117` | Sidebar background |
| `--bg-card` | `hsla(220, 20%, 10%, 0.85)` | Card surface |
| `--text-primary` | `#eae6df` | Primary text |
| `--text-secondary` | `#9e9b95` | Secondary/muted text |
| `--text-muted` | `#6b6865` | Placeholder/disabled text |
| `--border-card` | `hsla(220, 15%, 20%, 0.6)` | Card borders |
| `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.4)` | Large shadow |

### 1.2 Semantic Color Usage

| Context | Token Used |
|---|---|
| Active chapter nav item | `--primary` background |
| Tab active state | `--primary` text + background |
| Quiz correct answer | Green `#4caf50` |
| Quiz wrong answer | Red `#f44336` |
| Lesson figure reference accent | `--secondary` |
| Download button gradient | `--primary` → `--secondary` |
| Settings modal backdrop | `rgba(0,0,0,0.6)` |

---

## 2. Typography Scale

| Role | Font Family | Weight | Size | Line Height |
|---|---|---|---|---|
| Hero Title | Outfit | 800 | `2.5rem` | 1.15 |
| Chapter Title | Outfit | 800 | `1.85rem` | 1.25 |
| Section Heading (h2) | Outfit | 700 | `1.25rem` | 1.3 |
| Card Title | Outfit | 700 | `1rem` | 1.4 |
| Tab Button | Outfit | 600 | `0.85rem` | 1 |
| Body Text | Inter | 400 | `0.9rem` | 1.7 |
| Meta / Caption | Inter | 400 | `0.75rem–0.8rem` | 1.5 |
| Accent / Quote | Playfair Display | 400–700 | `1rem–1.1rem` | 1.6 |
| Code / Mnemonic Badge | Inter | 700 | `0.72rem` | 1 |

### Font Loading
Fonts loaded via Google Fonts CDN with `display=swap` for performance. Preconnect tags on `fonts.googleapis.com` and `fonts.gstatic.com`.

---

## 3. Spacing System

Based on a `0.25rem` (4px) base unit:

| Scale | Value | Usage |
|---|---|---|
| `xs` | `0.25rem` | Icon gaps, tight badges |
| `sm` | `0.5rem` | Button padding, small gaps |
| `md` | `1rem` | Card padding, default gap |
| `lg` | `1.5rem` | Section margins |
| `xl` | `2rem` | Main viewport padding |
| `2xl` | `3rem` | Welcome card padding |
| `3xl` | `4rem` | Hero sections |

---

## 4. Theme System

### 4.1 Available Themes

| Theme Key | Body Class | Personality |
|---|---|---|
| `chalkboard` | `body.theme-chalkboard` | Dark charcoal, warm gold — default |
| `nebula-dark` | `body.theme-nebula-dark` | Deep indigo, electric purple |
| `nordic-minimal` | `body.theme-nordic-minimal` | Clean white/grey, light mode |
| `cyber-terminal` | `body.theme-cyber-terminal` | Black, neon green terminal |

### 4.2 Theme Application

```js
// Theme applied by adding class to body
function applyThemeClass(themeKey) {
  document.body.className = document.body.className
    .replace(/theme-\S+/g, '').trim();
  document.body.classList.add(`theme-${themeKey}`);
  localStorage.setItem('mktg_academy_theme', themeKey);
}
```

### 4.3 Day/Night Toggle

- Toggles between `nordic-minimal` (light) and `chalkboard` (dark)
- Button shows 🌙 Moon icon (dark mode) / ☀️ Sun icon (light mode)
- Syncs with the theme dropdown selector on change

### 4.4 Theme Persistence

Theme stored in `localStorage` key: `mktg_academy_theme`. Loaded on `DOMContentLoaded` before first render.

---

## 5. Component Inventory

### 5.1 Sidebar (`aside.sidebar#sidebar`)

| Sub-component | Element | Notes |
|---|---|---|
| Logo | `.sidebar-logo` | Grad cap icon + "Marketing Academy" text |
| Chapter Nav | `#sidebar-nav` | Dynamically populated list |
| Nav Item | `.nav-chapter-item` | `data-id` attribute, `.active` state class |
| Progress Section | `.sidebar-progress` | Label + fill bar |
| Progress Fill | `.progress-fill` | Width set via JS as `%` string |
| Profile Badge | `.user-profile-badge` | Avatar initial + name + active persona label |

**States:**
- Default: `left: -320px` (hidden off-screen on mobile)
- Open: `left: 0` via `.open` class (mobile overlay)
- Desktop: always visible via `grid-template-columns`

---

### 5.2 Header (`.header`)

| Sub-component | Element | Notes |
|---|---|---|
| Toggle Sidebar Btn | `.toggle-sidebar-btn` | Visible only `≤1024px` |
| Breadcrumbs | `.breadcrumbs` | Part label + separator + chapter label |
| Theme Selector | `.theme-selector-container` | Label + `<select>` dropdown |
| Day/Night Toggle | `#theme-toggle-btn` | Moon/sun icon button |
| Settings Gear | `#settings-btn` | Opens settings modal |

---

### 5.3 Welcome Screen (`.welcome-screen`)

Shown on initial load, hidden when a chapter is selected.

| Element | Notes |
|---|---|
| `.welcome-card` | Central card with `fadeIn` animation |
| `.hero-badge` | "17th Edition" pill |
| `.hero-title` | Large branded heading |
| `.hero-subtitle` | Tagline text |
| `.features-grid` | 2×2 grid of feature items |
| `#start-learning-btn` | Selects Chapter 1 on click |

---

### 5.4 Chapter View (`#chapter-view`)

Hidden by default. Shown when a chapter is selected via `classList.remove('hidden')`.

#### 5.4.1 Chapter Info Section (`.chapter-info-section`)

```
.chapter-info-top (flex row, space-between)
├── div
│   ├── .chapter-title (#chapter-title)
│   └── .chapter-part-subtitle (#chapter-part-subtitle)
└── .download-notes-btn (#download-notes-btn)
```

#### 5.4.2 Lessons Timeline (`.lessons-timeline`)

Horizontal scrollable row of lesson pills.

| Element | Notes |
|---|---|
| `.lesson-pill` | Each lesson as a clickable pill |
| `.lesson-pill.active` | Currently selected lesson |
| `.lesson-pill-num` | Lesson number badge |
| `.lesson-pill-title` | Truncated lesson title |

On click: calls `showLessonFocus(lessonTitle)`.

#### 5.4.3 Lesson Focus Card (`#lesson-focus-card`)

Hidden by default, revealed on lesson pill click.

```
.lesson-focus-card.card
├── .lesson-focus-header
│   ├── .lesson-focus-title (#lesson-focus-title)
│   └── .close-lesson-btn (#close-lesson-btn)
├── .lesson-focus-desc (#lesson-focus-desc)
└── #lesson-visual-segment (.hidden by default)
    ├── .lesson-visual-title-sub
    └── .lesson-visual-layout
        ├── .lesson-visual-img-box (#lesson-visual-img-box)
        └── .lesson-visual-text
            └── .lesson-visual-caption (#lesson-visual-caption)
```

**Visual Segment Logic:**
- Shown only if `lessonVisualsMap[lessonTitle]` has a matching entry
- Image src set to `images/{file}`, caption set as innerHTML

---

### 5.5 Tab Navigation (`.tabs-nav-container`)

6 tabs, each a `.tab-btn` with `data-tab` attribute:

| Tab Key | Icon | Content Rendered |
|---|---|---|
| `core` | `fa-book-open` | Definitions, frameworks, comparison table, infographics, crosslinks, memory |
| `visual` | `fa-sitemap` | Mermaid diagrams (5 types) + textbook figures grid |
| `mastery` | `fa-trophy` | Mastery MCQ quiz with interactive options |
| `feynman` | `fa-brain` | Feynman review prompt + guide + keyword chips |
| `revision` | `fa-clock-rotate-left` | One-page markdown revision summary |
| `assessment` | `fa-clipboard-question` | Interview Qs, MBA Qs, Scenarios, Practice Exercises |

Active tab: `.tab-btn.active`. Content panels: `.tab-panel` with `.hidden` toggled.

---

### 5.6 Settings Modal (`#settings-modal`)

Overlay modal triggered by the gear button `#settings-btn`.

```
.settings-modal-overlay (#settings-modal)
└── .settings-modal-card
    ├── .settings-modal-header
    │   ├── h3 "Learning Profile Settings"
    │   └── .settings-close-btn (#settings-close-btn)
    └── .settings-profiles-grid
        └── .profile-radio-card × 5 (one per persona)
            ├── input[type=radio]
            └── .profile-card-label
                ├── .profile-icon
                ├── .profile-name
                └── .profile-tagline
```

**Profiles:** `general`, `socratic`, `network`, `casestudy`, `pm`

On profile change: updates `activeLearningProfile` global, re-renders persona focus panel.

---

### 5.7 Persona Focus Card (`#persona-focus-card`)

Rendered below the lesson focus card, visible after a chapter is loaded.

Content dynamically rendered by `renderPersonaFocusContent(data)` based on `activeLearningProfile`:

| Profile | Content Rendered |
|---|---|
| `general` | Mentor overview card with chapter philosophy |
| `socratic` | Business problem + input box + submit + feedback box |
| `network` | 80/20 core nodes grid + dependency links |
| `casestudy` | Harvard-style case with discussion questions |
| `pm` | RICE grid + product metrics + value proposition canvas |

---

### 5.8 Infographics Grid (`.infographics-grid`)

3-column metric card grid rendered in the Core tab:

```
.infographic-card
├── .infographic-value  (large number/stat)
├── .infographic-title  (metric name)
└── .infographic-desc   (short description)
```

---

### 5.9 Mastery Quiz

Rendered in the `mastery` tab from `data.masteryAssessment[]`.

```
.quiz-container
├── .quiz-header (Question X of Y)
├── .quiz-question-text
├── .quiz-options-grid
│   └── .quiz-option-btn × 4  (data-index attribute)
└── .quiz-explanation (hidden until answered)
```

**States:**
- Default: all options neutral
- Selected correct: `.correct` class (green)
- Selected wrong: `.wrong` class (red) + show explanation
- After answer: all options disabled

---

### 5.10 Download Notes Button (`.download-notes-btn`)

- **Position:** Top-right of chapter info section
- **Gradient:** `--primary` to `--secondary` (left to right)
- **Text color:** `#0a0c10` (dark, for contrast on gold)
- **Hover:** `translateY(-2px)` + enhanced box shadow
- **On click:** calls `downloadChapterNotes()` → generates Blob → triggers `<a>` download

---

## 6. Interaction Specifications

### 6.1 Chapter Selection

| Trigger | Action |
|---|---|
| Click `.nav-chapter-item` | Calls `selectChapter(id)` |
| Chapter loaded from cache | `renderChapterView(data, part)` |
| Chapter needs fetch | `injectChapterScript(src)` → `renderChapterView` |
| Chapter script 404 | `renderStubChapter(id)` with generated stub data |
| Mobile sidebar open | Auto-closes on `selectChapter()` |

### 6.2 Lesson Pill Click

1. Remove `.active` from all pills
2. Add `.active` to clicked pill
3. Call `showLessonFocus(lessonTitle)`
4. Look up `lessonVisualsMap[lessonTitle]`
5. If match: show visual segment with image + caption
6. Else: hide visual segment
7. Smooth scroll to card: `scrollIntoView({ behavior: 'smooth', block: 'nearest' })`

### 6.3 Tab Switch

1. Remove `.active` from all `.tab-btn`
2. Add `.active` to clicked tab button
3. Hide all `.tab-panel` via `.hidden`
4. Show matching panel
5. If `visual` tab: call `renderMermaidDiagrams(data)` to render all 5 diagrams

### 6.4 Quiz Interaction

1. User clicks `.quiz-option-btn`
2. Check against `masteryAssessment[i].correct`
3. Apply `.correct` or `.wrong` class
4. Reveal `.quiz-explanation`
5. Disable all option buttons
6. Show "Next Question" button (if multi-question)

### 6.5 Settings Modal

| Action | Trigger |
|---|---|
| Open | Click `#settings-btn` |
| Close | Click `#settings-close-btn` OR click overlay backdrop |
| Profile change | `input[type=radio]` `change` event → update `activeLearningProfile` |

### 6.6 Main Viewport Tap (Mobile)

Tapping `.main-viewport` when sidebar is open triggers `sidebar.classList.remove('open')` — auto-dismiss.

---

## 7. Responsive Breakpoints

### 7.1 Breakpoint Table

| Breakpoint | Width | Changes |
|---|---|---|
| Desktop | `>1024px` | Full sidebar always visible, 2-col grid layouts |
| Tablet | `≤1024px` | Sidebar becomes off-screen overlay, toggle button visible |
| Mobile | `≤600px` | Header stacks vertically, single column layouts throughout |

### 7.2 Mobile-Specific Overrides (`≤600px`)

```css
.header            → flex-direction: column
.header-left       → width: 100%, space-between
.header-right      → flex-wrap: wrap, full width
.lesson-visual-layout → grid-template-columns: 1fr (stacked)
.pm-blueprint      → grid-template-columns: 1fr
.network-grid      → grid-template-columns: 1fr
.persona-card-box  → flex-direction: column
```

### 7.3 Tab Navigation on Mobile

`.tabs-nav` uses `overflow-x: auto` + `white-space: nowrap` so tabs scroll horizontally without wrapping.

---

## 8. Tab Rendering Logic

### 8.1 Core Tab (`renderCoreTab(data)`)

Renders in sequence:
1. Learning Objectives (`#core-objectives`)
2. Key Definitions grid (`#core-definitions`)
3. Intuition card (`#core-intuition`)
4. Frameworks cards (`#core-frameworks`)
5. Comparison table (`#core-comparison`)
6. Infographics grid (`#core-infographics`)
7. Examples section (`#core-examples`)
8. Practical Applications (`#core-practicals`)
9. Common Mistakes (`#core-mistakes`)
10. Cross-links list (`#core-cross-links`)
11. Memory Techniques (`#core-memory-techniques`)

### 8.2 Visual Tab (`renderVisualTab(data)`)

1. Roadmap timeline (`#visual-roadmap-container`)
2. Mermaid diagrams — 5 types:
   - `#mermaid-mindmap` — mindmap
   - `#mermaid-flowchart` — flowchart
   - `#mermaid-knowledge-graph` — knowledge graph
   - `#mermaid-concept-map` — concept map
   - `#mermaid-decision-tree` — decision tree
3. Textbook figures grid (`#textbook-visuals-grid`)

### 8.3 Assessment Tab (`renderAssessmentTab(data)`)

1. Interview Questions with accordion
2. MBA Exam Questions
3. Scenario Questions
4. Practice Exercises list
5. Assignments list

---

## 9. Mermaid Rendering Pipeline

### 9.1 Initialization

```js
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    background: 'transparent',
    primaryColor: '#d8a84a',
    primaryTextColor: '#eae6df',
    lineColor: '#7d7973',
    fontFamily: "'Inter', sans-serif"
  }
});
```

### 9.2 Render Flow

```
data.[mindMaps|flowcharts|...] string
  → Set innerHTML of container div
  → mermaid.run({ nodes: [containerEl] })
  → SVG injected by Mermaid
  → CSS overrides applied for theme contrast
```

### 9.3 SVG Contrast Fix

```css
.mermaid-container svg text,
.mermaid-container svg tspan { fill: var(--text-primary) !important; }
.mermaid-container svg .label foreignObject { color: var(--text-primary) !important; }
```

### 9.4 Mindmap Indentation Rule

Mermaid mindmaps require strict 2-space indentation per level. The stub generator uses template literals with consistent spacing to avoid parse errors.

---

## 10. Animation Specifications

### 10.1 Page Load Animations

| Element | Animation | Duration | Easing |
|---|---|---|---|
| `.welcome-card` | `fadeIn` (opacity 0→1) | `0.6s` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `.card` reveal | `slideDown` (translateY -10px → 0) | `0.4s` | `ease` |
| Sidebar nav items | `fadeIn` stagger | `0.3s` | `ease` |

### 10.2 Interactive Animations

| Interaction | Animation |
|---|---|
| Tab switch | Fade in tab panel `0.3s ease` |
| Lesson pill click | Focus card `slideDown` |
| Download button hover | `translateY(-2px)` + shadow expand |
| Nav item hover | Background color fade `0.2s` |
| Quiz option hover | Border color + background `0.2s` |
| Quiz answer reveal | Explanation `fadeIn 0.3s` |
| Sidebar open/close (mobile) | `left` property `0.3s cubic-bezier(0.4, 0, 0.2, 1)` |
| Textbook image hover | `scale(1.05)` on `img` `0.5s ease` |

### 10.3 Keyframe Definitions

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

## 11. CSS Naming Conventions

### 11.1 BEM-Inspired Pattern

```
.component-name          → block
.component-name-element  → element (hyphen separated)
.component-name--state   → modifier (double hyphen)
```

### 11.2 Common Patterns

| Pattern | Example |
|---|---|
| Container | `.sidebar`, `.header`, `.chapter-view` |
| Card surface | `.card`, `.lesson-focus-card`, `.settings-modal-card` |
| Action buttons | `.btn`, `.download-notes-btn`, `.tab-btn` |
| State modifiers | `.active`, `.hidden`, `.open`, `.correct`, `.wrong` |
| ID-based anchors | `#sidebar-nav`, `#chapter-title`, `#lesson-focus-card` |
| Grid layouts | `.two-col-grid`, `.definitions-grid`, `.infographics-grid` |
| Typography | `.section-title`, `.chapter-title`, `.hero-title` |

### 11.3 CSS Variable Naming

```
--category-variant
--bg-main, --bg-card, --bg-sidebar
--text-primary, --text-secondary, --text-muted
--border-card
--shadow-sm, --shadow-lg
--font-heading, --font-body
```

---

## 12. Accessibility Notes

> [!WARNING]
> The current implementation has accessibility gaps that should be addressed in future iterations.

### 12.1 Current State

| Feature | Status | Notes |
|---|---|---|
| Semantic HTML | ⚠️ Partial | `<aside>`, `<main>`, `<header>` used but tabs lack `role="tablist"` |
| Keyboard Navigation | ❌ Missing | Tab pills and quiz options not keyboard accessible |
| ARIA Labels | ❌ Missing | No `aria-label`, `aria-selected`, or `aria-expanded` attributes |
| Color Contrast | ✅ Good | Gold on dark charcoal passes WCAG AA at most sizes |
| Focus Indicators | ⚠️ Partial | Browser default focus rings, no custom focus styles |
| Screen Reader | ❌ Not tested | Mermaid SVGs have no alt text |
| Touch Targets | ✅ Good | All interactive elements ≥ 40px touch target |
| Font Scaling | ✅ Good | `rem`-based sizing respects browser font preferences |

### 12.2 Priority Accessibility Fixes (Future Tickets)

1. Add `role="tablist"` and `role="tab"` to tab navigation
2. Add `aria-label` to icon-only buttons (settings gear, close buttons)
3. Add `aria-selected` to active nav items and tabs
4. Add `alt` text to all textbook figure images
5. Implement keyboard arrow key navigation for lesson pills
6. Add skip-to-content link for screen readers
7. Add `aria-live` region for quiz feedback announcements
