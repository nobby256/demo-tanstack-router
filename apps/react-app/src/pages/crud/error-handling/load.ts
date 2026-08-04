import { model, operation } from './-page-deps-internal'

// ─────────────────────────────────────
// Load
// ─────────────────────────────────────

export async function load(
  body: model.ErrorHandlingPageLoadInput,
  signal: AbortSignal,
) {
  return await operation.errorHandlingPageLoad(body, {
    signal,
  })
}
