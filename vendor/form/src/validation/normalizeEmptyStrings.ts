// src/validation/normalizeEmptyStrings.ts

/**
 * React controlled input が扱う空文字列、または空白文字だけから成る文字列を、
 * 検証境界で「値なし」を意味する undefined に正規化する。
 *
 * 例:
 * ''       -> undefined
 * '   '    -> undefined
 * '\t\n'   -> undefined
 * ' 山田 ' -> ' 山田 '  // 文字列そのものは変更しない
 */
export function normalizeEmptyStrings<T>(value: T): T {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined as T
  }

  if (Array.isArray(value)) {
    return value.map(normalizeEmptyStrings) as T
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        normalizeEmptyStrings(item),
      ]),
    ) as T
  }

  return value
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return false
  }

  return Object.getPrototypeOf(value) === Object.prototype
}
