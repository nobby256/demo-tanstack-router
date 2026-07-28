import { type ParsedLocation } from '@tanstack/react-router'

declare module '@tanstack/history' {
  interface HistoryState {
    /**
     * navigate() の state 経由で shouldReload を上書きします。
     *
     * Route の shouldReload に locationStateShouldReload() が設定されている場合、
     * この値が優先して評価されます。
     */
    shouldReload?: boolean

    /**
     * navigation に関する内部情報です。
     *
     * ライブラリ内部で使用されるため、
     * アプリケーションコードから参照・設定しないでください。
     */
    __navigationTracker?: {
      /**
       * 遷移中にエラーが発生した場合のロールバック先のLocationです。
       *
       * navigate() による遷移時のみ設定され、
       * ブラウザ履歴による移動やURLへの直接アクセス時は undefined になります。
       */
      rollbackLocation?: ParsedLocation

      /**
       * ロールバックの原因となったエラーです。
       */
      rollbackCause?: unknown
    }
  }
}
