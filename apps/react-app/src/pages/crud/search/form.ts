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

const inputSchema = z.strictObject({
  keyword: z.string().optional(),
  category: z.string().optional(),
})

export const usePageForm = () => {
  const form = usePlainForm({
    schema: inputSchema,
  })
  return form
}
