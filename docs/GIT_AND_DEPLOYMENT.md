# Git and Deployment Status

Date: 2026-07-06

## Current Git Connection

This project is initialized as a local Git repository and is connected to the GitHub repository that backs the public Pages URL.

- Local branch: `main`
- Remote name: `origin`
- Remote URL: `https://github.com/karinrub/maui-lessons.git`
- GitHub repository: `karinrub/maui-lessons`
- GitHub Pages URL: `https://karinrub.github.io/maui-lessons/`

## Repository Source Note

The connected GitHub repository is the intended home for this local project. The source of truth for the deployed site is the local path `/Users/karinrubin/Developer/maui-lessons`.

## Deployment Setup

This local checkout includes a GitHub Actions workflow at:

- `.github/workflows/deploy-pages.yml`

The workflow builds the Vite app and deploys `dist` to GitHub Pages on pushes to `main`.

Vite derives its deployed base path from `GITHUB_REPOSITORY`. For the connected repository, the deployed base path is:

- `/maui-lessons/`

This keeps production asset URLs compatible with the GitHub Pages project URL.

## Deployment Target

The source of truth for the site that should appear at `https://karinrub.github.io/maui-lessons/` is this local project path:

```sh
/Users/karinrubin/Developer/maui-lessons
```

If GitHub Pages shows a different project, push the current `main` branch from this local checkout to `origin/main` and wait for the GitHub Actions Pages workflow to finish.

## Verification

The production build has been verified locally with the connected GitHub repository name:

```sh
GITHUB_REPOSITORY=karinrub/maui-lessons npm run build
```

That check confirms the app builds with the GitHub Pages base path expected for `karinrub/maui-lessons`.
