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
     * transit transaction 用の内部情報
     */
    __navigationTracker?: {
      /**
       * 遷移中にエラーが発生した場合のリダイレクト先です。
       *
       * navigate() による遷移時のみ設定され、
       * ブラウザ履歴による移動やURLへの直接アクセス時は undefined になります。
       */
      redirectLocation?: ParsedLocation

      /**
       * リダイレクトの原因となったエラーです。
       */
      redirectCause?: unknown
    }
  }
}
