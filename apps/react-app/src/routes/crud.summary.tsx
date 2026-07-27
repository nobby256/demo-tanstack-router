import { createFileRoute } from '@tanstack/react-router'
import {
  dynamicShouldReload,
  omitQueryState,
  routeBoundary,
} from '@vendor/router-enhancer'

import { load, PageComponent, searchSchema } from '#/pages/crud/summary'

export const Route = createFileRoute('/crud/summary')({
  shouldReload: dynamicShouldReload,

  validateSearch: searchSchema,

  loaderDeps: omitQueryState,

  loader: (ctx) =>
    routeBoundary(ctx, async () =>
      load(
        { ...ctx.params, ...ctx.deps },
        { signal: ctx.abortController.signal },
      ),
    ),

  component: PageComponent,
})
