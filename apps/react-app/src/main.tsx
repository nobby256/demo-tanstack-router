import { RouterProvider } from '@tanstack/react-router'
import { createEnhancedRouter, normalizeError } from '@vendor/router-enhancer'
import { configureFetch } from 'demo-api-client/fetch'
import { ofetch } from 'ofetch'
import ReactDOM from 'react-dom/client'

import { appConfig } from './app-config'
import { ErrorComponent } from './features/fallback-page/ErrorComponent'
import { NotificationProvider } from './features/notification'
import { routeTree } from './routeTree.gen'

// ─────────────────────────────────────
// Router Settings
// ─────────────────────────────────────

const router = createEnhancedRouter({
  routeTree,
  scrollRestoration: true,
  defaultErrorComponent: ErrorComponent,
  context: {
    canRollbackNavigationError(error) {
      const appError = normalizeError(error)
      return appError.category === 'Recoverble'
    },
  },
})

/**
 * TanStack Router の型登録。
 *
 * useNavigate、useRouter、Link などで
 * routeTree ベースの型推論を有効化する。
 */
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// ─────────────────────────────────────
// API Client Settings
// ─────────────────────────────────────

/**
 * DEMOモード時はMSWを起動し、
 * API通信をモックに差し替える。
 */
if (appConfig.demoMode) {
  const { startMockWorker } = await import('demo-api-client/msw')
  await startMockWorker()
}

/**
 * アプリ全体で利用するAPI Clientを初期化する。
 */
configureFetch(
  ofetch.create({
    baseURL: appConfig.apiBaseUrl,
    headers: {
      Accept: 'application/problem+json, application/json',
    },
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

  /**
   * NotificationProvider
   *   └ 通知イベントをUIへ反映
   *
   * RouterProvider
   *   └ TanStack Router本体
   */
  root.render(
    <>
      <NotificationProvider />
      <RouterProvider router={router} />
    </>,
  )
}

bootstrap()
