import { Link } from '@tanstack/react-router'
import { normalizeError } from '@vendor/router-enhancer'

export function GonePageComponent(error: unknown) {
  const appError = normalizeError(error)
  const message =
    appError.statusCode == 410
      ? 'この処理は既に完了しています。'
      : 'この処理は継続できません。'
  return (
    <>
      <div>
        <h2>Gone</h2>
        {message} <br />
        ホーム画面から再度操作してください。
      </div>
      <Link to="/crud/search" replace={true}>
        ホーム画面に戻る
      </Link>
    </>
  )
}
