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

  const done = async () => {
    const result = validateForm(form, schema.ErrorHandlingPageDoneBody)
    if (!result.success) {
      return
    }

    await operation.errorHandlingPageDone(result.data)

    // URLを変えずにloaderの再実行
    await router.invalidate()

    alert('Update successful')
  }

  return {
    done,
  }
})
