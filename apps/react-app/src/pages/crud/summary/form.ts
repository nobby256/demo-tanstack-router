import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// ─────────────────────────────────────
// Form Hook
// ─────────────────────────────────────

const pageFormSchema = z.strictObject({
  keyword: z.string(),
  category: z.string(),
})

export type PageFormValues = z.input<typeof pageFormSchema>
export type PageFormTransformValues = z.output<typeof pageFormSchema>
export type UsePageFormReturn = ReturnType<typeof usePageForm>

export const usePageForm = () => {
  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageFormSchema),
  })
  return form
}
