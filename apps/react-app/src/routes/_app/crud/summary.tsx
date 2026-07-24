import { createFileRoute } from '@tanstack/react-router'
import { dynamicLoaderPolicy } from '@vendor/router-enhancer'

import { extractLoaderDeps, withRouteBoundary } from '#/features/router'
import { load, PageComponent, searchSchema } from '#/pages/crud/summary'

export const Route = createFileRoute('/_app/crud/summary')({
  // Loader Policy
  ...dynamicLoaderPolicy,

  validateSearch: searchSchema,

  loaderDeps: ({ search }) => extractLoaderDeps(search),

  loader: (ctx) =>
    withRouteBoundary(ctx, async () => {
      return load(
        { ...ctx.params, ...ctx.deps },
        { signal: ctx.abortController.signal },
      )
    }),

  component: PageComponent,
})
