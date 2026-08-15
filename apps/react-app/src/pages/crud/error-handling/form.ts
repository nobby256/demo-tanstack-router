import {
  type FormValues,
  type RequestValues,
  useRequestForm,
  // } from '@vendor/router-enhancer'
} from '#/features/hooks/useRequestForm'

import { Route, schema } from './-page-deps-internal'

// ─────────────────────────────
// Types
// ─────────────────────────────

export type UsePageFormReturn = ReturnType<typeof usePageForm>
export type PageFormInputValues = FormValues<UsePageFormReturn>
export type PageFormOutputValues = RequestValues<UsePageFormReturn>

// ─────────────────────────────────────
// Form Hook
// ─────────────────────────────────────

export const usePageForm = () => {
  const loaderData = Route.useLoaderData()

  const form = useRequestForm({
    requestSchema: schema.ErrorHandlingPageDoneBody,
    defaultValues: loaderData,
  })

  return form
}
