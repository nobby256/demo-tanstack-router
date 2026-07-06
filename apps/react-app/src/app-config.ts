/**
 * Vite が提供する環境変数およびビルド時定数の型定義。
 *
 * - VITE_* は import.meta.env 経由で参照する環境変数
 * - __DEMO_MODE__ は vite.config.ts の define により注入される定数
 *
 * 環境変数を追加した場合は、この型定義と appConfig の両方を更新すること。
 */
declare global {
  interface ImportMetaEnv {
    /**
     * API サーバーのベース URL。
     *
     * 例:
     * - http://localhost:8080
     * - https://api.example.com
     */
    readonly VITE_API_BASE_URL: string
  }

  /**
   * DEMO モード実行フラグ。
   *
   * vite.config.ts の define によりビルド時に true / false へ置換される。
   */
  const __DEMO_MODE__: boolean
}

/**
 * アプリケーション設定。
 *
 * Vite 固有の import.meta.env や define 定数を隠蔽し、
 * アプリケーションコードからは本オブジェクト経由で参照する。
 */
export const appConfig = {
  /**
   * API サーバーのベース URL。
   */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,

  /**
   * DEMO モード有効フラグ。
   */
  demoMode: __DEMO_MODE__,
} as const

export {}
