import { z } from 'zod'

import { operation, schema } from './-page-deps-internal'

// ─────────────────────────────────────
// Load Schema
// ─────────────────────────────────────

export const loadSchema = schema.ErrorHandlingPageLoadBody

// ─────────────────────────────────────
// Load
// ─────────────────────────────────────

export async function load(
  body: z.infer<typeof loadSchema>,
  signal: AbortSignal,
) {
  const result = await operation.errorHandlingPageLoad(body, {
    signal,
  })
  // 通信で省略されたdefault値をセットする
  return schema.ErrorHandlingPageLoadResponse.parse(result)
}
