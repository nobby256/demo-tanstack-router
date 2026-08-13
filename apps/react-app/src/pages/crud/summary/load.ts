import { z } from 'zod'

import { operation, schema } from './-page-deps-internal'

// ─────────────────────────────────────
// Load Schema
// ─────────────────────────────────────

export const loadSchema = schema.SummaryPageLoadBody

// ─────────────────────────────────────
// Load
// ─────────────────────────────────────

export async function load(
  body: z.infer<typeof loadSchema>,
  options: RequestInit,
) {
  const result = await operation.summaryPageLoad(body, options)
  // 通信で省略されたdefault値をセットする
  return schema.SummaryPageLoadResponse.parse(result)
}
