import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { type FormInput } from '#/features/form/helper'

import { Route } from './-page-deps-internal'

// ─────────────────────────────
// Types
// ─────────────────────────────

export type UsePageFormReturn = ReturnType<typeof usePageForm>
export type PageFormValues = FormInput<UsePageFormReturn>

// ─────────────────────────────────────
// Form Hook
// ─────────────────────────────────────

export const usePageForm = () => {
  const defaultValues = Route.useLoaderData()

  const form = useForm({
    defaultValues,
  })
  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form.reset])

  return form
}
