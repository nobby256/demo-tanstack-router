import { useActionBoundary } from '@vendor/router-enhancer'

import { type PageForm } from './-page-deps-internal'

// ─────────────────────────────────────
// Action Context
// ─────────────────────────────────────

type ActionContext = {
  form: PageForm
}

// ─────────────────────────────────────
// Action Hook
// ─────────────────────────────────────

export const useActions = useActionBoundary((_ctx: ActionContext) => {
  return {
    // none
  }
})
