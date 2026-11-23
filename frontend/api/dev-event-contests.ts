import { serveDevEventFeed } from '../server/devEventFeed.ts'

export default {
  fetch(request: Request) {
    return serveDevEventFeed(request.method)
  },
}
