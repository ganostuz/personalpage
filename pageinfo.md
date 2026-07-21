# Personal Website — Build Spec

**Purpose of this doc:** hand this to an AI coding assistant (or developer) and get a working site in one session. No back-and-forth needed — every decision is pre-made below.

---

## 1. Goal & Audience

**One-sentence goal:** a permanent, googleable home base that proves "this person is good at applied AI / LLM systems" in under 2 minutes, and hosts links to blog posts and repos as they ship.

**Who lands here:**
- Erasmus Mundus / master's admissions readers
- JIC, Entrepreneur First, founders/investors doing a background check before a meeting
- Anyone who reads a blog post on X/LinkedIn and clicks through

**What it is NOT:** not a blog engine, not a CMS, not a place for frequent updates. It's a static shell that occasionally gets a new post added to it.

---

## 2. Tech Stack (decided — do not deviate)

- **Plain HTML + CSS + JS.** No React, no Next.js, no build step, no npm dependencies.
- **Content for posts written in Markdown**, converted to HTML pages either:
  - by hand once in a while (fine at this volume — a few posts a year), or
  - via a single lightweight static-site tool if the developer AI prefers (Jekyll works natively with GitHub Pages, zero config) — **optional, not required.**
- **Hosting:** GitHub Pages (free, matches the "public repo" habit already in place).
- **Domain:** custom domain (e.g. `yourname.dev` or `.com`) pointed at GitHub Pages via CNAME. Domain purchase is separate from the dev task — assume it will be configured after.
- **No backend, no database, no forms that submit anywhere** (a contact link/email is enough — do not build a contact form backend).
- **Analytics (optional, low priority):** a single privacy-friendly script tag (e.g. Plausible or GoatCounter) if trivial to add; skip if it adds any complexity.
---

## 3. Site Structure (pages) debatable

```
/                → Home
/about           → About / Bio
/writing/        → Blog post index
/writing/<slug>  → Individual blog post pages
/projects        → Projects / repos
(optional later) /now → a "now page" — skip for v1
...
```

Keep it to a **single-level nav**: Home · Writing · Projects · About. No dropdowns, no mega-menus.

