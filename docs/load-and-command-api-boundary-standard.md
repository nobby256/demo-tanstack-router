# load API と非 load API の境界設計標準

## 1. この文書の目的

本書は、BFF、TanStack Router の loader、React Hook Form（RHF）、TypeSpec / OpenAPI / Orval を使用する業務システムにおいて、**load API** と **非 load API** の通信モデルを意図的に分けるための標準である。

この標準で解決する対象は、次のような問題である。

- text input の空値を `undefined` のまま扱うと、controlled component の値管理が不安定になる
- API DTO をそのまま RHF に入れると、optional property、number、date、null などを各入力コンポーネントや JSX で個別に吸収する必要がある
- 複雑な業務画面では、表示用データ、入力データ、ネスト、配列、繰り返し行、楽観ロック用 version が混在する
- UI が扱いやすい値と、更新 API が要求する値は一致しない
- TypeSpec → OpenAPI → Orval の生成結果を正としたいので、クライアント側で画面ごとの補完・変換処理を増やしたくない

本標準は、通信を次の二種類に分類する。

1. **load API**: ページを描画・編集可能な状態へ初期化する通信
2. **非 load API**: 更新、登録、削除、操作実行、検索、選択肢取得など、load API 以外の通信

> load API のレスポンスだけを Page ViewModel として特別扱いする。
>
> それ以外の request / response は、原則として API 契約・ドメイン上の自然な型を使用する。

---

## 2. 前提

### 2.1 BFF

BFF は画面に必要なデータを集約し、画面に適した API を提供する。load API は、内部サービスやドメイン DTO をそのまま返す API ではなく、ページの初期化に必要な **Page ViewModel** を返す。

### 2.2 TanStack Router

ページ初期データは TanStack Router の loader で取得する。

```ts
export const Route = createFileRoute('/error-handling/$id')({
  loader: ({ params }) =>
    errorHandlingPageLoad({
      id: params.id,
    }),
})
```

ページコンポーネントは `Route.useLoaderData()` で load response を取得し、その値で RHF を初期化する。

TanStack Query は使用しない。データ再取得と画面遷移時の loader 実行は TanStack Router のルールに従う。

### 2.3 TypeSpec / OpenAPI / Orval

API 契約は TypeSpec で定義し、OpenAPI を経由して Orval から API client、TypeScript 型、Zod schema を生成する。

生成済み Zod schema に、画面ごとの `.prefault('')`、`.default('')`、手書きの値補完を追加する運用は行わない。UI に必要な完全な初期値は load API の契約で返す。

---

## 3. 全体像

```text
                         ┌──────────────────────┐
                         │   load API request    │
                         │   API 契約の自然な型   │
                         │   optional は省略可能  │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │  load API response   │
                         │  完全な Page ViewModel │
                         │  UI 向け空値を含む     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │          RHF         │
                         │  ページ編集状態の基準 │
                         │  string / boolean /   │
                         │  array 等を保持       │
                         └──────────┬───────────┘
                                    │
                      useRequestForm│
                                    ▼
                         ┌──────────────────────┐
                         │ output schema         │
                         │ "" → undefined        │
                         │ string → number/date  │
                         │ 表示値を除外           │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ 非 load API request   │
                         │ 更新 Command / DTO     │
                         │ API 契約の自然な型     │
                         └──────────────────────┘
```

---

## 4. load と非 load の比較

### 4.1 通信全体の比較

| 観点               | load API                                      | 非 load API                                             |
| ------------------ | --------------------------------------------- | ------------------------------------------------------- |
| 主な目的           | ページを描画・編集できる状態へ初期化する      | 更新、登録、削除、操作実行、検索、選択肢取得などを行う  |
| API の性格         | page-scoped な BFF API                        | Command、Query、汎用 API、業務操作 API                  |
| HTTP メソッド      | POST                                          | POST                                                    |
| request の設計     | API 契約として自然な型を使う                  | API 契約として自然な型を使う                            |
| response の設計    | **Page ViewModel として特別扱いする**         | API の目的に応じた自然な response 型                    |
| optional property  | request では使用してよい                      | request / response ともに意味に応じて使用してよい       |
| text の空値        | response では `""` を返す                     | API 契約に従い省略、`null`、`""` 等を選択する           |
| number / date      | response では text input 用なら string で返す | API 契約上の `number` / date 表現を使う                 |
| フロントでの使い道 | RHF の `defaultValues`、`reset()`、ページ表示 | API 呼び出し結果、メッセージ、遷移判断、必要時の再 load |

