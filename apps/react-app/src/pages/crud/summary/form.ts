import {
  type FormInput,
  type FormOutput,
  useMutationForm,
} from '@vendor/mutation-form'
import { type Control, useFormContext } from 'react-hook-form'

import { Route, zod } from './-page-deps-internal'

// ─────────────────────────────
// MutationModel
// ─────────────────────────────

const mutationSchema = zod.SummaryPageMutationModel

// ─────────────────────────────
// Types
// ─────────────────────────────

export type UsePageFormReturn = ReturnType<typeof usePageForm>
export type PageFormInput = FormInput<UsePageFormReturn>
export type PageFormOutput = FormOutput<UsePageFormReturn>
export type PageFormControl = Control<PageFormInput, unknown, PageFormOutput>

// ─────────────────────────────────────
// Form Hook
// ─────────────────────────────────────

export const usePageForm = () => {
  const defaultValues = Route.useLoaderData()

  const form = useMutationForm({
    mutationSchema,
    defaultValues,
  })

  return form
}

export function usePageFormContext() {
  return useFormContext<PageFormInput, unknown, PageFormOutput>()
}
