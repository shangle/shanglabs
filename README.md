# Shanglabs — Deployment Guide

## Quick Links

- **Main site:** `shanglabs/index.html`
- **NACHA Viewer:** `shanglabs/nacha-viewer/index.html`

## Deployment to GitHub Pages

Since shangle.me is already on GitHub Pages, we have two options:

### Option A: Subdirectory on shangle.me
Structure:
```
shangle.me/
├── index.html (your personal site)
├── shanglabs/ (this directory)
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── nacha-viewer/
```

Result: `https://shangle.me/shanglabs/`

### Option B: Separate repository
Create a new repo `shanglabs` and enable GitHub Pages.

Result: `https://timshangle.github.io/shanglabs/` or custom domain like `tools.shangle.me`

---

## Deployment Steps (Option A - Subdirectory)

1. Copy the `shanglabs` folder into your shangle.me repository:

```bash
cd /path/to/shangle.me
git checkout -b shanglabs
cp -r /path/to/shanglabs .
git add .
git commit -m "Add Shanglabs tools hub"
git push origin shanglabs
```

2. Merge into main when ready, or keep as a separate branch

3. Access at: `https://shangle.me/shanglabs/`

---

## Deployment Steps (Option B - Separate Repo)

1. Create a new GitHub repo: `shanglabs`

2. Push this directory:

```bash
cd /path/to/shanglabs
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/timshangle/shanglabs.git
git push -u origin main
```

3. Enable GitHub Pages:
   - Go to repo Settings → Pages
   - Source: Deploy from branch → main → /root
   - Save

4. Access at: `https://timshangle.github.io/shanglabs/`

5. For custom domain (`tools.shangle.me`):
   - Add CNAME file with contents: `tools.shangle.me`
   - Update DNS at your domain registrar

---

## What's Included

- **Main site** – App catalog, subscription info, about page
- **15 fully functional tools** – All tools are ready to use with export functionality
- **Marketing content** – Social media posts, email campaigns, blog articles
- **Feature proposals** – Documentation of potential new tools to build

---

## Next Steps

1. Decide on deployment option (A or B)
2. Deploy it
3. Update the "Subscribe" section with actual subscription link when ready
4. Build out the other 6 apps (can use the same pattern as NACHA viewer)
5. Add analytics (optional – since the tools are client-side, only the main site needs tracking)

---

## Folder Structure

```
shanglabs/
├── index.html              # Main landing page (15 tools displayed)
├── README.md               # This file
├── assets/                 # SVG logos for all tools
├── nacha-viewer/           # NACHA File Viewer
│   ├── index.html
│   ├── landing/
│   ├── app.js
│   ├── nacha-parser.js
│   └── nacha-validator.js
├── financial-analysis/     # Financial Analysis Suite
│   ├── index.html
│   └── README.md
├── cash-flow/              # Cash Flow Forecaster (with comparison view)
│   ├── index.html
│   └── landing/
├── roi-calculator/         # ROI Calculator
│   ├── index.html
│   └── README.md
├── budget-actual/          # Budget vs Actual Tracker
│   └── index.html
├── invoice-aging/          # Invoice Aging Tracker
│   └── index.html
├── reconciliation/         # Payment Reconciliation Helper
│   └── index.html
├── monte-carlo/            # Monte Carlo Risk Simulator
│   └── index.html
├── credit-risk-scoring/    # Credit Risk Scoring
│   └── index.html
├── capital-adequacy-calculator/  # Capital Adequacy Calculator
│   ├── index.html
│   └── README.md
├── liquidity-risk-dashboard/     # Liquidity Risk Dashboard
│   └── index.html
├── stress-test-scenarios/  # Stress Test Scenarios
│   └── index.html
├── net-interest-margin-analysis/  # Net Interest Margin Analysis
│   ├── index.html
│   └── README.md
├── loan-portfolio-analyzer/  # Loan Portfolio Analyzer
│   ├── index.html
│   └── README.md
├── break-even/             # Break-Even Analysis Tool
│   ├── index.html
│   └── styles.css
└── qr-generator/           # QR Code Generator
    └── index.html
```