### 4.2 request の比較

load request は UI の入力値を直接表すものではなく、「どのページ状態を取得するか」を表す。したがって、load request に `""` ルールを適用しない。

| 観点           | load request                                                   | 更新・操作 request                                                   |
| -------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- |
| 役割           | 取得対象・取得条件の指定                                       | 実行したい業務操作の指定                                             |
| 値の型         | `string`、`number`、`boolean`、enum、配列など自然な型          | `string`、`number`、`boolean`、enum、配列など自然な型                |
| optional       | 条件未指定なら `undefined` / プロパティ省略                    | 任意項目なら `undefined` / プロパティ省略。意味は API 契約で定義する |
| 空の text 条件 | 通常は `undefined` / 省略。空文字検索に意味がある場合だけ `""` | 空文字に業務上の意味がある場合だけ `""`                              |
| number         | `number`                                                       | `number`                                                             |
| checkbox 相当  | `boolean`                                                      | `boolean`                                                            |
| RHF 用の補正   | 不要                                                           | 不要                                                                 |

例:

```ts
type ErrorHandlingPageLoadRequest = {
  id: string
  includeHistory?: boolean
  historyPage?: number
  historyPageSize?: number
  historyFrom?: string
}
```

```ts
await errorHandlingPageLoad({
  id: 'error-handling-001',
  includeHistory: true,
  historyPage: 1,
  historyPageSize: 50,
  historyFrom: undefined,
})
```

JSON では object property の `undefined` は送信されないため、`historyFrom` は request body から省略される。

```json
{
  "id": "error-handling-001",
  "includeHistory": true,
  "historyPage": 1,
  "historyPageSize": 50
}
```

### 4.3 response の比較

load response は唯一の例外として、RHF と JSX がそのまま使用できる完全な Page ViewModel を返す。

| 観点              | load response                                 | 非 load response                               |
| ----------------- | --------------------------------------------- | ---------------------------------------------- |
| 役割              | ページ全体の描画・編集状態を提供する          | 操作結果、検索結果、選択肢、処理状態などを返す |
| 形                | ページ専用の完全な ViewModel                  | API の目的に応じた DTO / Result                |
| text 項目         | 原則 `string`。値なしは `""`                  | API 契約上の意味に従う                         |
| optional property | 原則使用しない                                | 必要なら使用する                               |
| 表示用の値        | `xxxText` / `xxxLabel` のように明示して含める | 必要な場合だけ返す                             |
| 入力用の数値      | 原則 `string`                                 | 原則 `number`                                  |
| 入力用の日付      | 原則 UI が扱う string                         | API 契約に従う                                 |
| checkbox          | `boolean`                                     | `boolean`                                      |
| 配列              | 常に `[]` を返す                              | API 契約に従う                                 |
| RHF への投入      | そのまま `defaultValues` / `reset` に使う     | 原則として直接投入しない                       |

---

## 5. load request は普通の API 引数である

load API が特別なのは **response** であって、request ではない。

```typespec
model ErrorHandlingPageLoadRequest {
  id: string;
  includeHistory?: boolean;
  historyPage?: int32;
  historyPageSize?: int32;
  historyFrom?: string;
}
```

この request は、次のような通常の API 契約として扱う。

- `id` は必須の識別子
- `historyPage` は number
- `includeHistory` は boolean
- 指定しない取得条件は optional property とする
- 条件未指定は `undefined` とし、JSON ではプロパティを省略する

load request の optional な text 条件を、RHF 都合で `""` に統一してはならない。

```ts
// 推奨
{
  historyFrom: undefined,
}

// 原則避ける: 空文字検索に意味がない限り不要
{
  historyFrom: '',
}
```

理由は、load request はフォーム表示用 ViewModel ではなく、BFF に対する取得条件だからである。

---

## 6. load response は完全な Page ViewModel である

### 6.1 基本ルール

load response は、画面を安全に描画し、RHF をそのまま初期化できることを契約とする。

```typespec
model ErrorHandlingPageLoadResponse {
  pageTitle: string;
  statusLabel: string;
  updatedAtText: string;
  updatedByName: string;

  name: string;
  description: string;
  retryCount: string;
  startDate: string;

  enabled: boolean;
  targetIds: string[];

  version: string;
}
```

