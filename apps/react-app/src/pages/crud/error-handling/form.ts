import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Route, schema } from './-page-deps-internal'

// ─────────────────────────────────────
// Form Hook
// ─────────────────────────────────────

const pageFormSchema =
  schema.ErrorHandlingPageLoadResponse.shape.data.transform((input) =>
    schema.ErrorHandlingPageDoneBody.parse(input),
  )

export type PageFormValues = z.input<typeof pageFormSchema>
export type PageFormTransformValues = z.output<typeof pageFormSchema>
export type UsePageFormReturn = ReturnType<typeof usePageForm>

export const usePageForm = () => {
  const loaderData = Route.useLoaderData()

  const form = useForm<PageFormValues, unknown, PageFormTransformValues>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: loaderData.data,
  })
  useEffect(() => {
    form.reset(loaderData.data)
  }, [loaderData.data])

  return form
}
