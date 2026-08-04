import { model, operation } from './-page-deps-internal'

// ─────────────────────────────────────
// Load
// ─────────────────────────────────────

export async function load(
  body: model.SearchPageLoadInput,
  signal: AbortSignal,
) {
  return await operation.searchPageLoad(body, {
    signal,
  })
}
