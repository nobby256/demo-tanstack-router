import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Route, schema } from './-page-deps-internal'

// ─────────────────────────────────────
// Form Hook
// ─────────────────────────────────────

export const formSchema = schema.ErrorHandlingPageDoneBody
export type FormValues = z.infer<typeof formSchema>
export type PageForm = ReturnType<typeof usePageForm>

export const usePageForm = () => {
  const loaderData = Route.useLoaderData()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: loaderData.data,
  })
  useEffect(() => {
    form.reset({
      ...loaderData.data,
    })
  }, [loaderData])

  return form
}
