import { createAppError } from '#/features/error'

import { model, operation } from './-page-deps-internal'

// ─────────────────────────────────────
// Load
// ─────────────────────────────────────

export async function load(
  body: model.DetailPageLoadInput,
  options?: RequestInit,
) {
  const error = createAppError('message', {
    category: 'Recoverble',
  })
  throw error
  return await operation.detailPageLoad(body, options)
}
