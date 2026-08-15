import {
  type FormValues,
  type MutationValues,
  useMutationForm,
} from '@vendor/mutation-form'

import { Route, zod } from './-page-deps-internal'
// ─────────────────────────────
// Types
// ─────────────────────────────

export type UsePageFormReturn = ReturnType<typeof usePageForm>
export type PageFormInputValues = FormValues<UsePageFormReturn>
export type PageFormOutputValues = MutationValues<UsePageFormReturn>

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
