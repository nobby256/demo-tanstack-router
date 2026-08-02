import { model, operation } from './-page-deps-internal'

// ─────────────────────────────────────
// Load
// ─────────────────────────────────────

export async function load(
  body: model.ErrorHandlingPageLoadInput,
  options?: RequestInit,
) {
  return await operation.errorHandlingPageLoad(body, options)
}
