import { Link } from '@tanstack/react-router'

import { normalizeError } from '#/features/error'

type ErrorComponentProps = {
  error: Error
  reset: () => void
}

export function ErrorComponent(props: ErrorComponentProps) {
  const error = props.error
  const appError = normalizeError(error)

  // 継続不能の場合はSPA外のページにリダイレクトする
  if (appError.category === 'Fatal') {
    const statusCode = appError.statusCode
    const url = import.meta.env.DEV ? '/fatal-error.html' : '/fatal-error'
    // eslint-disable-next-line no-restricted-properties
    window.location.href = `${url}?status=${statusCode}`
    return
  }

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
