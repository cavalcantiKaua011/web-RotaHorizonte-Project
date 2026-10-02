import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    return {
      plugins: [
        devServer({
          entry: 'src/index.tsx',
        }),
      ],
    }
  } else {
    return {
      plugins: [
        build({
          entry: 'src/index.tsx',
        }),
      ],
    }
  }
})
