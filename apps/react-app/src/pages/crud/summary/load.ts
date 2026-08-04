import { model, operation } from './-page-deps-internal'

// ─────────────────────────────────────
// Load
// ─────────────────────────────────────

export async function load(
  body: model.SummaryPageLoadInput,
  signal: AbortSignal,
) {
  return await operation.summaryPageLoad(body, {
    signal,
  })
}
