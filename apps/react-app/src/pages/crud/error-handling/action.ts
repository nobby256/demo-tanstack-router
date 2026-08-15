import { useRouter } from '@tanstack/react-router'
import { useActionBoundary } from '@vendor/router-enhancer'

import {
  operation,
  type PageFormOutput,
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

  const done = async (values: PageFormOutput) => {
    await operation.errorHandlingPageDone(values)

    // URLを変えずにloaderの再実行
    // await navigation.invalidate()
    await router.invalidate()

    alert('Update successful')
  }

  return {
    done: form.handleSubmit(done),
  }
})
