import { useActionBoundary } from '@vendor/router-enhancer'

import { type PageForm } from './-page-deps-internal'

// ─────────────────────────────────────
// Actions Hook
// ─────────────────────────────────────

export const useActions = useActionBoundary((_form: PageForm) => {
  return {
    // none
  }
})
