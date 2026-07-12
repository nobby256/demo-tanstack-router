 `@orval/zod` 拡張

このディレクトリは、`orval@8.15.0` に含まれる `@orval/zod` をベースにしたローカル改造版です。

本プロジェクトでは、OpenAPI の `x-type` 拡張を利用して、生成される Zod schema のベース関数を **外部DSL（schema関数）に委譲**します。

---

# ✅ 目的

通常の Orval Zod 生成では、以下のようなコードが生成されます。

```ts
zod.string().max(50)
zod.email()
zod.number().min(0)
````

本プロジェクトでは、これを次のように変換します。

```ts
schema("string", meta).max(50)
```

配列の場合は、配列構造をOrvalに維持させたまま、最終的な要素型のベース関数を外部DSLに委譲します。

```ts
zod.array(schema("string", meta))
```

👉 **Zod生成のスカラー型のベース部分を外部化するのが目的です**

***

# ✅ 動作イメージ

## ✅ スカラー型

### OpenAPI

```yaml
num:
  type: string
  x-type:
    kind: decimal
    precision: 5
    scale: 2
```

### 生成結果

```ts
num: schema("string", { kind: "decimal", precision: 5, scale: 2 })
```

👉 **OpenAPIのDSLをそのまま透過してschema関数に渡します**

***

## ✅ 配列型

### OpenAPI

```yaml
names:
  type: array
  items:
    type: string
  x-type:
    kind: hiragana
```

### 生成結果

```ts
names: zod.array(
  schema("string", { kind: "hiragana" })
)
```

この場合、`x-type` は配列そのものではなく、最終的な要素型である `string` に適用されます。

👉 **配列構造はOrvalが生成し、要素のスカラー型だけをschema関数に委譲します**

***

# ✅ この仕組みで実現すること

* OpenAPIに業務DSLを埋め込める
* generatorはDSLを知らない（完全透過）
* validationロジックを外部化できる
* Orvalの構造・制約ロジックを維持できる
* 配列の要素型にも同じDSLを適用できる
* Orval本体に対する変更を最小限に抑えられる
* upgrade耐性を高く保てる

***

# ✅ `x-type` 仕様

## ✅ 記述形式（自由DSL）

```yaml
x-type:
  kind: decimal
  precision: 10
  scale: 2
```

`x-type` の値はオブジェクトに限定されません。

例えば、文字列を指定することもできます。

```yaml
x-type: custom-type
```

その他の例：

```yaml
x-type:
  kind: hiragana
```

```yaml
x-type:
  kind: decimal
  precision: 10
  scale: 2
  signed: true
```

👉 **generatorは `x-type` の内容を一切解釈しません**

`x-type` の値は `unknown` として取得され、そのまま `schema` 関数の第2引数へ渡されます。

***

# ✅ Zod生成仕様

## ✅ スカラー型のベース関数の置き換え

Orvalが選択したZodのベース関数を、以下の形式に置き換えます。

```ts
schema("<type>", <meta>)
```

* `<type>`：Orvalが選択したZod関数名
* `<meta>`：OpenAPIの `x-type` に指定された値

***

## ✅ スカラー型の例

### 入力

```yaml
type: string
x-type:
  kind: decimal
```

### 通常のOrval

```ts
zod.string()
```

### 生成結果

```ts
schema("string", { kind: "decimal" })
```

***

## ✅ 後続チェーンは維持

Orvalが生成する制約やmodifierは、`schema(...)` の後ろにそのまま連結されます。

```ts
schema("string", { kind: "decimal" })
  .max(50)
  .optional()
```

例えば、次のOpenAPI Schemaを指定した場合：

```yaml
type: string
maxLength: 50
x-type:
  kind: hiragana
