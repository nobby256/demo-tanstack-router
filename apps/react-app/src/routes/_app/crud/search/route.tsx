import { createFileRoute } from '@tanstack/react-router'
import {
  dynamicLoaderPolicy,
  extractQueryState,
  navigationTx,
  normalizeSearch,
} from '@vendor/router-enhancer'
import { z } from 'zod'

import { Page } from './-page/page'

// URL schema
// `_` prefix は UI state
const searchSchema = z.strictObject({
  _check: z.boolean().optional(),
})

// ─────────────────────────────────────
// Route Definition
// ─────────────────────────────────────

export const Route = createFileRoute('/_app/crud/search')({
  // Loader Policy
  ...dynamicLoaderPolicy,

  // validate + canonicalize URL
  validateSearch: (search) => normalizeSearch(searchSchema.parse(search)),

  // Query state（UI state を除外）
  loaderDeps: ({ search }) => extractQueryState(search),

  // Router transaction
  loader: (args) =>
    navigationTx(args, async () => {
      return undefined
    }),

  // Page Adapter
  component: RouteComponent,
})

// ─────────────────────────────────────
// Page Adapter
// ─────────────────────────────────────

function RouteComponent() {
  return <Page />
}
