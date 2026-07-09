import { zodResolver } from '@hookform/resolvers/zod'
import { UpdateBody } from 'demo-api-client/zod/detail_page'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Route } from './route'

// ─────────────────────────────────────
// Form Hook
// ─────────────────────────────────────

// UIフォーム用スキーマはAPI Bodyを変換して定義する
const formSchema = UpdateBody.omit({
  // none
}).extend({
  // none
})

export type FormValues = z.infer<typeof formSchema>

export const usePageForm = () => {
  const loaderData = Route.useLoaderData()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })
  useEffect(() => {
    form.reset({
      ...loaderData,
    })
  }, [loaderData, form.reset])

  return form
}

export type PageForm = ReturnType<typeof usePageForm>
