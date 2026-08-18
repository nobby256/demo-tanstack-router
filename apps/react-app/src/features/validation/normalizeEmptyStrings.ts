// src/validation/normalizeEmptyStrings.ts

/**
 * React controlled input が扱う空文字列を、
 * 検証境界で「値なし」を意味する undefined に正規化する。
 *
 * 例:
 * { name: '', details: { memo: '' } }
 * ↓
 * { name: undefined, details: { memo: undefined } }
 */
export function normalizeEmptyStrings<T>(value: T): T {
  if (value === '') {
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
