import {
  type FormInput,
  type FormOutput,
  useMutationForm,
} from '@vendor/mutation-form'

import { Route, zod } from './-page-deps-internal'

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

  const form = useMutationForm({
    mutationSchema: zod.ErrorHandlingPageMutationModel,
    defaultValues: loaderData,
  })

  return form
}
