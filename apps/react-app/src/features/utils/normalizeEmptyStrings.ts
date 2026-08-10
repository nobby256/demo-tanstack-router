/**
 * フォームから送信されたデータ内の空文字("")を再帰的に undefined へ変換する。
 *
 * React の input コンポーネントは value に空文字("")を使用することが多いが、
 * 更新用のスキーマでは optional 項目を undefined として扱いたい場合がある。
 *
 * 例えば以下のようなデータを:
 *
 * {
 *   name: "",
 *   amount: "",
 *   memo: "テスト"
 * }
 *
 * 以下のように変換する:
 *
 * {
 *   name: undefined,
 *   amount: undefined,
 *   memo: "テスト"
 * }
 *
 * この関数は z.preprocess() から呼び出すことを想定している。
 *
 * 使用例:
 *
 * const updateBodySchema = z.preprocess(
 *   normalizeEmptyStrings,
 *   schema.DetailPageUpdateBody,
 * );
 *
 * updateBodySchema.parse({
 *   name: "",
 *   amount: "",
 * });
 *
 * 上記の場合、parse の前に以下へ変換される。
 *
 * {
 *   name: undefined,
 *   amount: undefined,
 * }
 *
 * 配列やネストしたオブジェクトも再帰的に変換する。
 * Date は変換対象外とする。
 */
export function normalizeEmptyStrings<T>(value: T): T {
  // 空文字は未入力として扱い undefined に変換する
  if (value === '') {
    return undefined as T
  }

  // 配列の各要素を再帰的に変換する
  if (Array.isArray(value)) {
    return value.map(normalizeEmptyStrings) as T
  }

  // オブジェクトの各プロパティを再帰的に変換する
  // Date はそのまま保持する
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        normalizeEmptyStrings(val),
      ]),
    ) as T
  }

  // 上記以外の値はそのまま返す
  return value
}
