# validationForm

## 背景と方針

React Hook Form（RHF）で業務系 SPA のフォームを実装している。  
フォームの状態管理には RHF を使うが、`zodResolver` は原則として使用せず、**RHF の FormValues と Zod schema の input/output 型を意図的に分離する**方針を採用している。

RHF は、画面上でユーザーが編集中の UI 状態を管理する責務を持つ。一方、Zod schema は API 契約に基づく入力検証・正規化・変換を担い、成功時の output を Mutation API の送信データとして利用する。

```txt
RHF FormValues
  └─ UI編集状態。入力途中・空欄・動的配列を含む
       ↓ submit時
normalizeEmptyStrings()
       ↓
Zod / Orval generated schema
  └─ API契約に基づく検証・型変換
       ↓ safeParse 成功時
z.output<typeof schema>
  └─ Mutation API に送信するデータ
```

この方針では、RHF が扱う型と Zod の input/output 型は、同一である必要がない。

## 分離する理由

RHF が管理する値は、API に送れる完成済みの値ではなく、ユーザーが入力中の中間状態を含む。

たとえば数値項目では、画面上では次のような値が存在する。

```ts
type FormValues = {
  quantity: string
}
```

```ts
''
'12'
'12.'
'-'
'abc'
'   '
```

しかし API の MutationModel では、通常は数値型が求められる。

```ts
type UpdateRequest = {
  quantity: number
}
```

Zod の `z.coerce.number()` を使うと、schema input は一般に `unknown`、schema output は `number` になる。

```ts
const schema = z.object({
  quantity: z.coerce.number(),
})

type Input = z.input<typeof schema>
// { quantity: unknown }

type Output = z.output<typeof schema>
// { quantity: number }
```

この Zod の型は runtime validation としては正しい。しかし、RHF の `Controller`、`watch`、`setValue`、`useFieldArray`、`defaultValues` が扱う UI 型としては `unknown` が不便である。

また、以下のような Zod の機能は input と output の型を変化させる。

- `z.coerce.*()`
- `z.preprocess()`
- `z.transform()`
- `z.default()`
- `.optional()`
- `.nullable()`
- API 由来 schema の union や complex object

特に `z.default('')` は input 側では optional になり得る一方、output 側では string が確定する。このような schema の IN/OUT 差を RHF の `useForm` generic に持ち込むと、フォーム状態・default values・FieldArray 操作・送信値の責務が混ざり、型エラーや実装上の摩擦が増える。

そのため、RHF の型は画面の編集状態として自然な型に固定し、Zod の型変換は submit 境界へ閉じ込める。

## Orvalとの関係

Zod schema は Orval により OpenAPI / API 契約から生成されることがある。生成 schema は基本的に API operation、request body、parameter、response を表現するものであり、必ずしも画面の編集状態に最適化された schema ではない。

フォーム UI には API 契約に存在しない都合がある。

- React controlled input の空値 `''`
- 数値・日付・選択項目の入力途中の文字列
- placeholder 選択状態
- 動的行追加直後の未完成行
- 画面固有の確認チェックや補助入力
- 表示専用の値、selector / master data
- 一時的な UI state
- FieldArray の追加・削除・並び替えに必要な UI 行型

Orval 生成 schema を `zodResolver` 経由で RHF に直接接続すると、API 契約の型が UI 状態へ流入する。結果として、`coerce` により field value が `unknown` になる、`default()` と `optional()` の IN/OUT 差が RHF generic に影響する、`useFieldArray` の `append()` や path 型が扱いづらくなる、といった問題が起こりやすい。

そこで Orval 生成 Zod schema は、**RHF のフォーム定義そのものではなく、submit 時の API 入力 validator / converter として扱う**。

```txt
RHF FormValues
  └─ 画面向けの UI 型
       ↓
normalizeEmptyStrings()
       ↓
Orval generated Zod schema
  └─ API契約の検証・変換
       ↓
Zod output
  └─ API request payload
```

これにより、API schema を UI 都合で手修正したり、Orval の生成方針に UI 実装が過度に支配されたりすることを避けられる。

## 空文字の正規化

RHF の controlled input では、未入力値を `''` として扱うことが多い。しかし API 契約や Zod schema では、「値がない」は `undefined` として表現したい。

そこで submit 時、RHF の値を取得した後、`normalizeEmptyStrings()` を適用する。

```ts
const normalizedValues = normalizeEmptyStrings(form.getValues())
```

この処理では、空文字および空白文字だけからなる文字列を `undefined` に変換する。

```txt
''       → undefined
'   '    → undefined
'\t\n'   → undefined
'　'     → undefined
' 山田 ' → ' 山田 '  // 内容のある文字列は加工しない
```

この変換は画面 state を変更しない。RHF 上では `''` のまま controlled input を維持し、**検証・送信直前の境界でだけ**値なしへ正規化する。

## 必須エラーの扱い

Zod schema において、non-optional な `z.string()`、`z.number()` 等へ `undefined` が渡ると、通常は `invalid_type` issue になる。

```ts
const schema = z.object({
  name: z.string(),
})
```

```ts
schema.safeParse({
  name: undefined,
})
```

この `invalid_type` は、今回の設計では「型が違う」だけでなく、空文字正規化後の `undefined` に起因する場合は「必須未入力」を意味する。

そのため、`safeParse` は `reportInput: true` を指定して実行し、issue の input を確認する。

```ts
const result = schema.safeParse(normalizedValues, {
  reportInput: true,
})
```

以下の条件を満たす issue は、RHF 用には `required` エラーへ再分類する。

```ts
issue.code === 'invalid_type' &&
'input' in issue &&
issue.input === undefined
```

