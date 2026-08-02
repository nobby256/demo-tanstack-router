import { createFileRoute } from '@tanstack/react-router'
import {
  formPageReloadPolicy,
  omitQueryState,
  routeBoundary,
} from '@vendor/router-enhancer'

import { load, PageComponent, searchSchema } from '#/pages/crud/error-handling'

export const Route = createFileRoute('/crud/error-handling')({
  ...formPageReloadPolicy,

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
