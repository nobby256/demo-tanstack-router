import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import {
  definePageFormSchema,
  type FormInputValues,
  type FormOutputValues,
} from '#/features/utils/definePageFormSchema'

import { Route, schema } from './-page-deps-internal'

// ─────────────────────────────────────
// Schema Definition
// ─────────────────────────────────────

const pageFormSchema = definePageFormSchema({
  inputSchema: schema.SummaryPageLoadResponse.shape.data,
})

export type UsePageFormReturn = ReturnType<typeof usePageForm>
export type PageFormValues = FormInputValues<typeof pageFormSchema>
export type PageFormOutputValues = FormOutputValues<typeof pageFormSchema>

// ─────────────────────────────────────
// Form Hook
// ─────────────────────────────────────

export const usePageForm = () => {
  const loaderData = Route.useLoaderData()

  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: loaderData.data,
  })
  useEffect(() => {
    form.reset(loaderData.data)
  }, [loaderData.data])

  return form
}
