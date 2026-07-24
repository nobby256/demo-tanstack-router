/**
 * ページモジュールの公開契約
 *
 * Route は本ファイル経由で Page / load / searchSchema を利用する。
 */
// import { schema } from './-page-deps-internal'
import { queryStateSchema } from './page'
export { load } from './load'
import { z } from 'zod'

export { PageComponent } from './page'

// ─────────────────────────────────────
// Search Schema
// ─────────────────────────────────────

export const searchSchema = z.object({}).extend(queryStateSchema.shape)
