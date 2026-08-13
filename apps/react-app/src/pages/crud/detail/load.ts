import { z } from 'zod'

import { operation, schema } from './-page-deps-internal'

// ─────────────────────────────────────
// Load Schema
// ─────────────────────────────────────

export const loadSchema = schema.DetailPageLoadBody

// ─────────────────────────────────────
// Load
// ─────────────────────────────────────

export async function load(
  body: z.infer<typeof loadSchema>,
  options: RequestInit,
) {
  const result = await operation.detailPageLoad(body, options)
  // 通信で省略されたdefault値をセットする
  return schema.DetailPageLoadResponse.parse(result)
}
