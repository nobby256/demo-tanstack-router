import { model, operation } from './-page-deps-internal'

// ─────────────────────────────────────
// Load
// ─────────────────────────────────────

export async function load(
  body: model.SummaryPageLoadInput,
  options?: RequestInit,
) {
  return await operation.summaryPageLoad(body, options)
}
