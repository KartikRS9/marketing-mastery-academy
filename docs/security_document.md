# 🔐 Security & Access Control Document
## Marketing Mastery — Static PWA

> **Document Version:** 1.0  
> **Date:** 2026-08-04  
> **Classification:** Internal / Developer Reference  
> **Repository:** [github.com/KartikRS9/marketing-mastery](https://github.com/KartikRS9/marketing-mastery) *(private)*  
> **App Type:** Fully Static, Client-Side Only Progressive Web App (PWA)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Application Architecture Overview](#2-application-architecture-overview)
3. [Threat Model](#3-threat-model)
4. [Attack Surface Analysis](#4-attack-surface-analysis)
5. [Data Privacy Assessment (GDPR / Data Minimization)](#5-data-privacy-assessment-gdpr--data-minimization)
6. [Content Security Policy (CSP) Recommendations](#6-content-security-policy-csp-recommendations)
7. [HTTPS Enforcement](#7-https-enforcement)
8. [Service Worker Security Considerations](#8-service-worker-security-considerations)
9. [localStorage Limitations & Risks](#9-localstorage-limitations--risks)
10. [XSS Risk Assessment (innerHTML in app.js)](#10-xss-risk-assessment-innerhtml-in-appjs)
11. [Dependency Risk — CDN Libraries](#11-dependency-risk--cdn-libraries)
12. [GitHub Repository Access Controls](#12-github-repository-access-controls)
13. [Intellectual Property & Copyright Considerations](#13-intellectual-property--copyright-considerations)
14. [Recommendations for Future Authentication (If Backend is Added)](#14-recommendations-for-future-authentication-if-backend-is-added)
15. [Security Checklist](#15-security-checklist)

---

## 1. Executive Summary

Marketing Mastery is a **fully static, client-side-only** Progressive Web App (PWA). It has no backend server, no database, no user accounts, and no Personal Identifiable Information (PII) collection. This architecture eliminates entire categories of server-side vulnerabilities (SQL injection, server-side RCE, authentication bypass, etc.).

The residual risk surface is **narrow but real**, primarily encompassing:
- Client-side XSS via unsafe `innerHTML` usage
- CDN supply-chain risks (Mermaid, FontAwesome, Google Fonts)
- Service worker cache poisoning
- localStorage data integrity
- Intellectual property exposure of textbook-sourced content
- GitHub repository access control

**Overall Risk Rating: LOW** — with specific mitigations recommended in this document.

---

## 2. Application Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  USER BROWSER                       │
│                                                     │
│  ┌──────────┐   ┌─────────────┐   ┌─────────────┐  │
│  │  index   │   │   app.js    │   │  SW Cache   │  │
│  │  .html   │──▶│  (Logic)    │──▶│ (Offline)   │  │
│  └──────────┘   └─────────────┘   └─────────────┘  │
│        │               │                            │
│        ▼               ▼                            │
│  ┌──────────┐   ┌─────────────┐                    │
│  │  CDN     │   │localStorage │                    │
│  │Libraries │   │(theme/prog) │                    │
│  └──────────┘   └─────────────┘                    │
└─────────────────────────────────────────────────────┘
         │
         ▼
  GitHub Pages (HTTPS) or Python http.server (local)

NO backend. NO database. NO user auth. NO API keys.
```

**Data Flows:**
| Flow | Direction | Sensitivity |
|------|-----------|-------------|
| Static assets (HTML/CSS/JS) | Server → Browser | None |
| CDN libraries | CDN → Browser | None (public) |
| Theme preference | Browser → localStorage | Non-sensitive |
| Progress tracking | Browser → localStorage | Non-sensitive |
| Service Worker cache | Browser ↔ Cache API | Non-sensitive |

---

## 3. Threat Model

### 3.1 Methodology
Using a simplified **STRIDE** (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) model adapted for a static client-side application.

### 3.2 Assets to Protect

| Asset | Value | Location |
|-------|-------|----------|
| App source code | Medium | GitHub repo (private) |
| Textbook-derived content | High (IP) | Static JS/HTML files |
| User progress data | Low | localStorage (client only) |
| Theme preference | Very Low | localStorage (client only) |

### 3.3 Threat Actors

| Actor | Motivation | Capability |
|-------|-----------|-----------|
| **Casual User** | Curiosity / data exploration | Low — browser DevTools |
| **Competitor / Scraper** | Steal educational content | Medium — automated scraping |
| **Supply-Chain Attacker** | Compromise CDN libraries | High — infects millions of sites |
| **XSS Attacker** | Inject malicious scripts via URL params or dynamic content | Medium |
| **Repository Attacker** | Steal source or push malicious code | Medium — phishing, credential theft |
| **IP Enforcement Actor** | Copyright claim on textbook content | Legal / DMCA |

### 3.4 STRIDE Threat Map

| Threat Category | Relevant Attack | Likelihood | Impact | Mitigation |
|----------------|----------------|-----------|--------|-----------|
| **S**poofing | Attacker serves a lookalike phishing page | Low | Medium | HTTPS + HSTS (§7) |
| **T**ampering | Service worker cache poisoning | Low | High | SW integrity checks (§8) |
| **T**ampering | localStorage manipulation by user | Low | Low | Accept as by-design |
| **R**epudiation | No audit trail of user actions | N/A | None | No auth = no repudiation needed |
| **I**nformation Disclosure | PII leak via localStorage | None | None | No PII stored |
| **I**nformation Disclosure | CDN exfiltration of page context | Medium | Low | CSP (§6) |
| **D**enial of Service | CDN outage makes app unavailable online | Medium | Medium | SW offline caching (by design) |
| **E**levation of Privilege | XSS leading to persistent script in SW | Low | High | innerHTML audit (§10) |

---

## 4. Attack Surface Analysis

### 4.1 Surface Inventory

| Surface | Description | Risk Level |
|---------|-------------|-----------|
| `index.html` | Static HTML entry point | 🟡 Low-Medium |
| `app.js` | Core application logic; uses `innerHTML` | 🟠 Medium |
| `sw.js` | Service worker; controls cache | 🟡 Low-Medium |
| `localStorage` | Stores theme & progress | 🟢 Low |
| CDN endpoints (Mermaid, FA, GFonts) | External JavaScript/CSS | 🟠 Medium |
| GitHub Pages HTTPS delivery | Asset serving | 🟢 Low |
| GitHub Repo (private) | Source code & content | 🟡 Low-Medium |
| Python `http.server` (local dev) | Local development only | 🟡 Low (local only) |

### 4.2 Non-Surfaces (Eliminated by Architecture)

> [!NOTE]
> The following attack surfaces **do not exist** in this application due to the static-only design:

- ❌ SQL Injection — No database
- ❌ Server-Side RCE — No backend server
- ❌ Authentication bypass — No auth system
- ❌ Session hijacking — No sessions
- ❌ CSRF — No state-changing server endpoints
- ❌ API key exposure — No API keys used
- ❌ PII data breach — No PII collected or stored

### 4.3 Python `http.server` — Local Dev Warning

> [!WARNING]
> Python's built-in `http.server` is **not production-grade** and should **never be exposed to the public internet**. It has no HTTPS, no access controls, and known DoS vulnerabilities. Restrict to `localhost` only during development.

```bash
# SAFE: Bind only to localhost
python -m http.server 8080 --bind 127.0.0.1

# UNSAFE: Default binding (all interfaces)
python -m http.server 8080
```

---

## 5. Data Privacy Assessment (GDPR / Data Minimization)

### 5.1 Data Inventory

| Data Element | Storage | Retention | PII? | Legal Basis Needed? |
|-------------|---------|-----------|------|---------------------|
| Theme preference (`dark`/`light`) | localStorage | Until cleared | No | No |
| Module progress (completed array) | localStorage | Until cleared | No | No |
| Quiz scores / tracking | localStorage | Until cleared | No | No |
| Browser fingerprint | Not collected | N/A | Potentially | No |
| IP address | Not collected by app | N/A | Yes | No (not collected) |
| Cookies | Not set by app | N/A | N/A | No |

### 5.2 GDPR Compliance Status

| GDPR Principle | Status | Notes |
|---------------|--------|-------|
| **Lawfulness, fairness, transparency** | ✅ Compliant | No personal data collected |
| **Purpose limitation** | ✅ Compliant | localStorage used only for UX |
| **Data minimisation** | ✅ Excellent | Only functional, non-personal data |
| **Accuracy** | ✅ Compliant | User controls their own localStorage |
| **Storage limitation** | ✅ Compliant | localStorage persists only per-device, user-controlled |
| **Integrity & confidentiality** | ✅ Compliant | No sensitive data; served over HTTPS |
| **Accountability** | ✅ Compliant | No processor/controller relationship for personal data |

### 5.3 CDN Third-Party Data Considerations

> [!IMPORTANT]
> While the **app itself** collects no data, **CDN providers** (Google Fonts, FontAwesome CDN) may log IP addresses and browser metadata of visitors as part of their infrastructure. This is outside your control but should be disclosed in a privacy policy if the app is publicly hosted.

**Recommendation:** Consider self-hosting Google Fonts and FontAwesome to eliminate this third-party data exposure entirely.

```html
<!-- Instead of CDN: -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter...">

<!-- Self-host fonts for full control: -->
<link rel="stylesheet" href="/assets/fonts/inter.css">
```

### 5.4 Cookie Notice Requirement

**Not required.** The app sets no cookies and collects no tracking data. If Google Fonts CDN is removed, no third-party data exposure exists.

---

## 6. Content Security Policy (CSP) Recommendations

### 6.1 Why CSP Matters Here

Even in a static app, a strong CSP prevents:
- XSS attacks from injecting and executing scripts
- Data exfiltration to attacker-controlled domains
- Clickjacking via iframe embedding
- Malicious resource loading

### 6.2 Recommended CSP Header

For **GitHub Pages** (add via `_headers` file if using Netlify, or meta tag for GitHub Pages):

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self'
              https://cdn.jsdelivr.net
              https://cdnjs.cloudflare.com
              'sha256-<MERMAID_HASH>'
              'sha256-<FONTAWESOME_HASH>';
  style-src 'self'
            https://fonts.googleapis.com
            https://cdnjs.cloudflare.com
            'unsafe-inline';
  font-src 'self'
           https://fonts.gstatic.com
           https://cdnjs.cloudflare.com;
  img-src 'self' data:;
  connect-src 'none';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'none';
  upgrade-insecure-requests;
```

> [!NOTE]
> GitHub Pages does not support custom HTTP headers natively. Use a `<meta>` CSP tag in `index.html` as a fallback (less powerful but still effective for script-src):

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; ...">
```

### 6.3 CSP Directives Explained

| Directive | Value | Rationale |
|-----------|-------|-----------|
| `default-src` | `'self'` | Deny all unlisted origins by default |
| `script-src` | `'self'` + CDN origins | Allow only known CDN endpoints |
| `style-src` | `'unsafe-inline'` allowed | Required for dynamic theming; ideally hash-based |
| `connect-src` | `'none'` | App makes no network requests after load |
| `frame-ancestors` | `'none'` | Prevents clickjacking via iframe embedding |
| `form-action` | `'none'` | No forms in app; block exfiltration |
| `upgrade-insecure-requests` | — | Force HTTPS on all sub-resources |

### 6.4 CSP Violation Reporting (Optional Future)

```http
Content-Security-Policy-Report-Only: ...; report-uri https://your-csp-report-endpoint.com/;
```

Use in `Report-Only` mode first to detect violations before enforcing.

---

## 7. HTTPS Enforcement

### 7.1 GitHub Pages (Production)

GitHub Pages **enforces HTTPS by default** for all `github.io` subdomains. For custom domains:

- ✅ Enable "Enforce HTTPS" in repository Settings → Pages
- ✅ Verify TLS certificate is provisioned (Let's Encrypt via GitHub)
- ✅ Confirm HSTS header is sent (GitHub Pages sets this automatically)

### 7.2 HTTP Strict Transport Security (HSTS)

GitHub Pages automatically sends:
```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

This instructs browsers to **never connect over plain HTTP** for one year.

### 7.3 Local Development

For local Python `http.server`, HTTPS is **not available** by default.

**Options for local HTTPS:**
```bash
# Option 1: mkcert (recommended for dev)
mkcert -install && mkcert localhost
python -m http.server --bind 127.0.0.1 8080  # use with proxy

# Option 2: Use Vite or serve with SSL support for development
npx serve --ssl-cert cert.pem --ssl-key key.pem .
```

> [!TIP]
> Service workers **require HTTPS** (or localhost). Testing service workers on plain HTTP over a network will fail silently. Always test PWA features on `localhost` or an HTTPS origin.

---

## 8. Service Worker Security Considerations

### 8.1 Service Worker Threat Profile

The service worker (`sw.js`) acts as a network proxy between the browser and the server. A compromised or buggy service worker can:
- Serve stale/malicious cached content
- Intercept and modify responses
- Persist malicious behavior even after page reload (survives navigation)

### 8.2 Current Risk Assessment

| Risk | Likelihood | Impact | Notes |
|------|-----------|--------|-------|
| Cache poisoning via MITM | Very Low | High | Prevented by HTTPS |
| SW serving stale XSS payload | Low | High | Mitigated by cache versioning |
| Infinite SW update loop | Low | Medium | Use proper lifecycle management |
| SW scope too broad | Low | Medium | Verify scope is limited to app root |

### 8.3 Recommendations

**1. Cache Versioning** — Bust cache on every deployment:
```javascript
const CACHE_NAME = 'marketing-academy-v1.2.3'; // Increment on every release
```

**2. Scope Restriction** — Register SW with minimal scope:
```javascript
navigator.serviceWorker.register('/sw.js', { scope: '/' });
```

**3. Cache Allowlist** — Only cache known, owned assets:
```javascript
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
  // CDN resources: cache with caution (see §11)
];
```

**4. Avoid Caching CDN Scripts by Default** — If a CDN script is cached and later found to be compromised, the SW will continue serving the malicious version. Either:
- Self-host critical libraries, OR
- Use Subresource Integrity (SRI) before caching CDN content

**5. Update Lifecycle** — Force SW update on new deployment:
```javascript
self.addEventListener('install', event => {
  self.skipWaiting(); // Activate new SW immediately
});
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim()); // Take control immediately
});
```

---

## 9. localStorage Limitations & Risks

### 9.1 What is Stored

| Key | Value Type | Example |
|-----|-----------|---------|
| `theme` | String | `"dark"` |
| `progress` | JSON array | `["module1", "module3"]` |
| Quiz state / scores | JSON object | `{quiz1: 80, quiz2: 95}` |

### 9.2 Inherent Limitations of localStorage

| Limitation | Impact on This App |
|------------|-------------------|
| **Origin-scoped only** | Data siloed per domain — ✅ by design |
| **No encryption** | Data readable in DevTools — ✅ acceptable (non-sensitive) |
| **Synchronous API** | Can block main thread for large data — 🟡 monitor if data grows |
| **~5MB browser limit** | Sufficient for progress data — ✅ |
| **No cross-tab sync** (without `storage` events) | Progress may be inconsistent across tabs — 🟡 minor UX issue |
| **Cleared on "Clear Site Data"** | User loses progress — ✅ acceptable; no server backup expected |
| **Not accessible in incognito** (after session) | Progress lost after incognito session — ✅ by design |
| **Shared with all same-origin scripts** | XSS can read localStorage — 🔴 see §10 |

### 9.3 XSS + localStorage Risk

> [!CAUTION]
> If an XSS vulnerability is successfully exploited (see §10), an attacker's script can read, modify, or delete all localStorage data. Since the data is non-PII and non-sensitive, the **confidentiality impact is low**. However, a persistent XSS via localStorage manipulation could degrade user experience.

**Mitigation:** Validate and sanitize any data **read from** localStorage before using it in the DOM:

```javascript
// UNSAFE: Directly using localStorage value in DOM
document.getElementById('theme').className = localStorage.getItem('theme');

// SAFER: Validate against known values
const theme = localStorage.getItem('theme');
const safeTheme = ['dark', 'light'].includes(theme) ? theme : 'light';
document.getElementById('theme').className = safeTheme;
```

---

## 10. XSS Risk Assessment (innerHTML Usage in app.js)

### 10.1 Risk Overview

> [!WARNING]
> **`innerHTML` is the primary XSS vector in this application.** Any use of `innerHTML` with data that could be influenced by an attacker (URL parameters, localStorage, external data) creates XSS risk.

### 10.2 innerHTML Usage Audit

Audit all occurrences in `app.js`:

```bash
# Run this to find all innerHTML assignments
grep -n "innerHTML" app.js
```

**Classify each usage:**

| Classification | Example | Risk |
|---------------|---------|------|
| 🟢 **Static string literal** | `el.innerHTML = '<h2>Welcome</h2>'` | None — no user input |
| 🟡 **From static JS data** | `el.innerHTML = modules[id].content` | Low — if data is developer-controlled |
| 🟠 **From localStorage** | `el.innerHTML = localStorage.getItem('note')` | Medium — user-controlled |
| 🔴 **From URL parameter** | `el.innerHTML = new URLSearchParams(location.search).get('q')` | **HIGH — immediate XSS** |

### 10.3 Immediate Recommendations

**Replace `innerHTML` with safer alternatives wherever possible:**

```javascript
// ❌ UNSAFE
element.innerHTML = userControlledString;

// ✅ SAFE: For plain text
element.textContent = userControlledString;

// ✅ SAFE: For trusted HTML structure (developer-authored content)
// Acceptable only when content is 100% developer-controlled, never from user input

// ✅ BEST PRACTICE: Use DOMPurify for any rich HTML from semi-trusted sources
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(htmlString);
```

**Add DOMPurify as a sanitization layer:**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.1.5/purify.min.js"
        integrity="sha256-<HASH>"
        crossorigin="anonymous"></script>
```

### 10.4 URL Parameter Handling

> [!CAUTION]
> If the app uses URL parameters (e.g., `?module=intro`) to control displayed content, **never** pass URL param values directly to `innerHTML`. Always map to a known allowlist:

```javascript
// ❌ DANGEROUS
const module = new URLSearchParams(location.search).get('module');
contentDiv.innerHTML = moduleData[module]; // XSS if module key is crafted

// ✅ SAFE
const VALID_MODULES = ['intro', 'chapter1', 'chapter2', 'quiz1'];
const requestedModule = new URLSearchParams(location.search).get('module');
const safeModule = VALID_MODULES.includes(requestedModule) ? requestedModule : 'intro';
contentDiv.innerHTML = moduleData[safeModule]; // Safe: key validated
```

### 10.5 Mermaid Diagram XSS

Mermaid.js renders diagram definitions as SVG. If diagram definitions are loaded from developer-controlled static files — ✅ safe. If any user input can influence diagram definitions — 🔴 high risk, as Mermaid has had historical XSS issues with certain diagram types.

**Recommendation:** Pin Mermaid to a known-safe version and use SRI hashes (see §11).

---

## 11. Dependency Risk — CDN Libraries

### 11.1 Current CDN Dependencies

| Library | Use | CDN Provider | Risk Level |
|---------|-----|-------------|-----------|
| **Mermaid.js** | Diagram rendering | jsDelivr / unpkg | 🟠 Medium (XSS history) |
| **Font Awesome** | Icons | cdnjs / FA CDN | 🟡 Low-Medium |
| **Google Fonts** | Typography (Inter, etc.) | fonts.googleapis.com | 🟢 Low (CSS only) |

### 11.2 Supply Chain Risk

CDN-hosted scripts represent a **supply chain risk**: if the CDN or the library's npm package is compromised, malicious code runs in all users' browsers. This is not theoretical — several high-profile CDN compromises have occurred (e.g., Polyfill.io, 2024).

### 11.3 Subresource Integrity (SRI) — Critical Recommendation

> [!IMPORTANT]
> **Always use SRI hashes for every CDN-loaded JavaScript file.** This cryptographically verifies the file hasn't been tampered with.

```html
<!-- ❌ WITHOUT SRI — vulnerable to CDN compromise -->
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>

<!-- ✅ WITH SRI — safe even if CDN is compromised -->
<script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js"
        integrity="sha256-ACTUAL_BASE64_HASH_HERE"
        crossorigin="anonymous"></script>
```

**Generate SRI hashes:**
```bash
# Using openssl
curl -s https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js | \
  openssl dgst -sha256 -binary | openssl base64 -A

# Or use: https://www.srihash.org/
```

### 11.4 Library-Specific Risks

**Mermaid.js:**
- Has had documented XSS vulnerabilities in older versions (pre-9.x)
- Renders user-supplied diagram definitions; can execute scripts if input is unsanitized
- **Action:** Pin to latest stable version with SRI; ensure diagram definitions are static developer content only

**Font Awesome (CDN):**
- CSS + font files only — no JavaScript execution risk
- Privacy risk: CDN logs visitor IPs
- **Action:** Self-host for maximum privacy; use SRI for CSS

**Google Fonts:**
- CSS + font files; no JavaScript
- Google logs font requests (IP, user agent, referrer)
- **Action:** Self-host fonts for GDPR-clean deployment

### 11.5 Self-Hosting Strategy (Recommended)

```
assets/
├── fonts/
│   ├── inter-variable.woff2       # Self-hosted Google Font
│   └── inter.css
├── icons/
│   ├── fontawesome/
│   │   ├── css/all.min.css        # Self-hosted FontAwesome
│   │   └── webfonts/
└── js/
    └── mermaid.min.js             # Self-hosted Mermaid
```

---

## 12. GitHub Repository Access Controls

### 12.1 Current Status

The repository is **private** — a critical baseline security control that prevents public indexing of source code and educational content.

### 12.2 Recommended Access Control Settings

**Repository Settings:**
- ✅ Set to **Private**
- ✅ Enable **Branch Protection Rules** on `main`:
  - Require pull request reviews before merging
  - Require status checks to pass
  - Disable force pushes
  - Restrict direct pushes to `main`
- ✅ Enable **GitHub Advanced Security** (if available on plan):
  - Secret scanning
  - Dependency review
  - Code scanning (CodeQL)

**Collaborator Access:**
- Use **principle of least privilege** — grant only the minimum required role
- Review collaborator list quarterly
- Remove stale access immediately when a collaborator leaves

### 12.3 GitHub Pages Security

| Setting | Recommendation |
|---------|---------------|
| Pages source branch | Dedicate a `gh-pages` branch or `docs/` folder |
| Visibility | Public (required for GitHub Pages on free plan) |
| Custom domain | Enable HTTPS enforcement |
| Deploy keys | Use environment secrets, not personal tokens |

> [!WARNING]
> **GitHub Pages is always public**, even if the source repository is private. Any content in your deployed Pages site is publicly accessible on the internet. Ensure no sensitive files, API keys, or unpublished content are included in the Pages deployment.

### 12.4 Secrets Management

This app has **no secrets** (no API keys, no credentials). Maintain this posture:
- Never commit `.env` files
- Add `.env`, `*.key`, `*.pem` to `.gitignore`
- Enable GitHub Secret Scanning alerts

### 12.5 GitHub Actions (If Used for Deployment)

```yaml
# Recommended: Minimal permissions for deployment workflow
permissions:
  contents: read
  pages: write
  id-token: write
```

- Use `GITHUB_TOKEN` (auto-generated) instead of personal access tokens
- Pin action versions to full commit SHAs, not floating tags:

```yaml
# ❌ Floating tag — vulnerable to tag poisoning
uses: actions/checkout@v4

# ✅ Pinned SHA — immune to tag reassignment
uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683
```

---

## 13. Intellectual Property & Copyright Considerations

### 13.1 Content Source

The educational content in Marketing Mastery is derived from **Philip Kotler's marketing textbook(s)**. This raises significant intellectual property considerations.

### 13.2 Copyright Risk Assessment

> [!CAUTION]
> **Using substantial portions of a copyrighted textbook without a license is copyright infringement**, even for educational purposes. "Educational use" does not automatically create fair use protection in all jurisdictions.

| Usage Type | Risk Level | Notes |
|-----------|-----------|-------|
| Verbatim quotes (< 1 paragraph, attributed) | 🟡 Low | Generally fair use / fair dealing |
| Paraphrased summaries (attributed) | 🟢 Low | Typically acceptable |
| Substantial verbatim reproduction | 🔴 High | Likely infringement |
| Entire chapters / concepts | 🔴 High | Likely infringement |
| Diagrams / figures reproduced | 🔴 High | Separate copyright in visual works |
| Commercial use of derived content | 🔴 Very High | No fair use defense |

### 13.3 Fair Use / Fair Dealing Analysis

**Factors favoring fair use (US) / fair dealing (UK/Commonwealth):**
- Educational, non-commercial purpose
- Transformative nature (teaching tool vs. reference book)
- Small proportion of total work used
- No market substitution (app does not replace the textbook)

**Factors against fair use:**
- Systematic reproduction of structured content
- Commercial hosting platform (GitHub Pages is free but business-operated)
- Making content freely available reduces textbook sales

### 13.4 Recommendations

1. **Immediate:** Audit the content in the app and categorize it:
   - Original explanations (✅ safe)
   - Paraphrased concepts with citation (✅ likely safe)
   - Verbatim paragraphs (⚠️ review)
   - Reproduced frameworks/models (⚠️ review)

2. **Add Clear Attribution:** In the app footer and `README.md`:
   ```
   Content based on: Kotler, P., & Keller, K.L. (2016). Marketing Management (15th ed.). Pearson.
   This application is an independent educational tool and is not affiliated with or endorsed by the authors or publisher.
   ```

3. **Consider Obtaining Permission:** Contact Pearson Education's rights & permissions department for educational use licensing.

4. **Avoid Public Distribution of Infringing Content:** Keep the repository private and be cautious about publicizing the app to large audiences.

5. **Add Disclaimer:** Include a visible disclaimer in the app:
   ```
   Disclaimer: This is an independent study tool. All marketing concepts are presented for educational purposes.
   Philip Kotler's works are copyright of their respective owners.
   ```

---

## 14. Recommendations for Future Authentication (If Backend is Added)

Should the app evolve to include user accounts, progress syncing, or a backend API, implement these security controls from day one:

### 14.1 Authentication Framework

| Recommendation | Detail |
|---------------|--------|
| **Use OAuth 2.0 / OIDC** | Delegate auth to Google, GitHub, or Auth0 — don't implement your own |
| **No password storage** | Use magic links or SSO to avoid password hashing complexity |
| **JWT with short expiry** | Access tokens: 15 minutes; Refresh tokens: 7 days, rotated |
| **httpOnly cookies** | Store tokens in httpOnly, Secure, SameSite=Strict cookies — not localStorage |

### 14.2 Session Security

```http
Set-Cookie: session=<token>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400
```

> [!IMPORTANT]
> **Never store JWTs or session tokens in localStorage if sensitive data is involved.** localStorage is accessible by any JavaScript on the page, making it vulnerable to XSS token theft. Use httpOnly cookies instead.

### 14.3 API Security (If Backend API Added)

| Control | Implementation |
|---------|---------------|
| **CORS** | Restrict to known frontend origins only |
| **Rate limiting** | Limit per-IP and per-user request rates |
| **Input validation** | Validate all inputs server-side (never trust client) |
| **HTTPS only** | Enforce HTTPS on all API endpoints |
| **Authentication on all endpoints** | No unauthenticated data access to user-specific resources |
| **Audit logging** | Log all authentication events and sensitive operations |

### 14.4 Data Storage (If Backend Added)

| Control | Recommendation |
|---------|---------------|
| Passwords | Use **bcrypt** (cost factor ≥ 12) or **Argon2id** |
| PII at rest | Encrypt PII columns in database |
| Backups | Encrypt backups; test restore procedures |
| Secrets | Use environment variables or secrets manager (never hardcode) |

### 14.5 Privacy Impact (GDPR Trigger)

Adding user accounts **immediately triggers full GDPR compliance obligations**:
- Privacy Policy required
- Cookie consent banner (if using cookies)
- Data Subject Rights (access, erasure, portability)
- Data Processor agreements with any third parties
- Breach notification procedures (72-hour window to supervisory authority)

---

## 15. Security Checklist

Use this checklist before each deployment:

### Pre-Deployment
- [ ] All CDN `<script>` tags include SRI `integrity` attributes
- [ ] No API keys, tokens, or secrets present in source code
- [ ] `innerHTML` usages audited — no user/URL-controlled input passed to innerHTML
- [ ] localStorage values validated before use in DOM
- [ ] Service worker cache version incremented
- [ ] `.gitignore` includes `.env`, `*.key`, `*.pem`
- [ ] CSP meta tag present in `index.html`

### GitHub Repository
- [ ] Repository set to **Private**
- [ ] Branch protection enabled on `main`
- [ ] Collaborator access reviewed
- [ ] GitHub Pages HTTPS enforcement enabled
- [ ] Secret scanning alerts enabled

### Content & Legal
- [ ] Textbook content attribution displayed in app and README
- [ ] Disclaimer text visible in app footer
- [ ] No verbatim textbook reproductions without permission

### Python Dev Server
- [ ] `http.server` bound to `127.0.0.1` only (`--bind 127.0.0.1`)
- [ ] Dev server not exposed beyond localhost

---

## Appendix A — Useful Security Tools

| Tool | Purpose | URL |
|------|---------|-----|
| **SRI Hash Generator** | Generate SRI hashes for CDN resources | https://www.srihash.org/ |
| **CSP Evaluator** | Analyze your CSP for weaknesses | https://csp-evaluator.withgoogle.com/ |
| **Mozilla Observatory** | Full security header scan | https://observatory.mozilla.org/ |
| **DOMPurify** | XSS sanitization library | https://github.com/cure53/DOMPurify |
| **mkcert** | Local HTTPS certificates for dev | https://github.com/FiloSottile/mkcert |
| **OWASP Top 10** | Industry standard vulnerability reference | https://owasp.org/Top10/ |
| **Snyk** | Dependency vulnerability scanning | https://snyk.io/ |

---

## Appendix B — Security Contact & Review Schedule

| Item | Detail |
|------|--------|
| **Document Owner** | Repository maintainer (KartikRS9) |
| **Review Frequency** | Quarterly, or on major dependency updates |
| **Next Review Date** | 2026-11-01 |
| **Vulnerability Disclosure** | Submit via GitHub Private Security Advisory |

---

*Document generated: 2026-08-04 | Marketing Mastery Security Team*
