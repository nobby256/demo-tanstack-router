import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import {
  type DefaultValues,
  type FieldValues,
  useForm,
  type UseFormReturn,
} from 'react-hook-form'
import { z } from 'zod'

/**
 * フォームが画面上で保持する値の型を取り出す。
 *
 * RHF のフォーム状態、すなわち画面用 ViewModel の型である。
 * 画面が編集途中の値を保持できるよう、API Request の型とは異なってよい。
 *
 * 例:
 * - 数値入力を `string` として保持する
 * - 未入力を `undefined` ではなく `""` として保持する
 * - 入力途中・形式不正の値を保持する
 *
 * `watch`、`getValues`、`setValue`、`reset`、`register` などで扱う値の型。
 */
export type FormInput<TForm> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TForm extends UseFormReturn<infer TInput, any, any> ? TInput : never

/**
 * resolver が成功時に返す、フォーム出力値の型を取り出す。
 *
 * `handleSubmit` の成功コールバックで受け取る値の型。
 * API Request、ユースケース入力、検索条件など、フォーム外へ渡す値を想定する。
 *
 * useRequestForm では、空文字の正規化・outputSchema による変換・検証後の値となる。
 * useTransformForm では、任意の transform 関数が返す値となる。
 *
 * 例:
 * - `""` は `undefined` へ正規化済み
 * - `"123"` は `123` へ数値変換済み
 * - useRequestForm の場合、必須・形式・項目間整合性などを検証済み
 */
export type FormOutput<TForm> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TForm extends UseFormReturn<any, any, infer TOutput> ? TOutput : never

/**
 * 単一スキーマで完結するフォーム。
 *
 * Page ViewModel から更新 API Request を射影する用途や、
 * 任意の変換関数を使う用途ではなく、単一の Zod スキーマで
 * 入力値の検証・変換を完結させる場合に使用する。
 *
 * schema 自身が transform / coerce を持つ場合、`TInput` と `TOutput` は異なり得る。
 *
 * 注意:
 * schema のパース成功後に空文字を undefined へ正規化する。
 * 正規化後に別の outputSchema で再検証は行わない。
 *
 * @example
 * const form = usePlainForm({
 *   schema: z.object({
 *     keyword: z.string(),
 *   }),
 *   defaultValues: {
 *     keyword: '',
 *   },
 * })
 */
export function usePlainForm<
  TInput extends FieldValues,
  TOutput extends FieldValues,
>(config: {
  /**
   * 入力値の検証・変換を行う単一の Zod スキーマ。
   *
   * Input: RHF が保持する画面用の値
   * Output: submit 成功時に取得する値
   */
  schema: z.ZodType<TOutput, TInput>

  /**
   * RHF が保持する画面用 ViewModel の初期値。
   *
   * defaultValues は画面が保持する値なので、
   * TOutput ではなく常に TInput で指定する。
   *
   * defaultValues が変更された場合、
   * フォームは自動的に reset される。
   */
  defaultValues?: DefaultValues<TInput>
}) {
  const formSchema = config.schema.transform((input) =>
    normalizeEmptyStrings(input),
  )

  const form = useForm<TInput, unknown, TOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: config.defaultValues,
  })

  useEffect(() => {
    if (config.defaultValues) {
      form.reset(config.defaultValues)
    }
  }, [config.defaultValues, form])

  return form
}

/**
 * Page ViewModel を更新 API Request / Command へ変換するフォーム。
 *
 * 業務画面における更新・登録・操作実行など、API Request を作るフォームの標準とする。
 *
 * TInput は RHF が保持する画面用 ViewModel である。
 * text input 由来の数値・日付なども、編集途中の値を保持するため string としてよい。
 *
 * TOutput は、空文字の正規化、coerce、業務バリデーションを完了した、
 * API やユースケースへ渡せる確定値である。
 *
 * 処理順:
 *
 * TInput
 *   → inputSchema
 *   → normalizeEmptyStrings
 *   → outputSchema
 *   → TOutput
 *
 * 原則として、必須チェック、形式チェック、数値化、日付変換、
 * 項目間整合性、更新 API Request への射影は outputSchema に置く。
 *
 * @example
 * const form = useRequestForm({
 *   inputSchema: z.object({
 *     name: z.string(),
 *     age: z.string(),
 *   }),
 *   outputSchema: z.object({
 *     name: z.string().min(1),
 *     age: z.coerce.number().int().min(0).optional(),
 *   }),
 *   defaultValues: {
 *     name: '',
 *     age: '',
 *   },
 * })
 */
