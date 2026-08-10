/**
 * Page Internal Dependencies Convention
 *
 * このファイルはページ内部で利用する依存関係の集約窓口です。
 *
 * page.tsx / form.ts / action.ts などのページ構成要素は、
 * 原則として依存関係を個別取得せず、本ファイル経由で取得します。
 *
 * 目的:
 * - import文の統一
 * - ページ構造のテンプレート化
 * - pages配下のみで開発を完結させる
 * - 開発者がライブラリや依存モジュールの場所を意識しないようにする
 *
 * このファイルは外部公開APIではなく、
 * ページ内部実装のための依存関係集約ファイルです。
 */

export * as operation from 'demo-api-client/op/summary-page'
export * as model from 'demo-api-client/model/summary-page'
export * as schema from 'demo-api-client/zod/summary-page'
export { Route } from '#/routes/crud.summary'
export {
  usePageForm,
  type PageFormValues,
  type PageFormOutputValues,
  type UsePageFormReturn,
} from './form'
export { useActions } from './action'