```

概念的には、次のようなZod schemaが生成されます。

```ts
schema("string", { kind: "hiragana" }).max(50)
```

👉 **Orvalのバリデーションチェーンはそのまま維持されます**

***

## ✅ typeはOrvalが選択したZod関数名に従う

`schema` 関数の第1引数には、OpenAPIの `type` を直接渡すのではなく、Orvalが最終的に選択したZodのベース関数名を渡します。

例：

```ts
schema("string", ...)
schema("number", ...)
schema("boolean", ...)
schema("date", ...)
schema("email", ...)
schema("url", ...)
schema("uuid", ...)
```

例えば、OpenAPI上は次の定義であっても、

```yaml
type: integer
x-type:
  kind: positive-integer
```

OrvalがZodの `number` として解決した場合、第1引数は `"number"` になります。

```ts
schema("number", { kind: "positive-integer" })
```

👉 **外部DSLには、Orvalが実際に生成しようとしたZod関数名が渡されます**

***

# ✅ 配列の生成仕様

## ✅ 1次元配列

配列に `x-type` が指定された場合、配列自体を `schema("array", ...)` に置き換えることはしません。

配列の要素定義をたどり、最終的なスカラー型のベース関数を置き換えます。

### 入力

```yaml
type: array
items:
  type: string
x-type:
  kind: hiragana
```

### 通常のOrval

```ts
zod.array(zod.string())
```

### 生成結果

```ts
zod.array(
  schema("string", { kind: "hiragana" })
)
```

配列の `minItems` や `maxItems` など、Orvalが生成する配列側の制約は維持されます。

***

## ✅ number配列

### 入力

```yaml
type: array
items:
  type: number
x-type:
  kind: decimal
  precision: 10
  scale: 2
```

### 生成結果

```ts
zod.array(
  schema("number", {
    kind: "decimal",
    precision: 10,
    scale: 2
  })
)
```

***

## ✅ 多次元配列

多次元配列の場合は、配列を再帰的にたどり、最終的なスカラー要素に `x-type` を適用します。

### 入力

```yaml
type: array
items:
  type: array
  items:
    type: string
x-type:
  kind: hiragana
```

### 生成結果

```ts
zod.array(
  zod.array(
    schema("string", { kind: "hiragana" })
  )
)
```

同じ規則により、以下のような多次元配列を扱えます。

```text
string[]
number[]
boolean[]
string[][]
number[][][]
```

👉 **配列の深さにかかわらず、最終的なスカラー要素へ適用します**

***

## ✅ 配列要素側への指定

`x-type` は、配列ではなく `items` 側に指定することもできます。

```yaml
type: array
items:
  type: string
  x-type:
    kind: hiragana
```

生成結果は次のようになります。

```ts
zod.array(
  schema("string", { kind: "hiragana" })
)
```

***

## ❌ 配列階層の複数箇所への指定

同じ配列階層の複数箇所に `x-type` を指定することはできません。

次のような定義はエラーになります。

```yaml
type: array
x-type:
  kind: outer
items:
  type: string
  x-type:
    kind: inner
```

外側と内側のどちらのDSLを最終要素へ適用するかが曖昧になるためです。

```text
[orval/zod] x-type が配列階層の複数箇所に指定されています。配列または配列要素のいずれか一方にだけ指定してください。
```

`x-type` は、配列または最終的な要素スキーマのどちらか一方に指定してください。

***

# ✅ 有効化条件

`x-type` による外部DSL呼び出しを有効にするには、Orvalの `override.mutator` を設定します。

```ts
override: {
  mutator: {
    path: "./schema.ts",
    name: "schema"
  }
}
```

## ✅ 挙動

| 状態        | 挙動                               |
| --------- | -------------------------------- |
| mutatorあり | `x-type` を使用して `schema(...)` を生成 |
| mutatorなし | `x-type` を無視して通常のZod schemaを生成   |

***

## ✅ mutatorなし

### OpenAPI

```yaml
type: string
x-type:
  kind: decimal
