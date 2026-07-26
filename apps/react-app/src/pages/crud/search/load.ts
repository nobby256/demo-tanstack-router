import { model, operation } from './-page-deps-internal'

// ─────────────────────────────────────
// Load
// ─────────────────────────────────────

export async function load(
  body: model.SearchPageLoadInput,
  options?: RequestInit,
) {
  return await operation.searchPageLoad(body, options)
}
