import { useActionBoundary } from '@vendor/router-enhancer'

import { type UsePageFormReturn } from './-page-deps-internal'

// ─────────────────────────────────────
// Action Context
// ─────────────────────────────────────

type ActionContext = {
  form: UsePageFormReturn
}

// ─────────────────────────────────────
// Action Hook
// ─────────────────────────────────────

export const useActions = useActionBoundary((_ctx: ActionContext) => {
  return {
    // none
  }
})
