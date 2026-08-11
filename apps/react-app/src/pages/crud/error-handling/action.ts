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

    const done = async (values: PageFormOutputValues) => {
      await operation.errorHandlingPageDone(values)

      // URLを変えずにloaderの再実行
      // await navigation.invalidate()
      await router.invalidate()

      alert('Update successful')
    }

    return {
      done,
    }
  },
)
