import { model, operation } from './-page-deps-internal'

// ─────────────────────────────────────
// Load
// ─────────────────────────────────────

export async function load(
  body: model.DetailPageLoadInput,
  signal: AbortSignal,
) {
  return await operation.detailPageLoad(body, {
    signal,
  })
}
