import { z } from 'zod'

export type PageFormInput<T extends { schema: z.ZodTypeAny }> = z.input<
  T['schema']
>

export type PageFormOutput<T extends { schema: z.ZodTypeAny }> = z.output<
  T['schema']
>

type DefinePageFormSchemaConfig<
  TInputSchema extends z.ZodTypeAny,
  TOutputSchema extends z.ZodTypeAny,
> =
  | {
      /**
       * フォームが保持する入力値のスキーマ
       */
      inputSchema: TInputSchema

      /**
       * submit時に適用する変換後スキーマ
       */
      outputSchema: TOutputSchema
    }
  | {
      /**
       * フォームが保持する入力値のスキーマ
       */
      inputSchema: TInputSchema

      /**
       * submit時に実行するカスタム変換
       */
      transform: (input: z.output<TInputSchema>) => z.output<TOutputSchema>
    }
  | {
      /**
       * フォームが保持する入力値のスキーマ
       */
      inputSchema: TInputSchema
    }

/**
 * フォーム入力用スキーマを定義する。
 *
 * inputSchema
 *   フォームが保持する値のスキーマ。
 *
 * outputSchema
 *   submit時に適用する変換後スキーマ。
 *   空文字("")を undefined に正規化した後、
 *   outputSchema.parse() を実行する。
 *
 * transform
 *   submit時に実行するカスタム変換関数。
 *   空文字("")を undefined に正規化した後、
 *   transform() を実行する。
 *
 * outputSchema と transform の両方を指定しない場合は、
 * 空文字("")の正規化のみ実施してそのまま返す。
 */
export function definePageFormSchema<
  TInputSchema extends z.ZodTypeAny,
  TOutputSchema extends z.ZodTypeAny = TInputSchema,
>(config: DefinePageFormSchemaConfig<TInputSchema, TOutputSchema>) {
  const schema = config.inputSchema.transform((input) => {
    const normalized = normalizeEmptyStrings(input)

    if ('transform' in config) {
      return config.transform(normalized)
    }

    if ('outputSchema' in config) {
      return config.outputSchema.parse(normalized)
    }

    return normalized
  })

  return {
    schema,
  } as const
}

/**
 * フォームから送信されたデータ内の空文字("")を
 * 再帰的に undefined へ変換する。
 *
 * 変換例:
 *
 * {
 *   name: '',
 *   amount: '',
 *   memo: 'test',
 * }
 *
 * ↓
 *
 * {
 *   name: undefined,
 *   amount: undefined,
 *   memo: 'test',
 * }
 *
 * 配列およびネストしたオブジェクトも再帰的に処理する。
 * Date オブジェクトは変換しない。
 */
function normalizeEmptyStrings<T>(value: T): T {
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

  // 上記以外はそのまま返す
  return value
}
