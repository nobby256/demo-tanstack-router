# ローカル版 `@orval/zod` 拡張

このディレクトリは、`orval@8.15.0` に含まれる `@orval/zod` をベースにしたローカル改造版です。

本プロジェクトでは、OpenAPI の `x-type` 拡張を利用して、  
生成される Zod schema のベース関数を **外部DSL（schema関数）に委譲**します。

---

# ✅ 目的

通常の Orval Zod 生成では、以下のようなコードが生成されます。

```ts
zod.string().max(50)
zod.email()
zod.number().min(0)
````

本プロジェクトでは、これを次のように変換します：

```ts
schema("string", meta).max(50)
```

***

👉 **Zod生成のベース部分を完全に外部化するのが目的です**

***

# ✅ 動作イメージ

## ✅ OpenAPI

```yaml
num:
  type: string
  x-type:
    kind: decimal
    precision: 5
    scale: 2
```

***

## ✅ 生成結果

```ts
num: schema("string", { kind: "decimal", precision: 5, scale: 2 })
```

***

👉 **OpenAPIのDSLをそのまま透過してschema関数に渡す**

***

# ✅ この仕組みで実現すること

* OpenAPIに業務DSLを埋め込める
* generatorはDSLを知らない（完全透過）
* validationロジックを完全に外部化
* Orvalの構造・制約ロジックは維持
* upgrade耐性が高い（最小差分）

***

# ✅ `x-type` 仕様

## ✅ 記述形式（自由DSL）

```yaml
x-type:
  kind: decimal
  precision: 10
  scale: 2
```

👉 **形式は完全自由（objectであればOK）**

***

### ✅ 他の例

```yaml
x-type:
  kind: hiragana
```

```yaml
x-type: "custom-type"
```

***

👉 generatorは内容を一切解釈しません

***

# ✅ Zod生成仕様

## ✅ ベース関数の置き換え

Orval が選択した Zod のベース関数を  
以下の形式に置き換えます。

```ts
schema("<type>", <meta>)
```

***

## ✅ 例

### 入力

```yaml
type: string
x-type:
  kind: decimal
```

***

### 通常Orval

```ts
zod.string()
```

***

### 変換後

```ts
schema("string", { kind: "decimal" })
```

***

## ✅ 後続チェーンは維持

```ts
schema("string", { kind: "decimal" })
  .max(50)
  .optional()
```

***

👉 ✅ Orvalのバリデーションはそのまま続く

***

## ✅ typeはOrvalに従う

```ts
schema("string", ...)
schema("number", ...)
schema("date", ...)
schema("email", ...)
```

***

👉 **OpenAPIではなく Orval が選択したZod関数名をそのまま使用**

***

# ✅ 有効化条件（重要）

```ts
override: {
  mutator: {
    path: "...",
    name: "schema"
  }
}
```

***

## ✅ 挙動

| 状態        | 挙動                  |
| --------- | ------------------- |
| mutatorあり | `schema(...)` を生成   |
| mutatorなし | `x-type` は無視（通常Zod） |

***

👉 例：

### mutatorなし

```yaml
type: string
x-type:
  kind: decimal
```

↓

```ts
zod.string() // ✅ 通常生成
```

***

# ✅ mutatorの制約

## ✅ nameは必須

```ts
mutator: {
  path: "...",
  name: "schema"
}
```

***

👉 ❗ **nameが無い場合はエラーになります**

理由：

* 呼び出し関数名を決定できないため
* default exportのみではコード生成できない

***

## ✅ エラーパターン

### mutator未指定

```
[orval/zod] x-type requires a mutator but none is configured
```

***

### name未指定

```
[orval/zod] x-type requires a named export (mutator.name)
```

***

# ✅ schema関数（プロジェクト側実装）

## ✅ 役割

* `type` と `meta` を受け取る
* Zod schema を返す
* DSLを解釈する

***

## ✅ 最小実装例

```ts
import * as z from "zod";

export const schema = (
  type: string,
  meta: unknown
) => {
  if (type !== "string") {
    throw new Error(`[schema] unsupported type: ${type}`);
  }

  if ((meta as any)?.kind === "decimal") {
    return z.string(); // 実装はここに書く
  }

  return z.string();
};
```

***

# ✅ 設計のポイント

***

## ✅ ① DSL完全透過

```ts
schema(type, meta)
```

👉 generatorは理解しない

***

***

## ✅ ② 責務分離

| 層         | 責務        |
| --------- | --------- |
| Orval     | 型・構造生成    |
| extension | DSLの受け渡し  |
| schema    | バリデーション実装 |

***

***

## ✅ ③ fail-fast設計

* 未対応type → エラー
* 不正DSL → エラー

***

***

## ✅ ④ 将来拡張容易

```yaml
x-type:
  kind: email
```

👉 schema側だけ変更すれば対応可能

***

***

# ✅ 制約

***

## ✅ enumと併用不可

```yaml
enum: [...]
x-type: ...
```

👉 エラーになる

***

***

## ✅ 構造系スキーマは非対応

以下には適用されません：

```
array
object
tuple
allOf
oneOf
anyOf
additionalProperties
```

***

# ✅ 実装方針

* index.ts の変更は最小限
* 拡張は `validation-extension.ts` に集約
* Orvalの既存処理を最大限利用
* DSLは完全に外部へ委譲

***

# ✅ 全体まとめ

```text
OpenAPI:
  x-type: <meta>

Zod（mutatorあり）:
  schema("<type>", <meta>)

Zod（mutatorなし）:
  zod.<type>()

責務:
  Orval → 型と構造
  schema → DSL解釈
```

***

# ✅ 最後に

この実装は以下を実現します：

* ✔ Zod生成の完全な拡張性
* ✔ DSLベースのバリデーション設計
* ✔ generatorの責務最小化
* ✔ 高いupgrade耐性

***

👉 **これは「Zod generatorの拡張」ではなく「DSL実行基盤」です**
