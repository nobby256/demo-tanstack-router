import { zodResolver } from '@hookform/resolvers/zod'
import { event, useRouteNavigation } from '@vendor/router-enhancer'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Route } from '../route'

// ─────────────────────────────────────
// Form Definition
// ─────────────────────────────────────
const formSchema = z.strictObject({
  keyword: z.string(),
  category: z.string(),
})
type FormValues = z.infer<typeof formSchema>

// ─────────────────────────────────────
// Page Component
// ─────────────────────────────────────
export function Page() {
  const navigation = useRouteNavigation(Route)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })
  const errors = form.formState.errors

  const onChangeCheckbox = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await navigation.patchUiState({
      _check: e.target.checked,
    })
  }

  const submitSearch = async (data: FormValues) => {
    await navigation.navigate({
      to: '/crud/summary',
      search: {
        keyword: data.keyword,
        category: data.category,
      },
    })
  }

  return (
    <div>
      <h2>Search</h2>
      <form onSubmit={event(form.handleSubmit(submitSearch))}>
        <div>
          <input placeholder="keyword" {...form.register('keyword')} />
          {errors.keyword && (
            <span className="error-message">{errors.keyword.message}</span>
          )}
        </div>
        <div>
          <input placeholder="category" {...form.register('category')} />
          {errors.category && (
            <span className="error-message">{errors.category.message}</span>
          )}
        </div>
        <div>
          <input
            type="checkbox"
            checked={navigation.uiState._check ?? false}
            onChange={event(onChangeCheckbox)}
          />
        </div>
        <div>
          <button type="submit">Search</button>
        </div>
      </form>
    </div>
  )
}
