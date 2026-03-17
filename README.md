# Shanglabs - Deployment Guide

## Quick Links

- **Main site:** `shanglabs/index.html`
- **Live at:** `https://shangle.me/shanglabs/` (or your custom domain)

---

## Quick Start

Shanglabs is **15 professional banking and business tools**, all client-side, no data collection, free to use forever.

### All Tools

| Tool | Category | Status | Price | Export |
|-------|----------|--------|--------|--------|
| NACHA File Viewer | Operations | Live | TBD | CSV |
| Cash Flow Forecaster Pro | Finance | Live | TBD | CSV, PDF |
| ROI Calculator | Finance | Live | TBD | CSV, PDF |
| Break-Even Analysis | Finance | Live | TBD | CSV |
| Invoice Aging Tracker | Finance | Live | TBD | CSV |
| Budget vs. Actual Tracker | Finance | Live | TBD | CSV |
| Payment Reconciliation Helper | Operations | Live | TBD | CSV |
| Loan Portfolio Analyzer | Banking | Live | $400 | CSV, PDF |
| Capital Adequacy Calculator | Risk | Live | TBD | CSV |
| Credit Risk Scoring | Risk | Live | TBD | CSV |
| Liquidity Risk Dashboard | Risk | Live | TBD | CSV |
| Stress Test Scenarios | Risk | Live | TBD | CSV |
| Net Interest Margin Analysis | Financial Analysis | Live | TBD | CSV, PDF |
| Financial Analysis Dashboard | Financial Analysis | Live | TBD | CSV |
| Monte Carlo Risk Simulator | Risk | Live | TBD | CSV |
| QR Code Generator | Utilities | Live | TBD | PNG, SVG |

**Total:** 15 tools across 5 categories

---

## Deployment to GitHub Pages

Since `shangle.me` is already on GitHub Pages, we have two options:

### Option A: Subdirectory on shangle.me (Current)

**Structure:**
```
shangle.me/
├── index.html (your personal site)
├── shanglabs/ (this directory)
│   ├── index.html (main landing)
│   ├── css/ (shared styles)
│   ├── assets/ (SVG logos)
│   └── [15 tool directories]
```

**Result:** `https://shangle.me/shanglabs/`

### Option B: Separate Repository

Create a dedicated `shanglabs` repository for tools.

**Result:** `https://timshangle.github.io/shanglabs/` or custom domain like `tools.shangle.me`

---

## Deployment Steps

### Option A: Subdirectory (Recommended for now)

1. Navigate to your shangle.me repository:

```bash
cd /path/to/shangle.me
git checkout -b shanglabs
```

2. Copy `shanglabs` folder into your repository:

```bash
cp -r /path/to/shanglabs .
git add .
git commit -m "Add Shanglabs tools hub with 15 apps"
```

3. Push to GitHub:

```bash
git push -u origin shanglabs
```

4. Access at: `https://shangle.me/shanglabs/`

### Option B: Separate Repository (For dedicated branding)

1. Create a new GitHub repo: `shanglabs`

2. Clone and copy files:

```bash
cd /path/to/workspace
git clone https://github.com/timshangle/shanglabs.git shanglabs-repo
cp -r shanglabs/* shanglabs-repo/
cd shanglabs-repo
git add .
git commit -m "Initial commit: 15 professional banking tools"
```

3. Push and enable GitHub Pages:

```bash
git branch -M main
git remote add origin https://github.com/timshangle/shanglabs.git
git push -u origin main
```

4. Enable GitHub Pages:
   - Go to repo Settings → Pages
   - Source: Deploy from branch → `main` → `/root`
   - Save

5. For custom domain (`tools.shangle.me`):
   - Create `CNAME` file with contents: `tools.shangle.me`
   - Update DNS at your domain registrar

---

## What's Included

### Complete Tool Suite
- **15 fully functional tools** – All ready to use with export functionality
- **5 categories:** Operations, Finance, Risk Management, Banking, Financial Analysis, Utilities
- **Marketing content:** Social media posts, email campaigns, blog articles ready to deploy
- **Feature proposals:** 7 documented new app ideas in pipeline
- **Documentation:** Complete README, deployment guide, app catalog

