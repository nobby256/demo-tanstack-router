import { z } from 'zod'

import {
  type FormInput,
  type FormOutput,
  usePlainForm,
} from '#/features/utils/useForm'

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
  const form = usePlainForm({
    schema: z.strictObject({
      data: z.object({
        keyword: z.string().optional().default(''),
        category: z.string().optional().default(''),
      }),
    }),
  })
  return form
}
