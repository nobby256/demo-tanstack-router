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

  const done = async (value: string) => {
    form.setValue('status', value)

    const valid = await form.trigger()
    if (!valid) {
      return
    }

    const formValues = form.getValues()
    await operation.errorHandlingPageDone(formValues)

    // URLを変えずにloaderの再実行
    // await navigation.invalidate()
    await router.invalidate()

    alert('Update successful')
  }

  return {
    done,
  }
})