export function useRequestForm<
  TInput extends FieldValues,
  TParsedInput extends FieldValues,
  TOutput extends FieldValues,
>(config: {
  /**
   * RHF が保持する Page ViewModel を受け取るスキーマ。
   *
   * 通常は、画面用 ViewModel の構造を表すことが主目的である。
   * 業務上の必須チェック、厳密な形式チェック、coerce などは
   * 原則として outputSchema 側に置く。
   *
   * inputSchema 自身に transform などを定義した場合、
   * そのパース後の型が TParsedInput となる。
   */
  inputSchema: z.ZodType<TParsedInput, TInput>

  /**
   * 正規化済みの値を、更新 API Request / Command に変換・検証するスキーマ。
   *
   * 次の責務を持つ。
   * - 必須チェック
   * - 文字数・形式・範囲の検証
   * - 項目間整合性の検証
   * - z.coerce.*() などによる型変換
   * - Page ViewModel から更新 API に不要な表示項目の除外
   *
   * parse() が throw する ZodError は zodResolver が捕捉し、
   * RHF の formState.errors へ変換する。
   */
  outputSchema: z.ZodType<TOutput>

  /**
   * RHF が保持する Page ViewModel の初期値。
   *
   * load API の完全な Page ViewModel を、
   * そのまま指定することを想定する。
   *
   * defaultValues が変更された場合、
   * フォームは自動的に reset されるため、
   * 利用側で reset() を呼ぶ必要はない。
   */
  defaultValues?: DefaultValues<TInput>
}) {
  const formSchema = config.inputSchema.transform((input) =>
    config.outputSchema.parse(normalizeEmptyStrings(input)),
  )

  const form = useForm<TInput, unknown, TOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: config.defaultValues,
  })

  useEffect(() => {
    if (config.defaultValues) {
      form.reset(config.defaultValues)
    }
  }, [config.defaultValues, form])

  return form
}

/**
 * 任意の変換関数で出力値を作るフォーム。
 *
 * outputSchema による定型的な射影・変換では表しにくい処理、
 * 複数の入力値を組み合わせた独自の出力モデル作成などに使用する。
 *
 * transform の戻り値が、そのまま submit 成功時の TOutput となる。
 *
 * 注意:
 * useRequestForm と異なり、transform の戻り値を Zod schema で再検証しない。
 * TOutput の妥当性を保証したい場合は useRequestForm を優先する。
 * 任意変換が必要な場合も、transform 内で明示的に検証する。
 */
export function useTransformForm<
  TInput extends FieldValues,
  TParsedInput extends FieldValues,
  TOutput extends FieldValues,
>(config: {
  /**
   * RHF が保持する Page ViewModel を受け取るスキーマ。
   *
   * inputSchema が transform を持つ場合、
   * そのパース後の値は TParsedInput となる。
   */
  inputSchema: z.ZodType<TParsedInput, TInput>

  /**
   * 正規化済みの入力値から任意の出力値を作る関数。
   *
   * 引数には、inputSchema のパース後、
   * かつ空文字を undefined に正規化した値が渡される。
   */
  transform: (input: TParsedInput) => TOutput

  /**
   * RHF が保持する Page ViewModel の初期値。
   *
   * defaultValues が変更された場合、
   * フォームは自動的に reset される。
   */
  defaultValues?: DefaultValues<TInput>
}) {
  const formSchema = config.inputSchema.transform((input) =>
    config.transform(normalizeEmptyStrings(input)),
  )

  const form = useForm<TInput, unknown, TOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: config.defaultValues,
  })

  useEffect(() => {
    if (config.defaultValues) {
      form.reset(config.defaultValues)
    }
  }, [config.defaultValues, form])

  return form
}

/**
 * 空文字 ("") を再帰的に undefined へ変換する。
 *
 * HTML の text input は未入力値を空文字として扱うことが多い。
 * 一方、更新 API Request やドメイン入力では、値なしを undefined として
 * 表現する場合があるため、その境界で使用する。
 *
 * 配列と plain object を再帰的に処理する。
 * Date は値として保持するため変換対象外とする。
 *
 * 注意:
 * 型上は T を返すが、実行時には string が undefined へ置換され得る。
 * そのため、この関数の戻り値は outputSchema などで直後に検証・確定する
 * useRequestForm の変換境界で使用することを基本とする。
 */
function normalizeEmptyStrings<T>(value: T): T {
  if (value === '') {
    return undefined as T
  }

  if (Array.isArray(value)) {
    return value.map(normalizeEmptyStrings) as T
  }

  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        normalizeEmptyStrings(item),
      ]),
    ) as T
  }

  return value
}
