import react from '@vitejs/plugin-react'
import { defineConfig, type Connect } from 'vite'
import { serveDevEventFeed } from './server/devEventFeed.ts'

function mountDevEventFeed({ middlewares }: { middlewares: Connect.Server }) {
  middlewares.use('/api/dev-event-contests', async (request, response) => {
    const result = await serveDevEventFeed(request.method ?? '')
    response.statusCode = result.status
    result.headers.forEach((value, name) => response.setHeader(name, value))
    response.end(await result.text())
  })
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), {
    name: 'dev-event-feed',
    configureServer: mountDevEventFeed,
    configurePreviewServer: mountDevEventFeed,
  }],
})
