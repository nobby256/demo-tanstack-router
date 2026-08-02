import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// ─────────────────────────────────────
// Form Hook
// ─────────────────────────────────────

const formSchema = z.strictObject({
  keyword: z.string().optional(),
  category: z.string().optional(),
})
export type FormValues = z.infer<typeof formSchema>
export type PageForm = ReturnType<typeof usePageForm>

export const usePageForm = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })
  return form
}
