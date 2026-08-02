import { setupWorker } from 'msw/browser'

import * as mocks from '../../.generated/orval/msw/index.msw'
import { customMocks } from './custom-mocks'

const mergedMocks = {
  ...mocks,
  ...customMocks,
}

const handlers = Object.values(mergedMocks).flatMap((createMock) =>
  createMock(),
)

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
