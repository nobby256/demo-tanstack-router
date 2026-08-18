import { useActionBoundary } from '@vendor/router-enhancer'

import { Route, type UsePageFormReturn } from './-page-deps-internal'

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
  const navigate = Route.useNavigate()

  const submit = async () => {
    const data = form.getValues('data')

    await navigate({
      to: '/crud/summary',
      search: {
        keyword: data.keyword,
        category: data.category,
      },
    })
  }

  return {
    submit: submit,
  }
})
