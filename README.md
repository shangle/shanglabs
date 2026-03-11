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
- **NACHA Viewer** – Fully functional ACH file parser (ready to use)
- **6 placeholder apps** – Coming soon cards for future development

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
├── index.html              # Main landing page
├── css/
│   └── styles.css          # Main site styles
├── js/
│   └── app.js              # Main site interactivity
├── nacha-viewer/           # NACHA File Viewer app
│   ├── index.html
│   ├── styles.css
│   ├── nacha-parser.js
│   ├── nacha-validator.js
│   └── app.js
└── README.md               # This file
```
