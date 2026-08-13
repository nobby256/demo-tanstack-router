import { RouterProvider } from '@tanstack/react-router'
import { createEnhancedRouter } from '@vendor/router-enhancer'
import { configureClient } from 'demo-api-client/fetch'
import { ofetch } from 'ofetch'
import ReactDOM from 'react-dom/client'

import { ErrorComponent } from '#/features/components/ErrorComponent'

import { appConfig } from './app-config'
import { routeTree } from './routeTree.gen'

// ─────────────────────────────────────
// Router Settings
// ─────────────────────────────────────

const router = createEnhancedRouter({
  routeTree,
  scrollRestoration: true,
  defaultErrorComponent: ErrorComponent,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// ─────────────────────────────────────
// API Client Settings
// ─────────────────────────────────────

/**
 * DEMOモード時はMSWを起動しAPI通信をモックに差し替える。
 */
if (appConfig.demoMode) {
  const { startMockWorker } = await import('demo-api-client/msw')
  await startMockWorker()
}

/**
 * アプリ全体で利用するAPI Clientを初期化する。
 */
configureClient(
  ofetch.create({
    baseURL: appConfig.apiBaseUrl,
  }),
)

// ─────────────────────────────────────
// Application Bootstrap
// ─────────────────────────────────────

function bootstrap() {
  const rootElement = document.getElementById('app')

  if (!rootElement) {
    throw new Error('Root element #app not found')
  }

  const root = ReactDOM.createRoot(rootElement)

  root.render(
    <>
      {/*TanStack Router本体*/}
      <RouterProvider router={router} />
    </>,
  )
}

bootstrap()
