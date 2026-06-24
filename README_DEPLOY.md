# Deploying TapGO to GitHub and Vercel

Quick steps to publish this project to GitHub and deploy on Vercel.

- Confirm the build script works locally:

  npm install
  npm run build

  The site output will be in the `dist` folder.

- Create a GitHub repo and push (two options):

  Option A — using GitHub CLI (`gh`):

  gh repo create <your-username>/tapgo --public --source=. --remote=origin --push

  Option B — using GitHub website + git:

  git init
  git add .
  git commit -m "Initial commit"

  # Create a repo on github.com, then:

  git remote add origin https://github.com/<your-username>/tapgo.git
  git branch -M main
  git push -u origin main

- Deploy on Vercel (recommended):
  1. Sign in to https://vercel.com and import a project.
  2. Select your GitHub account and choose the `tapgo` repository.
  3. In "Build & Output Settings":
     - Build Command: `npm run build`
     - Output Directory: `dist`
  4. Add any environment variables if needed (none required by default).
  5. Click "Deploy" — Vercel will build and publish the site.

- If you need to deploy manually (without Vercel):

  You can serve `dist` with any static host or use `npx serve dist` to preview.

If you want, I can: initialize git and make the first local commit for you, or generate a repo creation command. Tell me which you prefer.
