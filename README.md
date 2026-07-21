# Personal website

A lightweight personal site built with plain HTML, CSS, and JavaScript. It is ready to deploy to GitHub Pages without a build step.

## Update before publishing

Replace the remaining profile and domain placeholders:

- `[GITHUB URL]`, `[LINKEDIN URL]`, `[X URL]`
- `[YOUR-DOMAIN]` in `robots.txt` and `sitemap.xml`

When the custom domain is ready, add a `CNAME` file at the project root containing only that domain name.

## Local preview

Open `index.html` directly in a browser, or serve the directory with any static file server.

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. In **Settings → Pages**, choose **Deploy from a branch**.
3. Select the `main` branch and the repository root.
4. Add the custom domain and enable HTTPS after DNS is configured.

## Design note

The experience and featured-project layout is inspired by [Brittany Chiang's v4 portfolio](https://v4.brittanychiang.com/). The interactive light-mode background takes inspiration from [React Bits' Dot Grid](https://reactbits.dev/backgrounds/dot-grid). Both are reworked here with an original forest-green visual system and plain HTML, CSS, and JavaScript.
