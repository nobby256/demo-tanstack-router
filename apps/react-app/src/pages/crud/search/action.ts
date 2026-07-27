import { useActionBoundary } from '@vendor/router-enhancer'

import { type PageForm, Route } from './-page-deps-internal'

// ─────────────────────────────────────
// Actions Hook
// ─────────────────────────────────────

export const useActions = useActionBoundary((ctx: { form: PageForm }) => {
  const navigate = Route.useNavigate()
  const { form } = ctx

  const onSubmit = async () => {
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
    onSubmit,
  }
})