```ts
function isRequiredIssue(
  issue: {
    code: string
    input?: unknown
  },
): boolean {
  return (
    issue.code === 'invalid_type' &&
    'input' in issue &&
    issue.input === undefined
  )
}
```

```ts
function toFieldErrorType(
  issue: z.core.$ZodIssue,
): string {
  return isRequiredIssue(issue)
    ? 'required'
    : issue.code
}
```

これにより、Zod の issue code は `invalid_type` のままでも、RHF の `FieldError.type` では次のように扱える。

```ts
{
  type: 'required',
  message: '入力は必須です。',
}
```

この方式により、Zod schema を個別に書き換えずに、non-optional な schema を必須項目として扱える。`.optional()` の schema は `undefined` を許容するため、空欄は成功する。

```ts
const schema = z.object({
  requiredName: z.string(),
  optionalMemo: z.string().optional(),
})
```

```txt
requiredName: '' → undefined → required エラー
optionalMemo: '' → undefined → 検証成功
```

Zod のグローバル設定では、`invalid_type + input === undefined` の場合に「入力は必須です。」というメッセージを生成する。

```ts
z.config({
  customError: (issue) => {
    if (isRequiredIssue(issue)) {
      return '入力は必須です。'
    }

    return undefined
  },
})
```

一方で、RHF の `FieldError.type` を `required` に変換するのは `createFieldErrors()` の責務とする。

## エラー変換

Zod の error issue は、そのまま UI に公開しない。Zod issue path と issue code を、RHF とアプリケーション UI が扱いやすい形へ変換する。

```txt
Zod issue
  ↓
createFieldErrors()
  ↓
RHF FieldError
```

変換ルールは以下の通り。

- `issue.path` は `items.0.quantity` のような RHF field path へ変換する
- path が空の cross-field / form-level issue は `root.validation` へ格納する
- `invalid_type + input === undefined` は `type: 'required'` に変換する
- それ以外は Zod の issue code、または将来的にはアプリケーション独自の error type を使う
- `criteriaMode: 'all'` の場合は、同じ field の複数 issue を `FieldError.types` に蓄積する
- root error はフォーカス対象にしない

```ts
const path =
  issue.path.length === 0
    ? 'root.validation'
    : issue.path.map(String).join('.')
```

```ts
form.setError(path, {
  type: 'required',
  message: '入力は必須です。',
})
```

この翻訳層により、画面コンポーネントは Zod の `invalid_type`、`too_small`、`custom` 等の詳細に直接依存しなくてよい。

## 検証タイミング

現時点では、クライアント検証は **submit 時限定** とする。

```txt
保存ボタン押下
  ↓
form.getValues()
  ↓
normalizeEmptyStrings()
  ↓
schema.safeParse()
  ↓
createFieldErrors()
  ↓
form.setError()
  ↓
先頭の入力可能なエラー項目へ setFocus()
```

submit 時限定にする理由は、業務系システムでは保存・登録・確定時にまとめて検証する UX が許容されるケースが多く、実装・テスト・エラー状態管理を単純にできるためである。

また、`zodResolver` を使わないため、RHF の `mode`、`reValidateMode`、`trigger()`、`formState.isValid` は Zod 検証の真実としては使用しない。検証の真実は `validateForm()` の `safeParse` 結果である。

将来的に blur / change 時検証が必要になった場合は、resolver を導入するのではなく、同じ処理を使う `validateField()`、`validateFields()`、`validateAll()` のような validation orchestrator を追加する。まずは submit 専用の `validateForm()` に限定し、必要性が確認された画面だけに段階的に拡張する。

## 現在の基本実装

```ts
export function validateForm<
  TFormValues extends FieldValues,
  TSchema extends z.ZodTypeAny,
>(
  form: UseFormReturn<TFormValues>,
  schema: TSchema,
  options: ValidateFormOptions = {},
) {
  form.clearErrors()

  const values = form.getValues()
  const normalizedValues = normalizeEmptyStrings(values)

  const result = schema.safeParse(normalizedValues, {
    reportInput: true,
  })

  if (!result.success) {
    const errors = createFieldErrors(
      result.error,
      options.criteriaMode,
    )

    for (const [path, error] of Object.entries(errors)) {
      form.setError(path as Path<TFormValues>, error)
    }

    if (options.shouldFocusError) {
      const firstFieldPath = Object.keys(errors).find(
        (path) => !path.startsWith('root.'),
      )

      if (firstFieldPath) {
        form.setFocus(
          firstFieldPath as Path<TFormValues>,
        )
      }
    }
  }

  return result
}
```

呼び出し側は、Zod output のみを API へ渡す。

```ts
const result = validateForm(
  form,
  updateCustomerSchema,
  {
    criteriaMode: 'all',
    shouldFocusError: true,
  },
)

if (!result.success) {
  return
}

await updateCustomer(result.data)
```

## 相談したい論点

このアーキテクチャについて相談する場合、特に以下を検討したい。

- RHF の UI FormValues と API MutationModel をどこまで分離するべきか
- Orval 生成 Zod schema を submit-time validator として使う場合の型設計
- `normalizeEmptyStrings()` の対象範囲、空白文字・null・optional の意味論
- `invalid_type + input === undefined → required` という必須判定の妥当性
- Zod issue を RHF error へ変換する際の path、root error、`criteriaMode` の扱い
- submit 時限定 validation におけるエラー clear の範囲と、サーバーエラーとの共存
- 将来的に blur / change validation を追加する場合の最小限の拡張方法
- `useFieldArray`、cross-field validation、server validation error path を含む場合の設計