この response には `?` を使用しない。

```ts
// 推奨: 画面は常に同じ形を受け取る
{
  pageTitle: 'エラー処理設定',
  statusLabel: '有効',
  updatedAtText: '2026/08/11 08:00',
  updatedByName: '山田 太郎',
  name: '通知設定',
  description: '',
  retryCount: '',
  startDate: '',
  enabled: true,
  targetIds: [],
  version: '42',
}
```

### 6.2 `""` の意味

load response の `""` は、API のドメイン値としての空文字を主張するものではない。Page ViewModel における **text UI の空状態** である。

```txt
DB / Domain の null、未設定、値なし
  ↓ BFF が画面向けに変換
Page ViewModel の ""
  ↓ RHF が保持
<input value="" />
```

この変換により、クライアントで次のような個別補正を不要にする。

```tsx
// 原則不要にする
<input value={field.value ?? ''} />
```

### 6.3 string にする対象

原則として次を string とする。

- text input
- textarea
- 数値 input の編集中の値
- 日付 input の UI 用文字列表現
- select の string value
- 表示用に整形済みの text

```ts
type PageViewModel = {
  name: string
  quantity: string
  startDate: string
  description: string

  totalAmountText: string
  createdAtText: string
}
```

ただし、無理に全値を string にしない。UI の自然な状態表現を優先する。

```ts
type PageViewModel = {
  enabled: boolean
  selectedCategoryIds: string[]
  rows: Array<{
    id: string
    name: string
    quantity: string
    selected: boolean
  }>
}
```

---

## 7. RHF は Page ViewModel の Store である

複雑な業務画面では、表示項目と入力項目の参照元を分離しない。load response 全体を RHF に格納し、ページ上の値は原則として RHF から参照する。

```ts
const loaderData = Route.useLoaderData()

const form = useRequestForm({
  inputSchema: schema.ErrorHandlingPageLoadResponse,
  outputSchema: schema.ErrorHandlingPageUpdateRequest,
  defaultValues: loaderData,
})
```

この方針の狙いは、次の一貫性にある。

- 表示値、入力値、ネストした値、繰り返し行の参照元を一つにする
- 表示専用項目が将来編集可能になっても、状態の移動を不要にする
- 行追加、行削除、入力連動表示を RHF の状態で統一する
- 子コンポーネントへ渡す基盤を `UsePageFormReturn` に統一する

### 7.1 表示の購読

表示値が変更に追従する必要がある箇所では `useWatch` を使用する。

```tsx
function RetryCountPreview({ control }: { control: Control<PageFormInput> }) {
  const retryCount = useWatch({ control, name: 'retryCount' })
  return <span>{retryCount === '' ? '未設定' : `${retryCount} 回`}</span>
}
```

ページ最上位で `watch()` を多用して、すべての変更でページ全体を再描画することは避ける。購読は必要なコンポーネントへ局所化する。

---

## 8. update request は Page ViewModel から射影する

更新 API の request は、Page ViewModel の部分集合を基本とする。

```typespec
model ErrorHandlingPageUpdateRequest {
  name: string;
  description?: string;
  retryCount?: int32;
  startDate?: string;
  enabled: boolean;
  targetIds: string[];
  version: string;
}
```

load response に含まれる表示専用項目は update request に含めない。

```text
Page ViewModel
  ├─ pageTitle          ─┐
  ├─ statusLabel         │ update request には含めない
  ├─ updatedAtText       │
  ├─ updatedByName      ─┘
  ├─ name                ─┐
  ├─ description          │
  ├─ retryCount           │ output schema が抽出・変換
  ├─ enabled              │
  ├─ targetIds            │
  └─ version             ─┘
```

ただし、更新 request は機械的な部分集合でなければならないわけではない。操作の意図や送信時に生成される値は追加してよい。

```ts
type ApproveRequest = {
  version: string
  comment?: string
  approved: true
}
```

原則は次のとおりとする。

> 更新 request は、Page ViewModel の部分集合、または操作・送信時に初めて意味を持つ値で構成する。

---

## 9. `useRequestForm` による変換境界

`useRequestForm` は、Page ViewModel を API request へ変換する共通境界である。

```ts
export function useRequestForm<
  TInput extends FieldValues,
  TParsedInput extends FieldValues,
  TOutput extends FieldValues,
>(config: {
  inputSchema: z.ZodType<TParsedInput, TInput>
  outputSchema: z.ZodType<TOutput>
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
```

