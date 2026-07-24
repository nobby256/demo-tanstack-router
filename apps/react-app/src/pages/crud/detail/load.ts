import { model, operation } from './-page-deps-internal'

// ─────────────────────────────────────
// Load
// ─────────────────────────────────────

export async function load(
  body: model.DetailPageLoadBody,
  options?: RequestInit,
) {
  return await operation.detailPageLoad(body, options)
}
