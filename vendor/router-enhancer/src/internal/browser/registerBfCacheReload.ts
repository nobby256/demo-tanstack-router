/**
 * BFCache（Back-Forward Cache）からの復元を検知し、
 * ページを強制的に再読み込みします。
 *
 * BFCache はブラウザの戻る・進む操作を高速化するための仕組みで、
 * ページ全体（JavaScript実行状態、React状態、Router状態など）を
 * メモリ上に保持したまま復元することがあります。
 *
 * 本ライブラリでは、過去のアプリケーション状態を利用者へ見せたくない
 * 場合にこの機能を利用します。
 *
 * 例えば、継続不能エラー発生時に SPA を終了し、
 * ログアウト画面やエラーページへ遷移したとしても、
 * BFCache により古い SPA が復元される可能性があります。
 *
 * この機能を有効にすると、BFCache からの復元を検知した時点で
 * window.location.reload() を実行し、
 * 常に最新状態をサーバーから再取得します。
 *
 * サンプル:
 *
 *   1. ユーザーが SPA を操作中
 *   2. 継続不能エラーが発生
 *   3. window.location.href により BFF へ遷移
 *   4. BFF がログアウト処理を実行
 *   5. ユーザーがブラウザの「戻る」を押下
 *   6. BFCache により古い SPA が復元される
 *   7. pageshow(event.persisted === true) を検知
 *   8. ページをリロード
 *   9. 最新の認証状態でアプリを再初期化
 *
 * 戻り値として解除関数を返します。
 *
 * 注意:
 * SPA 内の通常の Router 遷移には影響しません。
 * BFCache によるページ復元時のみ動作します。
 *
 */
export function registerBfCacheReload() {
  const handlePageShow = (event: PageTransitionEvent) => {
    if (event.persisted) {
      // eslint-disable-next-line no-restricted-properties
      window.location.reload()
    }
  }

  window.addEventListener('pageshow', handlePageShow)

  return () => {
    window.removeEventListener('pageshow', handlePageShow)
  }
}
