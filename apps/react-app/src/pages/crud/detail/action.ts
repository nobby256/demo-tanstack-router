import { useRouter } from '@tanstack/react-router'
import { useActionBoundary } from '@vendor/router-enhancer'

import { operation, type PageForm } from './-page-deps-internal'

// ─────────────────────────────────────
// Action Context
// ─────────────────────────────────────

type ActionContext = {
  form: PageForm
}

// ─────────────────────────────────────
// Action Hook
// ─────────────────────────────────────

export const useActions = useActionBoundary(({ form }: ActionContext) => {
  const router = useRouter()

  const submitUpdate = async () => {
    const valid = await form.trigger()
    if (!valid) {
      return
    }

    const formValues = form.getValues()
    await operation.detailPageUpdate(formValues)

    //loaderの強制再実行
    await router.invalidate()
  }

  return {
    submitUpdate,
  }
})
