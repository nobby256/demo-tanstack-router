/**
 * document unload を伴うアプリ離脱ガードを登録します。
 *
 * 対象:
 * - タブクローズ
 * - リロード
 * - URL 直接入力
 * - 外部サイト遷移など document unload を伴う遷移
 *
 * この機能は document unload を伴う全ての離脱操作
 * （リロード、タブクローズ、URL直接入力、外部サイト遷移）を対象とします。
 * ブラウザ仕様上、リロードのみを対象にすることはできません。
 *
 * また、ブラウザ標準の確認ダイアログが表示され、文言はカスタマイズできません。
 *
 * 戻り値として解除関数を返します。
 */
export function registerAppExitGuard() {
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    event.preventDefault()
  }

  window.addEventListener('beforeunload', handleBeforeUnload)

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
}
