import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  createFormResolver,
  type FormInputValues,
  type FormOutputValues,
} from '#/features/utils/useFormSchema'

// ─────────────────────────────────────
// Schema Definition
// ─────────────────────────────────────

const inputSchema = z.strictObject({
  keyword: z.string().optional(),
  category: z.string().optional(),
})

const schemaDefinition = createFormResolver(inputSchema)

export type UsePageFormReturn = ReturnType<typeof usePageForm>
export type PageFormValues = FormInputValues<typeof schemaDefinition.schema>
export type PageFormOutputValues = FormOutputValues<
  typeof schemaDefinition.schema
>

// ─────────────────────────────────────
// Form Hook
// ─────────────────────────────────────

export const usePageForm = () => {
  const form = useForm<PageFormValues>({
    resolver: schemaDefinition.resolver,
  })
  return form
}
