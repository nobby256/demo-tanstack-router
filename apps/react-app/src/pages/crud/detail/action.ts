import { useRouter } from '@tanstack/react-router'
import { useActionBoundary } from '@vendor/router-enhancer'

import { validateForm } from '#/features/validation'

import {
  operation,
  schema,
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

  const update = async () => {
    const result = validateForm(form, schema.DetailPageUpdateBody)
    if (!result.success) {
      return
    }

    await operation.detailPageUpdate(result.data)

    //loaderの強制再実行
    await router.invalidate()
  }

  return {
    update: update,
  }
})