### 9.1 処理順

```text
Page ViewModel / TInput
  ↓ inputSchema
TParsedInput
  ↓ normalizeEmptyStrings
正規化済み入力
  ↓ outputSchema
Update Request / TOutput
```

### 9.2 inputSchema の責務

inputSchema は RHF が保持する Page ViewModel の構造を表す。

- UI が保持する object、array、string、boolean の形を表す
- 原則として業務必須チェックを置かない
- 原則として `z.coerce.*()` を置かない
- 数値 input は `string` のまま扱う

### 9.3 outputSchema の責務

outputSchema は更新 API の request 契約を表す。

- `"" → undefined` 後の optional 判定
- `z.coerce.number()` 等による変換
- 必須、形式、範囲、項目間整合性の検証
- 表示専用項目の除外
- 更新 Command への射影

```ts
const updateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  retryCount: z.coerce.number().int().min(0).optional(),
  startDate: z.string().date().optional(),
  enabled: z.boolean(),
  targetIds: z.array(z.string()),
  version: z.string(),
})
```

コンポーネント内で request を手作業で組み立てない。

```ts
// 推奨
form.handleSubmit(async (request) => {
  await errorHandlingPageUpdate(request)
})
```

```ts
// 避ける
form.handleSubmit(async (values) => {
  await errorHandlingPageUpdate({
    name: values.name,
    retryCount: Number(values.retryCount),
  })
})
```

---

## 10. `""` は更新通信へ出さない

`""` は Page ViewModel と RHF 内でのみ使用する UI 表現である。更新 request へそのまま送信しない。

```text
load response / RHF
  description: ""
  retryCount: ""

normalizeEmptyStrings
  description: undefined
  retryCount: undefined

update request object
  description: undefined
  retryCount: undefined

JSON body
  description, retryCount は省略される
```

```ts
JSON.stringify({
  name: '通知設定',
  description: undefined,
  retryCount: undefined,
  enabled: true,
  version: '42',
})

// {"name":"通知設定","enabled":true,"version":"42"}
```

このルールにより、load response で UI 安定性のために `""` を使っても、更新通信で不要な空文字データを送らない。

### 10.1 省略の意味を API 契約で決める

すべての API は POST を使用する。本標準では、プロパティ省略を PATCH 固有の「変更しない」とは自動解釈しない。

POST の更新 command における optional property の意味は、API ごとに明示する。

```text
省略 / undefined
  = 値なしとして更新する
  = サーバー側既定値を使う
  = 操作に不要な引数である
  = 変更しない
```

どの意味かは API 契約として一意に定める。

特に、既存値の明示的なクリアと「値を送らない」を区別する必要がある場合は、`null`、操作種別、明示的な boolean、または専用 Command を使用する。

```ts
type ClearDescriptionRequest = {
  version: string
  clearDescription: true
}
```

---

## 11. 非 load response の扱い

非 load response を Page ViewModel として扱ってはならない。非 load response は、その操作の結果として自然な型を返す。

| API 種別   | response の例                                                     | RHF への扱い                                              |
| ---------- | ----------------------------------------------------------------- | --------------------------------------------------------- |
| 更新       | `{ updatedAt: string, version: string }`、または operation result | 原則、直接 `reset` しない。必要なら load API を再実行する |
| 登録       | `{ id: string }`、または作成結果                                  | 遷移、通知、次の load の判断に使う                        |
| 削除       | `void`、削除結果                                                  | 遷移、通知に使う                                          |
| 操作実行   | `{ accepted: boolean }`、処理結果                                 | 通知、表示制御、必要時の再 load に使う                    |
| 検索       | 検索結果 DTO                                                      | 一時表示、候補表示、必要に応じた RHF 値への反映           |
| 選択肢取得 | option DTO 配列                                                   | select / autocomplete の候補に使う                        |

更新 API が page state の再初期化に十分な情報を返す場合でも、戻り値を暗黙に Page ViewModel とみなして `reset()` してはならない。

ページを再初期化する response として使うなら、次のいずれかにする。

1. 更新後に load API を再実行する
2. 更新 API が明示的に完全な Page ViewModel を返す契約にする

後者を採る場合は、その response を load-equivalent response として明示し、optional / `""` / array の完全性ルールを load response と同様に満たす。

---

## 12. loader と reset のルール

