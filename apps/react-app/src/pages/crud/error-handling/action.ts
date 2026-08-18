import { useRouter } from '@tanstack/react-router'
import { useActionBoundary } from '@vendor/router-enhancer'

import { valodateFork } from '#/features/validation/validateForm'

import {
  operation,
  type PageFormValues,
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
    await operation.errorHandlingPageDone(values)

    // URLを変えずにloaderの再実行
    // await navigation.invalidate()
    await router.invalidate()

    alert('Update successful')
  }

  return {
    done,
  }
})
