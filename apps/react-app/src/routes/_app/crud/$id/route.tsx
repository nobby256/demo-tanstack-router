import { createFileRoute } from '@tanstack/react-router'
import {
  dynamicLoaderPolicy,
  extractQueryState,
  navigationTx,
  normalizeSearch,
} from '@vendor/router-enhancer'
import { load } from 'demo-api-client/api/detail_page'
import { LoadBody } from 'demo-api-client/zod/detail_page'
import { z } from 'zod'

import { Page } from './-page'

// ─────────────────────────────────────────────
// URL Schema
// `_` prefix = UI state
// ─────────────────────────────────────────────
const searchSchema = LoadBody.omit({
  id: true,
}).extend({
  _returnTo: z.string(),
  _check1: z.boolean().optional(),
  _check2: z.boolean().optional(),
})

// ─────────────────────────────────────
// Route Definition
// ─────────────────────────────────────

export const Route = createFileRoute('/_app/crud/$id')({
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
