import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { model, Route } from './-page-deps-internal'

// ─────────────────────────────
// Types
// ─────────────────────────────

export type ViewModel = model.DetailPageViewModelOutput
export type UsePageFormReturn = ReturnType<typeof usePageForm>

// ─────────────────────────────────────
// Form Hook
// ─────────────────────────────────────

export const usePageForm = () => {
  const defaultValues = Route.useLoaderData()

  const form = useForm<ViewModel>({
    defaultValues,
  })
  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form.reset])

  return form
}
