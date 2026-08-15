import { useActionBoundary } from '@vendor/router-enhancer'

import {
  type PageFormOutput,
  Route,
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

export const useActions = useActionBoundary(({ form: form }: ActionContext) => {
  const navigate = Route.useNavigate()

  const submit = async (values: PageFormOutput) => {
    await navigate({
      to: '/crud/summary',
      search: {
        keyword: values.data.keyword,
        category: values.data.category,
      },
    })
  }

  return {
    submit: form.handleSubmit(submit),
  }
})