```

### 生成結果

```ts
zod.string()
```

`override.mutator` が設定されていない場合、`x-type` は無視されます。

***

# ✅ mutatorの制約

## ✅ nameは必須

mutatorには、名前付きexportの関数名を指定する必要があります。

```ts
mutator: {
  path: "./schema.ts",
  name: "schema"
}
```

`name` がない場合、generatorは呼び出す関数名を決定できないため、エラーになります。

```text
[orval/zod] x-type requires a named export (mutator.name) but it is missing. Default export is not supported here.
```

default exportのみのmutatorは、この用途ではサポートしません。

***

# ✅ schema関数（プロジェクト側実装）

## ✅ 役割

プロジェクト側の `schema` 関数は、次の役割を担当します。

* Orvalが選択したZod関数名を `type` として受け取る
* OpenAPIの `x-type` を `meta` として受け取る
* `meta` に含まれる業務DSLを解釈する
* Zod schemaを返す
* 未対応の型や不正なDSLを必要に応じてエラーにする

***

## ✅ 最小実装例

```ts
import * as z from "zod";

export const schema = (
  type: string,
  meta: unknown,
) => {
  if (type !== "string") {
    throw new Error(`[schema] unsupported type: ${type}`);
  }

  if (
    typeof meta === "object" &&
    meta !== null &&
    "kind" in meta &&
    meta.kind === "decimal"
  ) {
    return z.string();
  }

  return z.string();
};
```

***

## ✅ 複数のtypeを扱う例

```ts
import * as z from "zod";

export const schema = (
  type: string,
  meta: unknown,
) => {
  switch (type) {
    case "string":
      return z.string();

    case "number":
      return z.number();

    case "boolean":
      return z.boolean();

    case "date":
      return z.date();

    default:
      throw new Error(`[schema] unsupported type: ${type}`);
  }
};
```

配列の場合も `schema` 関数に渡されるのは最終的な要素型です。

例えば `string[]` の場合：

```ts
schema("string", meta)
```

`string[][]` の場合も同様です。

```ts
schema("string", meta)
```

配列の構築はOrval側が担当するため、`schema` 関数が配列の深さを解釈する必要はありません。

***

# ✅ 設計のポイント

## ✅ ① DSL完全透過

```ts
schema(type, meta)
```

generatorは `meta` の内容を解釈しません。

OpenAPIの `x-type` に指定された値を、そのまま外部関数へ渡します。

***

## ✅ ② 責務分離

| 層         | 責務                       |
| --------- | ------------------------ |
| Orval     | 型、配列、オブジェクトなどの構造生成       |
| extension | `x-type` の取得と外部DSLへの受け渡し |
| schema    | DSLの解釈とバリデーション実装         |

***

## ✅ ③ 配列構造と要素バリデーションの分離

配列の構造はOrvalが生成します。

```ts
zod.array(...)
```

要素のスカラー型は外部DSLへ委譲します。

```ts
schema("string", meta)
```

これらを組み合わせて、次のようなschemaを生成します。

```ts
zod.array(
  schema("string", meta)
)
```

多次元配列でも同じ責務分離を維持します。

```ts
zod.array(
  zod.array(
    schema("string", meta)
  )
)
```

***

## ✅ ④ fail-fast設計

以下のような問題は、生成時またはschema関数の実行時にエラーとして扱います。

* 未対応のtype
* 不正なDSL
* `enum` と `x-type` の併用
* objectなど、未対応の構造系スキーマへの指定
* objectを要素とする配列への指定
* 配列階層の複数箇所への `x-type` 指定
* mutatorの `name` 未指定

***

## ✅ ⑤ 将来拡張が容易

例えば、次のDSLを追加する場合：

```yaml
x-type:
  kind: email
```

generator側で `kind` を判定する必要はありません。

プロジェクト側の `schema` 関数だけを変更して対応できます。

***

# ✅ 制約

## ❌ enumとの併用不可

`enum` と `x-type` を同じ対象に指定することはできません。

```yaml
type: string
enum:
  - active
  - inactive
x-type:
  kind: status
```

この場合はエラーになります。

```text
[orval/zod] x-type は enum と併用できません。
```

配列の要素がenumの場合も対象外です。

```yaml
type: array
items:
  type: string
  enum:
    - active
    - inactive
x-type:
  kind: status
