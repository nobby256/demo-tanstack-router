import { useEffect } from 'react'

import {
  type FormInput,
  type FormOutput,
  usePlainForm,
} from '#/features/utils/useForm'

import { Route, schema } from './-page-deps-internal'

// ─────────────────────────────
// Types
// ─────────────────────────────

export type UsePageFormReturn = ReturnType<typeof usePageForm>
export type PageFormInputValues = FormInput<UsePageFormReturn>
export type PageFormOutputValues = FormOutput<UsePageFormReturn>

// ─────────────────────────────────────
// Form Hook
// ─────────────────────────────────────

export const usePageForm = () => {
  const loaderData = Route.useLoaderData()

  const form = usePlainForm({
    schema: schema.SummaryPageLoadResponse,
    defaultValues: loaderData,
  })
  useEffect(() => {
    form.reset(loaderData)
  }, [loaderData])

  return form
}
