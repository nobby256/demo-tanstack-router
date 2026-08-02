/**
 * ページモジュールの公開契約
 *
 * Route は本ファイル経由で Page / load / searchSchema を利用する。
 */
import { schema } from './-page-deps-internal'
import { queryStateSchema } from './page'
export { load } from './load'

export { PageComponent } from './page'

// ─────────────────────────────────────
// Search Schema
// ─────────────────────────────────────

export const searchSchema = schema.ErrorHandlingPageLoadBody.omit({
  // Route Params がある場合はsearchからomitする
}).extend(queryStateSchema.shape)
