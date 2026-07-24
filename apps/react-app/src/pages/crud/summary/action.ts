import { withActionBoundary } from '#/features/router'

import { type PageForm } from './-page-deps-internal'

// ─────────────────────────────────────
// Actions Hook
// ─────────────────────────────────────

export const useActions = withActionBoundary((_form: PageForm) => {
  return {
    // none
  }
})
