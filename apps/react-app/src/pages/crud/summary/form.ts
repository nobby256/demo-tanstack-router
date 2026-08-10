import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import {
  createFormResolver,
  type FormInputValues,
  type FormOutputValues,
} from '#/features/utils/useFormSchema'

import { Route, schema } from './-page-deps-internal'

// ─────────────────────────────────────
// Schema Definition
// ─────────────────────────────────────

const schemaDefinition = createFormResolver(
  schema.SummaryPageLoadResponse.shape.data,
)

export type UsePageFormReturn = ReturnType<typeof usePageForm>
export type PageFormValues = FormInputValues<typeof schemaDefinition.schema>
export type PageFormOutputValues = FormOutputValues<
  typeof schemaDefinition.schema
>

// ─────────────────────────────────────
// Form Hook
// ─────────────────────────────────────

export const usePageForm = () => {
  const loaderData = Route.useLoaderData()

  const form = useForm<PageFormValues>({
    resolver: schemaDefinition.resolver,
    defaultValues: loaderData.data,
  })
  useEffect(() => {
    form.reset(loaderData.data)
  }, [loaderData.data])

  return form
}
