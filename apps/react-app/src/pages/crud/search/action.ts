import { useRouteNavigation } from '@vendor/router-enhancer'

import { withActionBoundary } from '#/features/router'

import { type PageForm, Route } from './-page-deps-internal'

// ─────────────────────────────────────
// Actions Hook
// ─────────────────────────────────────

export const useActions = withActionBoundary((form: PageForm) => {
  const navigation = useRouteNavigation(Route)

  const onChangeCheckbox = async (checked: boolean) => {
    await navigation.patchUiState({
      _check: checked,
    })
  }

  const onSubmit = async () => {
    const valid = await form.trigger()
    if (!valid) {
      return
    }

    const formValues = form.getValues()

    await navigation.navigate({
      to: '/crud/summary',
      search: {
        keyword: formValues.keyword,
        category: formValues.category,
      },
    })
  }

  return {
    onChangeCheckbox,
    onSubmit,
  }
})
