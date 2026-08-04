import { useActionBoundary } from '@vendor/router-enhancer'

import { type PageForm, Route } from './-page-deps-internal'

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
  const navigate = Route.useNavigate()

  const submit = async () => {
    const valid = await form.trigger()
    if (!valid) {
      return
    }

    const formValues = form.getValues()

    await navigate({
      to: '/crud/summary',
      search: {
        keyword: formValues.keyword,
        category: formValues.category,
      },
    })
  }

  return {
    submit,
  }
})
