import { useActionBoundary } from '@vendor/router-enhancer'

import { type PageForm } from './-page-deps-internal'

// ─────────────────────────────────────
// Actions Hook
// ─────────────────────────────────────

export const useActions = useActionBoundary((_ctx: { form: PageForm }) => {
  return {
    // none
  }
})
