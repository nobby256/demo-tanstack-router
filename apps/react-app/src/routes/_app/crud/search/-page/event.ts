import { createEventHook, useRouteNavigation } from '@vendor/router-enhancer'

import { Route } from '../route'
import { type FormValues } from './form'

// ─────────────────────────────────────
// Event Hook
// ─────────────────────────────────────

export const usePageEvents = createEventHook(() => {
  const navigation = useRouteNavigation(Route)

  const onChangeCheckbox = async (checked: boolean) => {
    await navigation.patchUiState({
      _check: checked,
    })
  }

  const onSubmit = async (formValues: FormValues) => {
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
