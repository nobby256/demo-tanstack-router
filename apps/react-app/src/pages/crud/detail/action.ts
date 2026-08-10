import { useRouter } from '@tanstack/react-router'
import { useActionBoundary } from '@vendor/router-enhancer'

import {
  operation,
  type PageFormOutputValues,
  type UsePageFormReturn,
} from './-page-deps-internal'

// ─────────────────────────────────────
// Action Context
// ─────────────────────────────────────

type ActionContext = {
  form: UsePageFormReturn
}

// ─────────────────────────────────────
// Action Hook
// ─────────────────────────────────────

export const useActions = useActionBoundary(
  ({ form: _form }: ActionContext) => {
    const router = useRouter()

    const submitUpdate = async (data: PageFormOutputValues) => {
      await operation.detailPageUpdate(data)

      //loaderの強制再実行
      await router.invalidate()
    }

    return {
      submitUpdate,
    }
  },
)
