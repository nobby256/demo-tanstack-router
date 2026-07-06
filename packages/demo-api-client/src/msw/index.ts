import type { RequestHandler } from 'msw'

import { setupWorker } from 'msw/browser'

const modules = import.meta.glob<{
  default: RequestHandler[]
}>('./internal/*.ts', { eager: true })

const handlers = Object.values(modules).flatMap((mod) => mod.default ?? [])

export async function startMockWorker() {
  const worker = setupWorker(...handlers)

  await worker.start({
    onUnhandledRequest(req, print) {
      if (req.url.startsWith('/api/')) {
        print.warning()
      }
    },
  })
}
