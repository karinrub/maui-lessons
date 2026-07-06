import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const isUserOrOrgPage = repositoryName?.endsWith('.github.io')

// https://vite.dev/config/
export default defineConfig({
  base: repositoryName && !isUserOrOrgPage ? `/${repositoryName}/` : '/',
  plugins: [react()],
})
