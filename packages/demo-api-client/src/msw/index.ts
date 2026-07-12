import { setupWorker } from 'msw/browser'

import * as mocks from '../../.generated/orval/client/msw/index.msw'

const handlers = Object.values(mocks).flatMap((createMock) => createMock())

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
