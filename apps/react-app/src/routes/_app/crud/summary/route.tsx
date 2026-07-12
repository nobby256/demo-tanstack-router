import { createFileRoute } from '@tanstack/react-router'
import {
  dynamicLoaderPolicy,
  extractQueryState,
  navigationTx,
  normalizeSearch,
} from '@vendor/router-enhancer'
import { summaryPageLoad } from 'demo-api-client/api/summary-page'
import { SummaryPageLoadBody } from 'demo-api-client/zod/summary-page'

import { Page } from './-page'

// URL schema
// `_` prefix は UI state
const searchSchema = SummaryPageLoadBody.omit({
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
      return await summaryPageLoad(
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
