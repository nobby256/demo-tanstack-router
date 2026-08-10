import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  definePageFormSchema,
  type FormInputValues,
  type FormOutputValues,
} from '#/features/utils/definePageFormSchema'

// ─────────────────────────────────────
// Schema Definition
// ─────────────────────────────────────

const inputSchema = z.strictObject({
  keyword: z.string().optional(),
  category: z.string().optional(),
})

const pageFormSchema = definePageFormSchema({
  inputSchema,
})

export type UsePageFormReturn = ReturnType<typeof usePageForm>
export type PageFormValues = FormInputValues<typeof pageFormSchema>
export type PageFormOutputValues = FormOutputValues<typeof pageFormSchema>

// ─────────────────────────────────────
// Form Hook
// ─────────────────────────────────────

export const usePageForm = () => {
  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageFormSchema),
  })
  return form
}