### Recent Improvements (2026-03-17)
- **Homepage:** Fixed CSS bug, added favicon/OG tags, mobile navigation, linked all 15 apps
- **Cash Flow Forecaster:** Added actual vs. forecast comparison, historical data import, variance analysis
- **Monte Carlo Risk Simulator:** Added CSV export functionality
- **Design System:** Standardized primary color (#6366f1) across all apps
- **Mobile:** Full responsive design with hamburger menu and fluid typography

---

## Deployment Checklist

- [x] Choose deployment option (A or B)
- [ ] Deploy to GitHub Pages
- [ ] Verify all 15 tools load correctly
- [ ] Test mobile responsiveness
- [ ] Update "Subscribe" section with actual subscription link when ready
- [ ] Add analytics (optional – client-side tools, only main site needs tracking)
- [ ] Deploy marketing content (social media, blog posts)

---

## Folder Structure

```
shanglabs/
├── index.html                    # Main landing (15 tools, mobile nav, SEO tags)
├── README.md                    # Deployment guide (this file)
├── css/                         # Shared design system
│   └── styles.css              # Component styles, color palette (#6366f1)
├── assets/                       # SVG logos for all tools
│   ├── logo-nacha.svg
│   ├── logo-cashflow.svg
│   ├── logo-finance.svg
│   ├── logo-loan.svg
│   ├── logo-capital.svg
│   ├── logo-credit.svg
│   ├── logo-liquidity.svg
│   ├── logo-stress.svg
│   ├── logo-nim.svg
│   ├── logo-monte.svg
│   ├── logo-qr.svg
│   └── logo-reconciliation.svg
├── nacha-viewer/               # NACHA File Viewer
│   ├── index.html
│   ├── landing/
│   ├── app.js
│   ├── nacha-parser.js
│   └── nacha-validator.js
├── financial-analysis/           # Financial Analysis Suite
│   ├── index.html
│   └── README.md
├── cash-flow/                  # Cash Flow Forecaster Pro
│   ├── index.html
│   └── landing/
├── roi-calculator/              # ROI Calculator
│   ├── index.html
│   └── README.md
├── budget-actual/              # Budget vs Actual Tracker
│   └── index.html
├── invoice-aging/              # Invoice Aging Tracker
│   └── index.html
├── reconciliation/              # Payment Reconciliation Helper
│   └── index.html
├── loan-portfolio-analyzer/      # Loan Portfolio Analyzer
│   ├── index.html
│   └── README.md
├── break-even/                 # Break-Even Analysis Tool
│   ├── index.html
│   └── styles.css
├── credit-risk-scoring/          # Credit Risk Scoring
│   └── index.html
├── capital-adequacy-calculator/ # Capital Adequacy Calculator
│   ├── index.html
│   └── README.md
├── liquidity-risk-dashboard/      # Liquidity Risk Dashboard
│   └── index.html
├── stress-test-scenarios/        # Stress Test Scenarios
│   └── index.html
├── net-interest-margin-analysis/    # Net Interest Margin Analysis
│   ├── index.html
│   └── README.md
├── monte-carlo/                # Monte Carlo Risk Simulator
│   └── index.html
├── qr-generator/                # QR Code Generator
│   └── index.html
└── APP_CATALOG.md              # App catalog (in memory/)
```

---

## Development Notes

### Design System
All tools use → shared color palette from `css/styles.css`:
- **Primary:** `#6366f1` (indigo)
- **Secondary:** `#8b5cf6` (purple)
- **Success:** `#10b981` (emerald)
- **Warning:** `#f59e0b` (amber)
- **Gray scale:** `#f9fafb` through `#111827`

### Privacy Stance
All tools are **client-side only** – no servers, no data collection. User's financial data never leaves their browser.

### Performance Considerations
- Apps use Chart.js for visualizations
- No build process – all tools are self-contained HTML/CSS/JS
- Works offline when downloaded

---

## Next Steps

1. **Deploy** → tools to your chosen URL (shangle.me/shanglabs or custom domain)
2. **Subscribe** → Update "Subscribe" section with actual subscription link when ready
3. **Analytics** → Add privacy-respecting analytics to main site (optional)
4. **Marketing** → Deploy social media posts and email campaigns
5. **New tools** → Build out feature proposals as demand dictates
