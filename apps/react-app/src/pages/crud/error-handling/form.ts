import {
  type FormInput,
  type FormOutput,
  useRequestForm,
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

  const form = useRequestForm({
    inputSchema: schema.ErrorHandlingPageLoadResponse,
    outputSchema: schema.ErrorHandlingPageDoneBody,
    values: loaderData,
  })

  return form
}
