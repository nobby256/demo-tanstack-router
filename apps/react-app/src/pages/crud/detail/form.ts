import {
  type FormInput,
  type FormOutput,
  useRequestForm,
} from '@vendor/router-enhancer'

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

  const form = useRequestForm({
    inputSchema: schema.DetailPageLoadResponse,
    outputSchema: schema.DetailPageUpdateBody,
    defaultValues: loaderData,
  })

  return form
}
