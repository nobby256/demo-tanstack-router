import { useRouter } from '@tanstack/react-router'
import { useActionBoundary } from '@vendor/router-enhancer'

import { operation, type UsePageFormReturn } from './-page-deps-internal'

// ─────────────────────────────────────
// Action Context
// ─────────────────────────────────────

type ActionContext = {
  form: UsePageFormReturn
}

// ─────────────────────────────────────
// Action Hook
// ─────────────────────────────────────

export const useActions = useActionBoundary(({ form }: ActionContext) => {
  const router = useRouter()

  const submitUpdate = async () => {
    await form.handleSubmit(async (data) => {
      await operation.detailPageUpdate(data)

      //loaderの強制再実行
      await router.invalidate()
    })()
  }

  return {
    submitUpdate,
  }
})
