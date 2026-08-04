import { createFileRoute } from '@tanstack/react-router'
import {
  formPageReloadPolicy,
  omitQueryState,
  routeBoundary,
} from '@vendor/router-enhancer'

import { load, PageComponent, searchSchema } from '#/pages/crud/summary'

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
