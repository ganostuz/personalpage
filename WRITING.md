# Publishing writing

The site uses Jekyll posts. The homepage, writing index, reading time, metadata, and sitemap update automatically from each post's front matter.

## One-time GitHub Pages setup

In the repository, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**. Keep `stanislavguzej.dev` configured as the custom domain and enable **Enforce HTTPS** after the deployment succeeds.

## Create a post

1. Copy `_templates/post.md` into `_posts/`.
2. Name it `YYYY-MM-DD-short-title.md`.
3. Replace the front matter and write the article in Markdown.
4. Remove `published: false` when the article is ready.
5. Commit and push to `master`; the Pages workflow builds and deploys the site.

Required front matter:

```yaml
---
title: Your article title
description: A concise summary used in lists and link previews.
topic: A short topic label
---
```

Add `demo: true` only for example content. Posts use clean URLs such as `/writing/short-title/`.

## Preview locally

Install Ruby and Bundler, then run:

```bash
bundle install
bundle exec jekyll serve --livereload
```

Open `http://localhost:4000`. Keep unfinished posts unpublished with `published: false`, or place them in `_drafts/` and preview with `bundle exec jekyll serve --drafts`.
