import {
  type FormValues,
  type MutationValues,
  useMutationForm,
} from '@vendor/mutation-form'

import { zod } from './-page-deps-internal'
import { Route } from './-page-deps-internal'

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
    mutationSchema: zod.SearchPageMutationModel,
    defaultValues: loaderData,
  })

  return form
}
