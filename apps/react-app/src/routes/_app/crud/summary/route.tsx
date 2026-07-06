import { createFileRoute } from '@tanstack/react-router'
import {
  dynamicLoaderPolicy,
  extractQueryState,
  navigationTx,
  normalizeSearch,
} from '@vendor/router-enhancer'
import { load } from 'demo-api-client/api/summary_page'
import { LoadBody } from 'demo-api-client/zod/summary_page'

import { Page } from './-page/page'

// URL schema
// `_` prefix は UI state
const searchSchema = LoadBody.omit({
  // none
}).extend({
  // none
})

// ─────────────────────────────────────
// Route Definition
// ─────────────────────────────────────

export const Route = createFileRoute('/_app/crud/summary')({
  // Loader Policy
  ...dynamicLoaderPolicy,

  // validate + canonicalize URL
  validateSearch: (search) => normalizeSearch(searchSchema.parse(search)),

  // Query state（UI state を除外）
  loaderDeps: ({ search }) => extractQueryState(search),

  // Router transaction
  loader: (args) =>
    navigationTx(args, async () => {
      return await load(
        { ...args.params, ...args.deps },
        { signal: args.abortController.signal },
      )
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
