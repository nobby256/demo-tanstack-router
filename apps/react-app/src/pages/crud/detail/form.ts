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
export type PageFormInput = FormInput<UsePageFormReturn>
export type PageFormOutput = FormOutput<UsePageFormReturn>

// ─────────────────────────────────────
// Form Hook
// ─────────────────────────────────────

export const usePageForm = () => {
  const loaderData = Route.useLoaderData()

  const form = useMutationForm({
    mutationSchema: zod.DetailPageMutationModel,
    defaultValues: loaderData,
  })

  return form
}
