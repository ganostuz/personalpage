# Personal website

A lightweight personal site built with plain HTML, CSS, and JavaScript. It is ready to deploy to GitHub Pages without a build step.

## Update before publishing

Replace the remaining profile placeholders:

- `[GITHUB URL]`, `[LINKEDIN URL]`, `[X URL]`

The GitHub Pages custom domain is configured as `stanislavguzej.dev` in `CNAME`, `robots.txt`, `sitemap.xml`, and page metadata.

## Local preview

Open `index.html` directly in a browser, or serve the directory with any static file server.

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. In **Settings → Pages**, choose **Deploy from a branch**.
3. Select the `main` branch and the repository root.
4. Confirm the custom domain is `stanislavguzej.dev`.
5. Enable **Enforce HTTPS** after GitHub finishes its DNS check and provisions the certificate.

## Custom domain DNS

Configure these records with the DNS provider for `stanislavguzej.dev`:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `ganostuz.github.io` |

Remove conflicting default records and do not add a wildcard record. In GitHub profile **Settings → Pages**, verify `stanislavguzej.dev` using the TXT record GitHub provides, then retain that record to protect the domain from takeover.

## Design note

The experience and featured-project layout is inspired by [Brittany Chiang's v4 portfolio](https://v4.brittanychiang.com/). The interactive light-mode background takes inspiration from [React Bits' Dot Grid](https://reactbits.dev/backgrounds/dot-grid). Both are reworked here with an original forest-green visual system and plain HTML, CSS, and JavaScript.
