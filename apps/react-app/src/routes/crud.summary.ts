import { createFileRoute } from '@tanstack/react-router'
import {
  formPageReloadPolicy,
  omitQueryState,
  routeBoundary,
} from '@vendor/router-enhancer'

import {
  load,
  loadSchema,
  PageComponent,
  queryStateSchema,
} from '#/pages/crud/summary'

// ─────────────────────────────────────
// Search Schema
// ─────────────────────────────────────

const searchSchema = loadSchema
  .omit({
    // Route Params がある場合はsearchSchemaから除外する
  })
  .extend(queryStateSchema.shape)
  .strict()

// ─────────────────────────────────────
// Route
// ─────────────────────────────────────

export const Route = createFileRoute('/crud/summary')({
  ...formPageReloadPolicy,

  validateSearch: searchSchema,

  loaderDeps: omitQueryState,

  loader: (match) =>
    routeBoundary(match, async () =>
      load({ ...match.params, ...match.deps }, match.abortController.signal),
    ),

  component: PageComponent,
})