```

この定義もエラーになります。

***

## ✅ arrayは対応

`array` は構造系スキーマですが、例外的に `x-type` を指定できます。

ただし、配列そのものを外部DSLに置き換えるのではなく、配列の最終的な要素型に適用します。

対応例：

```text
string[]
number[]
boolean[]
string[][]
number[][][]
```

***

## ❌ object配列は非対応

最終的な配列要素がobjectの場合は、`x-type` を適用できません。

```yaml
type: array
items:
  type: object
  properties:
    value:
      type: string
x-type:
  kind: custom-object
```

この場合はエラーになります。

```text
[orval/zod] x-type は配列要素の構造系スキーマ "object" には適用できません。
```

objectのプロパティとして定義されたスカラー型に、個別に `x-type` を指定することはできます。

```yaml
type: array
items:
  type: object
  properties:
    value:
      type: string
      x-type:
        kind: hiragana
```

この場合、配列やobjectではなく `value` プロパティの `string` に適用されます。

概念的な生成結果：

```ts
zod.array(
  zod.object({
    value: schema("string", { kind: "hiragana" })
  })
)
```

***

## ❌ array以外の構造系スキーマは非対応

以下の構造系スキーマ自体には `x-type` を適用できません。

```text
object
strictObject
looseObject
tuple
allOf
oneOf
anyOf
additionalProperties
```

これらの構造内部にあるスカラー型へ、個別に `x-type` を指定することはできます。

***

# ✅ 対応可否の例

## ✅ 対応

```yaml
type: string
x-type:
  kind: hiragana
```

```yaml
type: number
x-type:
  kind: decimal
```

```yaml
type: array
items:
  type: string
x-type:
  kind: hiragana
```

```yaml
type: array
items:
  type: array
  items:
    type: number
x-type:
  kind: decimal
```

```yaml
type: object
properties:
  name:
    type: string
    x-type:
      kind: hiragana
```

***

## ❌ 非対応

### object自体への指定

```yaml
type: object
x-type:
  kind: custom-object
properties:
  value:
    type: string
```

### object配列への指定

```yaml
type: array
items:
  type: object
  properties:
    value:
      type: string
x-type:
  kind: custom-object
```

### tupleへの指定

```yaml
type: array
prefixItems:
  - type: string
  - type: number
x-type:
  kind: custom-tuple
```

### enumとの併用

```yaml
type: string
enum:
  - A
  - B
x-type:
  kind: custom-enum
```

### 複数階層への指定

```yaml
type: array
x-type:
  kind: outer
items:
  type: string
  x-type:
    kind: inner
```

***

# ✅ 実装方針

* `index.ts` の変更は最小限にする
* 拡張ロジックは `validation-extension.ts` に集約する
* Orvalの既存処理を最大限利用する
* DSLの内容は完全に外部へ委譲する
* 配列構造はOrvalの既存処理を維持する
* 配列に指定された `x-type` は最終的なスカラー要素へ適用する
* 未対応の構造や曖昧な指定はfail-fastでエラーにする

***

# ✅ 全体まとめ

```text
OpenAPI:
  x-type: <meta>

スカラー型:
  schema("<type>", <meta>)

1次元配列:
  zod.array(
    schema("<item-type>", <meta>)
  )

多次元配列:
  zod.array(
    zod.array(
      schema("<item-type>", <meta>)
    )
  )

mutatorなし:
  x-typeを無視して通常のZod schemaを生成

責務:
  Orval     → 型と構造の生成
  extension → x-typeの受け渡し
  schema    → DSLの解釈とバリデーション実装
```

***

# ✅ 最後に

この実装は以下を実現します。

* ✔ Zod生成の高い拡張性
* ✔ DSLベースのバリデーション設計
* ✔ スカラー型のバリデーション外部化
* ✔ スカラー配列および多次元配列への対応
* ✔ Orvalによる配列・オブジェクト構造の維持
* ✔ generatorの責務最小化
* ✔ 高いupgrade耐性
* ✔ 未対応構造に対するfail-fast

👉 **これは単なる「Zod generatorの拡張」ではなく、OpenAPIに記述した業務DSLを外部のschema関数へ接続するための実行基盤です**