RHF の `defaultValues` は初期化後に自動追従しない。loader data をフォームへ再反映する場合は `form.reset()` が必要である。

```ts
useEffect(() => {
  form.reset(loaderData)
}, [form, loaderData])
```

ただし、上記を無条件に採用してはならない。loader が再実行されたとき、dirty なフォームを reset すると編集中の値が失われる。

### 12.1 reset を許可する契機

- 初回初期化
- 対象レコード ID が変わる遷移
- 保存成功後に最新の Page ViewModel を反映する場合
- ユーザーが編集取消を選択した場合
- ユーザーが明示的に再読込を選択した場合

### 12.2 dirty な場合の方針

dirty なフォームへ外部データを反映する必要がある場合は、画面ごとに次のいずれかを明示する。

- 再読込を拒否する
- 確認ダイアログを出す
- ユーザー変更を維持する
- 強制 reset する。ただし理由を UI で説明する

---

## 13. TypeSpec のモデル例

```typespec
model ErrorHandlingPageLoadRequest {
  id: string;
  includeHistory?: boolean;
  historyPage?: int32;
  historyPageSize?: int32;
}

model ErrorHandlingPageLoadResponse {
  pageTitle: string;
  statusLabel: string;
  updatedAtText: string;
  updatedByName: string;

  name: string;
  description: string;
  retryCount: string;
  enabled: boolean;
  targetIds: string[];

  version: string;
}

model ErrorHandlingPageUpdateRequest {
  name: string;
  description?: string;
  retryCount?: int32;
  enabled: boolean;
  targetIds: string[];
  version: string;
}

@post
@route("/error-handling-page/load")
op errorHandlingPageLoad(
  @body request: ErrorHandlingPageLoadRequest,
): ErrorHandlingPageLoadResponse;

@post
@route("/error-handling-page/update")
op errorHandlingPageUpdate(
  @body request: ErrorHandlingPageUpdateRequest,
): void;
```

このモデルでの重要な点は次のとおりである。

- `ErrorHandlingPageLoadRequest` は普通の API request である
- `ErrorHandlingPageLoadResponse` だけが Page ViewModel である
- `ErrorHandlingPageUpdateRequest` は API の自然な更新 Command である
- `retryCount` は load response では UI 用の `string`、update request では API 用の `int32`
- `description` は load response では必須 string、update request では optional string

---

## 14. 実装チェックリスト

### load request

- [ ] 取得条件は自然な API 型で表している
- [ ] 未指定条件には `undefined` / optional property を使っている
- [ ] UI 都合で `""` を送っていない
- [ ] number / boolean を string 化していない

### load response

- [ ] ページ専用の Page ViewModel である
- [ ] 原則として optional property がない
- [ ] text の空値は `""` である
- [ ] boolean は `boolean`、複数選択は配列である
- [ ] 表示用の整形済み文字列は `xxxText` / `xxxLabel` と命名している
- [ ] そのまま RHF の `defaultValues` / `reset()` に渡せる

### RHF

- [ ] Page ViewModel 全体を RHF に格納している
- [ ] JSX の値参照元を原則 RHF に統一している
- [ ] `value ?? ''` のような個別補正をしていない
- [ ] 表示の購読を `useWatch` で局所化している
- [ ] dirty なフォームを無条件に reset していない

### update / 非 load API

- [ ] 更新 request は output schema を通して作る
- [ ] `""` を通信へ送らない
- [ ] string → number/date の変換を output schema に集約している
- [ ] 表示専用項目を request から除外している
- [ ] optional / omission / null の意味を API 契約として定義している
- [ ] 更新 response を暗黙に Page ViewModel とみなしていない

---

## 15. 結論

本標準の核心は、次の非対称性を意図的に受け入れることである。

```text
load request
  = API に何を取得してほしいか
  = API 契約に忠実な自然な型

load response
  = ページをどう安全に表示・編集するか
  = 完全な Page ViewModel
  = UI 向けの string / "" / boolean / []

update request
  = API に何を実行してほしいか
  = API 契約に忠実な Command
  = undefined、省略、number、boolean 等
```

load response だけを UI 向けに特別扱いすることで、RHF と JSX は安定した完全なページ状態を扱える。一方、更新を含む非 load API は、`useRequestForm` と output schema を境界として、API 契約の型と意味論を保つ。

この設計は、BFF、TanStack Router loader、RHF、コード生成、複雑な業務画面を組み合わせるための、意図的な設計標準である。
