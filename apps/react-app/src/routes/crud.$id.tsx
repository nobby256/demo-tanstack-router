import { createFileRoute } from '@tanstack/react-router'
import {
  locationStateShouldReload,
  omitQueryState,
  routeBoundary,
} from '@vendor/router-enhancer'

import { load, PageComponent, searchSchema } from '#/pages/crud/detail'

export const Route = createFileRoute('/crud/$id')({
  shouldReload: locationStateShouldReload,

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
