import { RouterProvider } from '@tanstack/react-router'
import {
  createEnhancedRouter,
  type EventErrorStrategy,
  type NavigationErrorStrategy,
} from '@vendor/router-enhancer'
import { configureFetch } from 'demo-api-client/fetch'
import { ofetch } from 'ofetch'
import ReactDOM from 'react-dom/client'

import { appConfig } from './app-config'
import { GonePageComponent } from './features/fallback-page/GonePageComponent'
import { notificationBus, NotificationProvider } from './features/notification'
import { routeTree } from './routeTree.gen'

// ─────────────────────────────────────
// Router Enhancer Settings
// ─────────────────────────────────────

/**
 * Navigation（画面遷移）中に発生したエラーの処理方法を定義する。
 *
 * 画面遷移中はアプリケーション状態の整合性を優先するため、
 * エラー種別ごとに異なる復旧戦略を適用する。
 *
 * - fatal       : アプリケーションの継続が困難なエラー
 * - gone        : 期限切れリソースへのアクセス（HTTP 410）
 * - recoverable : 通知のみで継続可能なエラー
 */
const navigationErrorStrategy: NavigationErrorStrategy = {
  /**
   * 継続不能なエラー。
   *
   * 現在のSPA状態を信頼できないため、
   * 専用エラー画面への遷移やアプリケーションの再初期化を行う。
   *
   * 戻り値を返した場合はフォールバック画面として表示される。
   * window.location.href で遷移する場合は値を返さないこと。
   */
  fatal: {
    fallback: (error) => {
      const statusCode = error.statusCode
      const url = import.meta.env.DEV ? '/fatal-error.html' : '/fatal-error'
      // eslint-disable-next-line no-restricted-properties
      window.location.href = `${url}?status=${statusCode}`
    },
  },

  /**
   * 期限切れエラー（HTTP 410 Gone）。
   *
   * ブラウザ履歴から戻った際など、
   * 既に無効となったリソースへのアクセスで発生する。
   *
   * 利用者向けのフォールバック画面を表示する。
   */
  gone: {
    fallback: (error) => {
      return GonePageComponent(error)
    },
  },

  /**
   * 継続可能なエラー。
   *
   * 現在の画面状態を維持したまま遷移を中止し、
   * 利用者へエラー内容を通知する。
   */
  recoverable: {
    onError: (error) => {
      notificationBus.emit('notification', {
        type: 'error',
        error,
      })
    },
  },
}

/**
 * イベント処理中に発生したエラーの処理方法を定義する。
 *
 * ボタン押下や保存処理など、ユーザー操作に起因するエラーを対象とする。
 *
 * イベント処理ではアプリケーション状態の整合性よりも
 * ユーザー入力の保持を優先するため、エラー種別に関わらず
 * 現在の画面を維持したまま通知を行う。
 */
const eventErrorStrategy: EventErrorStrategy = {
  onError: (error) => {
    notificationBus.emit('notification', {
      type: 'error',
      error,
    })
  },
}

const router = createEnhancedRouter({
  routeTree,
  scrollRestoration: true,

  enhance: {
    navigationErrorStrategy,
    eventErrorStrategy,
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
