import { model, operation } from './-page-deps-internal'

// ─────────────────────────────────────
// Load
// ─────────────────────────────────────

export async function load(
  body: model.SummaryPageLoadBody,
  options?: RequestInit,
) {
  return await operation.summaryPageLoad(body, options)
}
