# portfolio

Personal website for [vishnugandarapu.in](https://www.vishnugandarapu.in).

## Structure

```
portfolio/
├── index.html          # Main landing page
├── homepage/           # CSS, JS, assets for landing page
├── contact/            # Contact page
├── timeline/           # Timeline page
├── favicon/            # Favicon assets
├── academia/           # Academicpages Jekyll source (served at /academia/)
│   ├── _config.yml
│   ├── _pages/
│   ├── _data/
│   └── ...
└── .github/workflows/
    ├── deploy.yml      # Builds + deploys the full site to GitHub Pages
    └── scrape_talks.yml
```

## Deployment

The site deploys automatically via GitHub Actions on every push to `main`.

The workflow (`deploy.yml`) does two things:
1. Copies the static portfolio files as-is
2. Builds the Jekyll `academia/` subsite using Ruby and places the output at `/academia/`

Both are deployed together to GitHub Pages.

### One-time GitHub Pages setup

In **Settings → Pages**, set Source to **GitHub Actions** (not "Deploy from a branch").

## Local Development

### Main portfolio

Open `index.html` directly in a browser — it's plain HTML/CSS/JS, no build step.

### Academia subsite (Jekyll)

Requires Docker:

```bash
cd academia

# Live preview at http://localhost:4000/academia/
docker compose up jekyll-site

```
