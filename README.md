# Maui Lessons

React and Vite site for Maui music lessons.

## Local Development

```sh
npm install
npm run dev
```

## Production Build

```sh
npm run build
```

## GitHub Pages Deployment

This project is connected to Git and is the deployment target for the `karinrub/maui-lessons` GitHub Pages site.

- GitHub remote: `origin` -> `https://github.com/karinrub/maui-lessons.git`
- GitHub Pages URL: `https://karinrub.github.io/maui-lessons/`
- Deployment workflow: `.github/workflows/deploy-pages.yml`

The repo is configured to deploy with GitHub Actions. On every push to `main`, the workflow builds the site and publishes the `dist` folder to GitHub Pages.

The Vite base path is derived from `GITHUB_REPOSITORY`, so the deployed project page uses `/maui-lessons/` asset paths automatically.

This repo was uploaded from the local project path `/Users/karinrubin/Developer/maui-lessons`.

See `docs/GIT_AND_DEPLOYMENT.md` for the current Git/deployment status.
