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

export const useActions = useActionBoundary(({ form }: ActionContext) => {
  const router = useRouter()

  const update = async (values: PageFormOutputValues) => {
    await operation.detailPageUpdate(values)

    //loaderの強制再実行
    await router.invalidate()
  }

  return {
    update: form.handleSubmit(update),
  }
})
