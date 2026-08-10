import { useActionBoundary } from '@vendor/router-enhancer'

import {
  type PageFormOutputValues,
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

export const useActions = useActionBoundary(
  ({ form: _form }: ActionContext) => {
    const navigate = Route.useNavigate()

    const submit = async (data: PageFormOutputValues) => {
      await navigate({
        to: '/crud/summary',
        search: {
          keyword: data.keyword,
          category: data.category,
        },
      })
    }

    return {
      submit,
    }
  },
)
