# Deploying VR360° Panorama to GitHub Pages (esdzign1.github.io)

### Why the error happened:
The error `Resource failed to load: https://esdzign1.github.io/src/main.tsx` occurs when GitHub Pages is pointed to the raw source repository files rather than the compiled `dist/` directory. Browsers cannot directly execute uncompiled `.tsx` (TypeScript JSX) files or bare npm module imports (`import React from 'react'`). 

When Vite builds the application with `npm run build`, it bundles everything into static `.html`, `.js`, and `.css` files inside the `dist/` folder.

---

## Option 1: Automatic Deployment with GitHub Actions (Recommended)

This repository already includes `.github/workflows/deploy.yml`.

1. Push this project to your GitHub repository (e.g. `esdzign1/esdzign1.github.io` or `esdzign1/your-repo-name`).
2. On GitHub, go to **Settings** -> **Pages**.
3. Under **Build and deployment** > **Source**, change the dropdown from **"Deploy from a branch"** to **"GitHub Actions"**.
4. GitHub will automatically trigger the workflow, compile Vite into `/dist`, and publish the live site.

---

## Option 2: One-Click Deploy via `npm run deploy` (gh-pages)

If you have Git and Node.js installed locally:
1. Run:
   ```bash
   npm run deploy
   ```
   *(This automatically executes `vite build` and pushes the compiled `dist` folder to your `gh-pages` branch).*
2. On GitHub, go to **Settings** -> **Pages**.
3. Under **Build and deployment** > **Source**, select **"Deploy from a branch"**.
4. Choose the **`gh-pages`** branch and the **`/ (root)`** folder, then click **Save**.

---

## Option 3: Manual Upload to GitHub

If uploading manually through GitHub's web interface:
1. Run `npm run build` to generate the `dist` folder.
2. Upload the contents *inside* `dist` (i.e. `index.html`, `404.html`, `.nojekyll`, and the `assets` folder) directly to your GitHub Pages publishing branch or folder.
