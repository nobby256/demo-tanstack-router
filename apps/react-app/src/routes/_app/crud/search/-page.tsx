import { useRouteNavigation } from '@vendor/router-enhancer'
import { FormProvider } from 'react-hook-form'

import { usePageEvents } from './-event'
import { usePageForm } from './-form'
import { Route } from './route'

// ─────────────────────────────────────
// Page Component
// ─────────────────────────────────────

export function Page() {
  const navigation = useRouteNavigation(Route)
  const form = usePageForm()
  const events = usePageEvents()

  return (
    <FormProvider {...form}>
      <div>
        <h2>Search</h2>
        <form onSubmit={form.handleSubmit(events.onSubmit)}>
          <div>
            <input placeholder="keyword" {...form.register('keyword')} />
            {form.formState.errors.keyword && (
              <span className="error-message">
                {form.formState.errors.keyword.message}
              </span>
            )}
          </div>
          <div>
            <input placeholder="category" {...form.register('category')} />
            {form.formState.errors.category && (
              <span className="error-message">
                {form.formState.errors.category.message}
              </span>
            )}
          </div>
          <div>
            <input
              type="checkbox"
              checked={navigation.uiState._check ?? false}
              onChange={(e) => events.onChangeCheckbox(e.target.checked)}
            />
          </div>
          <div>
            <button type="submit">Search</button>
          </div>
        </form>
      </div>
    </FormProvider>
  )
}
