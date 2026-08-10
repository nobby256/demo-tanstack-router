import { zodResolver } from '@hookform/resolvers/zod'
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
 * これは RHF の ViewModel 型であり、画面入力に適した値を表す。
 * 例:
 * - 数値入力でも `string` として保持する
 * - 未入力を `undefined` ではなく `""` として保持する
 * - 入力途中・形式不正の値も保持できる
 *
 * `watch`, `getValues`, `setValue`, `reset`, `register` などで扱う値の型。
 */
export type FormInput<TForm> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TForm extends UseFormReturn<infer TInput, any, any> ? TInput : never

/**
 * フォーム送信時に得られる、変換・検証済みの値の型を取り出す。
 *
 * `handleSubmit` の成功コールバックで受け取る値の型。
 * API リクエスト、ユースケース入力、検索条件などへ渡す値を想定する。
 *
 * 例:
 * - `""` は `undefined` へ正規化済み
 * - `"123"` は `123` へ数値変換済み
 * - 必須・形式・項目間整合性などの検証を通過済み
 */
export type FormOutput<TForm> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TForm extends UseFormReturn<any, any, infer TOutput> ? TOutput : never

/**
 * 単一スキーマで扱うフォーム。
 *
 * 通信・API リクエストへの変換を主目的とせず、
 * 画面内で値を入力・編集・参照するフォームに使用する。
 *
 * `schema` は、RHF が保持する `TInput` を受け取り、
 * submit 時に利用する `TOutput` を返す。
 *
 * スキーマ内に transform / coerce がなければ、通常は `TInput` と
 * `TOutput` は同じ型になる。
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
   * RHF の初期値。
   *
   * `defaultValues` は画面が保持する値なので、`TOutput` ではなく
   * 常に `TInput` で指定する。
   */
  defaultValues?: DefaultValues<TInput>
}) {
  /**
   * スキーマによる検証・変換が成功した後に、
   * 空文字を undefined へ正規化する。
   *
   * 単一スキーマ形式では、正規化後に別スキーマで再検証は行わない。
   */
  const formSchema = config.schema.transform((input) =>
    normalizeEmptyStrings(input),
  )

  return useForm<TInput, unknown, TOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: config.defaultValues,
  })
}

/**
 * 画面用 ViewModel をリクエスト・ドメイン用の値へ変換するフォーム。
 *
 * もっとも典型的には、API リクエストを作るフォームで使用する。
 *
 * フォームは入力途中の値を保持する必要があるため、`TInput` では
 * 数値・日付なども string として扱うことがある。
 * 一方、`TOutput` は空文字の正規化、coerce、必須チェックなどを完了した、
 * API やユースケースへ渡せる確定値である。
 *
 * 処理順:
 *
 * `TInput`
 *   → `inputSchema`
 *   → `normalizeEmptyStrings`
 *   → `outputSchema`
 *   → `TOutput`
 *
 * 原則として、業務上の必須チェック、形式チェック、数値化、
 * API リクエスト形式への変換は `outputSchema` に置く。
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
   * RHF が保持する画面入力を受け取るスキーマ。
   *
   * 通常は ViewModel の構造を表すことが主目的であり、
   * `coerce` や業務上の厳密な入力チェックは outputSchema 側に置く。
   *
   * inputSchema 自身に transform 等を定義した場合、
   * その変換後の型が TParsedInput となる。
   */
  inputSchema: z.ZodType<TParsedInput, TInput>

  /**
   * 正規化済みの値を、送信・処理可能な確定値へ変換・検証するスキーマ。
   *
   * ここに必須チェック、文字数、形式、項目間整合性、coerce、
   * API リクエスト形式への変換などを定義する。
   *
   * 検証失敗時に parse() が throw する ZodError は、
   * zodResolver により RHF の formState.errors へ変換される。
   */
  outputSchema: z.ZodType<TOutput>

  /**
   * RHF が保持する ViewModel の初期値。
   *
   * 例: optional な数値入力でも、画面上の初期値は `undefined` ではなく
   * `""` を指定することがある。
   */
  defaultValues: DefaultValues<TInput>
}) {
  const formSchema = config.inputSchema.transform((input) =>
    config.outputSchema.parse(normalizeEmptyStrings(input)),
  )

  return useForm<TInput, unknown, TOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: config.defaultValues,
  })
}

/**
 * 任意の変換関数を使用するフォーム。
 *
 * outputSchema だけでは表しにくい変換や、複数の値を組み合わせた
 * 独自の出力モデル作成が必要な場合に使用する。
 *
 * `transform` の戻り値が、そのまま submit 時の `TOutput` になる。
 *
 * 注意: useRequestForm と異なり、transform 後の TOutput を
 * Zod スキーマで再検証するわけではない。
 * 変換後の値の妥当性も保証したい場合は useRequestForm を使うか、
 * transform 関数内で明示的に検証する。
 */
export function useTransformForm<
  TInput extends FieldValues,
  TParsedInput extends FieldValues,
  TOutput extends FieldValues,
>(config: {
  /**
   * RHF の ViewModel を受け取るスキーマ。
   *
   * transform を持つ場合、パース後の値は TParsedInput になる。
   */
  inputSchema: z.ZodType<TParsedInput, TInput>

  /**
   * 正規化済みの入力値から任意の出力値を作る関数。
   *
   * 引数には inputSchema のパース後、
   * かつ空文字を undefined に正規化した値が渡される。
   */
  transform: (input: TParsedInput) => TOutput

  /**
   * RHF が保持する ViewModel の初期値。
   */
  defaultValues: DefaultValues<TInput>
}) {
  const formSchema = config.inputSchema.transform((input) =>
    config.transform(normalizeEmptyStrings(input)),
  )

  return useForm<TInput, unknown, TOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: config.defaultValues,
  })
}

/**
 * 空文字 ("") を再帰的に undefined へ変換する。
 *
 * HTML input は未入力値を空文字として返すことが多いが、
 * API やドメインモデルでは「値なし」を undefined として扱いたい場合がある。
 *
 * Date はそのまま保持する。
 *
 * 注意:
 * 型上は T を返すが、実行時には string が undefined へ置換され得る。
 * この関数の戻り値は、直後に outputSchema などで検証・確定させる前提で使う。
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