### 3.1 Home page (`/`)
Above the fold, in this order:
1. **Name + one-line identity statement.** 
2. **2–3 sentence bio**, third-or-first person, plain language: final-year CS student at Masaryk University, building an automated LLM testing suite at Lexical Computing (also his bachelor's thesis), interested in AI systems evaluation.
3. **Links row:** GitHub, LinkedIn, X, email — icons + text, not icons alone.
4. **"Latest writing"** — auto-pull (or manually list) the 2–3 most recent posts, title + one-line summary + date.
5. **"Selected projects"** — 1–3 cards, each: project name, one-line problem→approach→result summary, link to repo/demo.

### 3.2 Writing index (`/writing/`)
Simple reverse-chronological list: date, title, one-line summary, link. No categories/tags system needed until there are >10 posts.

### 3.3 Individual post page
- Title, publish date, estimated reading time (optional).
- Body content (Markdown → HTML).
- No comments section. No related-posts widget. A single "back to writing" link and the social links row at the bottom is enough.
- Must render code blocks cleanly (monospace font, syntax highlighting via a lightweight CSS-only or single-file JS highlighter like highlight.js from a CDN — no build step).

### 3.4 Projects page
For each project (start with the thesis / LLM testing suite once public-cleared):
- Name
- One-paragraph problem → approach → result (matches the README structure already planned in the career roadmap)
- Tech stack used (short tag list)
- Links: repo, live demo/screencast if it exists

### 3.5 About page
Slightly longer version of the home bio: background, what he's working on, what he's looking for (learning-dense roles, people, ownership — no need to state this explicitly, but the tone should read as someone building toward technical leadership / founding, not job-hunting generically). Keep it under 300 words. No headshot required but recommended if one exists.

---

## 4. Design Direction

- **Typography-led, not graphics-led.** This is a technical/engineering audience — a clean serif or humanist sans for body text, a monospace accent for code/tags, generous whitespace, no illustrations, no gradients-as-decoration.
- **Dark-mode-friendly** (either a toggle or a `prefers-color-scheme` media query) — this audience expects it, and it's near-zero extra effort with CSS variables.
- **Fast and lightweight**: no web fonts beyond 1–2 weights if possible (system font stack is acceptable and arguably preferable), no unnecessary JS, no image carousels.
- **Mobile-first responsive**: single column, readable line length (~65–75 characters), nav collapses to a simple horizontal list (no hamburger needed at only 4 items).
- Reference tone: something closer to a well-known engineer's personal blog (plain, content-forward, monospace accents) than a polished "personal brand" template with big marketing-style hero sections.

---

## 5. File Structure (suggested)

```
/
├── index.html
├── about.html
├── projects.html
├── writing/
│   ├── index.html
│   └── posts/
│       ├── post-slug-1.html
│       └── post-slug-2.html
├── assets/
│   ├── css/style.css
│   ├── js/main.js         (only if needed — dark mode toggle, etc.)
│   └── img/
├── CNAME                  (custom domain config for GitHub Pages)
└── README.md              (repo README — problem/approach/result-style, since this repo is itself public)
```

If using Jekyll instead of hand-written HTML: standard Jekyll structure (`_config.yml`, `_posts/`, `_layouts/`, `_includes/`) — GitHub Pages builds it automatically with zero extra config, no build step needed on the dev's end either.

---

## 6. Content Inputs (give these to the developer AI as real copy, not placeholder)

- **Name:** Stanislav Guzej
- **Location:** Brno, Czechia (studying) / Košice, Slovakia (from)
- **Current role:** Final-year BSc student, Faculty of Informatics, Masaryk University; part-time at Lexical Computing building an automated LLM testing suite (also his bachelor's thesis)
- **Identity line / north star:** reliable evaluation and testing of AI/LLM systems
- **Links:** GitHub, LinkedIn, X — [fill in URLs], email — guzej.sta@gmail.com
- **First project entry (once public-cleared per the career roadmap's Lexical sign-off step):** the LLM testing suite / thesis project
- **First blog post (target: by 2026-11-30 per roadmap):** "How I prototype with an LLM workflow, then rewrite to production."

Do not invent bio details, past projects, or credentials not listed above — leave clearly marked placeholders (`[PROJECT NAME]`, `[LINK]`) for anything not yet confirmed, rather than filling with generic filler text.

---

## 7. SEO / Metadata basics (cheap, do it)

- `<title>` and `<meta name="description">` unique per page.
- Open Graph tags (`og:title`, `og:description`, `og:image` — a simple 1200×630 text-on-background card is enough) so links preview well when shared on X/LinkedIn.
- A `sitemap.xml` and `robots.txt` — trivial to generate, worth having.
- Semantic HTML (`<header>`, `<main>`, `<article>`, `<nav>`) for accessibility and SEO, not just `<div>` soup.

---

## 8. Deployment Steps (for the developer AI to execute or document)

1. Create GitHub repo (public — the repo itself is a small artifact).
2. Push the site files to the `main` branch (or a `docs/` folder / `gh-pages` branch, per GitHub Pages settings).
3. Enable GitHub Pages in repo settings, pointed at the correct branch/folder.
4. Add `CNAME` file with the custom domain once purchased.
5. Configure DNS at the domain registrar: `A` records to GitHub Pages IPs (or `CNAME` record if using a subdomain) — GitHub's own Pages docs have the current IPs; developer AI should verify current values since they can change.
6. Confirm HTTPS is enforced (GitHub Pages provides free TLS — just check the box in settings once DNS propagates).

---

## 9. Explicit Non-Goals (tell the developer AI not to add these)

- No CMS, no admin panel, no login.
- No comments system.
- No contact form with a backend — a `mailto:` link is sufficient.
- No client-side framework, no bundler, no `package.json` unless Jekyll is used (in which case only Jekyll's own minimal deps).
- No animation libraries, no carousels, no cookie-consent banners (no tracking that requires one).
- No multi-language support.
- No premature tagging/category taxonomy for blog posts.

---

## 10. Priority / Sequencing

Matches the career roadmap timeline — build in this order, and it's fine to ship v1 without everything:

1. **v1 (this week, before 2026-11-30):** Home, About, Projects (can be empty/"coming soon" state), Writing index (empty), basic styling, deployed and live on the custom domain.
2. **By 2026-11-30:** First blog post published, linked from Home and Writing index.
3. **Ongoing:** add a project entry and a blog post roughly every 6–8 weeks, matching the "one artifact every 6–8 weeks" cadence in the career roadmap.

**Definition of done for v1:** a stranger can land on the homepage, understand the spike (AI/LLM systems evaluation) in under 10 seconds, and reach GitHub/LinkedIn/X in one click.
