/**
 * Zod の raw issue / finalized issue の両方に対して使える、
 * 「必須エラー候補」の最小構造。
 */
export type RequiredIssueCandidate = {
  code: string
  input?: unknown
}

/**
 * このアプリケーションにおける必須エラーかどうかを判定する。
 *
 * 前提:
 * - React の controlled input が保持する '' を、
 *   normalizeEmptyStrings() により undefined へ変換してから Zod に渡す。
 * - non-optional な Zod schema が undefined を受けると invalid_type になる。
 */
export function isRequiredIssue(issue: RequiredIssueCandidate): boolean {
  return (
    (issue.code === 'invalid_type' &&
      'input' in issue &&
      issue.input === undefined) ||
    Number.isNaN(issue.input)
  )
}
