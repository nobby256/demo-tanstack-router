import {
  type ArrayValue,
  type BooleanValue,
  type DecoratorContext,
  type Model,
  type ModelProperty,
  type Scalar,
  type StringValue,
  type Type,
  type Value,
} from '@typespec/compiler'

import {
  hasProcessedAnonymousModel,
  markAnonymousModelProcessed,
  reportDiagnostic,
} from './lib.js'

/**
 * @rhfContract が自動付与する default の種類。
 *
 * defaultValue へ設定する実際の Value object は、
 * property の型情報とともに createImplicitDefaultValue で生成する。
 */
type RhfImplicitDefaultKind = 'empty-string' | 'false' | 'empty-array'

/**
 * @rhfContract の実装。
 *
 * 処理対象:
 * - decorator が直接付与された named Model
 * - 上記 Model の内部にある anonymous Model
 * - 上記 Model の array property の要素型にある anonymous Model
 *
 * 処理対象外:
 * - 継承元の property
 * - @rhfContract が付いていない named nested Model の内部
 */
export function $rhfContract(context: DecoratorContext, target: Model): void {
  processModel(context, target, {
    processAnonymousModel: false,
  })
}

interface ProcessModelOptions {
  /**
   * true の場合、この model は親から辿った anonymous model である。
   * anonymous model は処理済み state に記録して循環・重複処理を防ぐ。
   *
   * named model は @rhfContract が直接付与された場合だけ処理するため、
   * このフラグを true にして親から再帰処理することはない。
   */
  processAnonymousModel: boolean
}

function processModel(
  context: DecoratorContext,
  model: Model,
  options: ProcessModelOptions,
): void {
  if (options.processAnonymousModel) {
    if (hasProcessedAnonymousModel(context.program, model)) {
      return
    }

    markAnonymousModelProcessed(context.program, model)
  }

  for (const property of getDirectProperties(model)) {
    processProperty(context, model, property)
  }
}

function processProperty(
  context: DecoratorContext,
  ownerModel: Model,
  property: ModelProperty,
): void {
  /**
   * optional leaf は contract 違反である。
   *
   * diagnostic を報告した invalid property には defaultValue を設定しない。
   * compile は失敗するが、invalid semantic model に余計な metadata を
   * 残さないため、ここで処理を打ち切る。
   */
  if (validateOptionalLeaf(context, ownerModel, property)) {
    return
  }

  /**
   * TypeSpec 標準 @default(...) または `= <value>` がある場合は、
   * 値の内容にかかわらず明示指定を最優先する。
   *
   * @default("") / @default("guest") / @default(false) / @default(true) /
   * @default(#[]) / @default(#["A"]) のいずれも変更・検証しない。
   */
  if (!hasExplicitDefault(property)) {
    const defaultKind = getAutoDefaultKind(property.type)

    if (defaultKind !== undefined) {
      setDefaultValueIfAbsent(property, defaultKind)
    }
  }

  /**
   * parent @rhfContract の適用範囲として、次の anonymous model を
   * 再帰的に処理する。
   *
   * - inline object / anonymous model を property 型として直接持つ場合
   * - array property の要素型が inline object / anonymous model である場合
   *
   * named nested model は共有 DTO 等として利用される可能性があるため、
   * 親 model からは追跡しない。その named model 自身に @rhfContract が
   * 付与されている場合だけ、別途 $rhfContract が実行される。
   */
  processAnonymousNestedModels(context, property.type)
}

/**
 * property 型から anonymous model を辿り、必要なら再帰処理する。
 *
 * array そのものは default `#[]` の対象だが、array の element type が
 * anonymous model であれば、その内部 property も @rhfContract の
 * 適用範囲として処理する。
 *
 * 例:
 *
 * ```typespec
 * @rhfContract
 * model Form {
 *   items: {
 *     name: string;
 *     enabled: boolean;
 *   }[];
 * }
 * ```
 *
 * この場合:
 * - items には #[] を設定する
 * - items の element type の name には "" を設定する
 * - items の element type の enabled には false を設定する
 */
function processAnonymousNestedModels(
  context: DecoratorContext,
  type: Type,
): void {
  /**
   * TypeSpec Type を Model に絞り込む。
   *
   * `isAnonymousNestedModel(type)` は type predicate であり、先にこれを
   * 呼ぶと false 側では Model が除外されてしまう。
   *
   * そのため、最初に kind で Model かどうかを判定し、Model である範囲内で
   * direct anonymous model と Array<T> の element type を処理する。
   */
  if (type.kind !== 'Model') {
    return
  }

  /**
   * inline object / anonymous model を property 型として直接持つ場合。
   *
   * named nested model は共有 DTO 等として利用される可能性があるため、
   * 親 model からは追跡しない。
   */
  if (!type.name) {
    processModel(context, type, {
      processAnonymousModel: true,
    })
    return
  }

  /**
   * T[] / Array<T> の element type を辿る。
   *
   * array model 自体は named Model として表現されるため、上の anonymous model
   * 判定には該当しない。numeric indexer の value が配列の element type となる。
   */
  const indexer = type.indexer

  if (indexer === undefined || !isNumericIndexer(indexer.key)) {
    return
  }

  const elementType = indexer.value

  /**
   * named model の配列は親 @rhfContract から追跡しない。
   *
   * 例:
   * `items: SharedItem[];`
   *
   * SharedItem 自身に @rhfContract が付いている場合だけ、その decorator
   * 評価によって SharedItem の内部 property を処理する。
   */
  if (elementType.kind !== 'Model' || elementType.name) {
    return
  }

  processModel(context, elementType, {
    processAnonymousModel: true,
  })
}

/**
 * target.properties は継承済み property も持ち得る。
 *
 * 今回の要件は「@rhfContract を付けた model 自身に直接宣言された
 * property だけを対象にする」ため、property.model === model に絞る。
 *
 * したがって、BaseForm の property は ChildForm に @rhfContract を付けても
 * 処理しない。BaseForm 自身に @rhfContract を付けた場合は、その decorator
 * 評価によって BaseForm の直接 property が処理される。
 */
function getDirectProperties(model: Model): Iterable<ModelProperty> {
  return Array.from(model.properties.values()).filter(
    (property) => property.model === model,
  )
}

/**
 * optional leaf を検出して diagnostic を報告する。
 *
 * @returns optional leaf を検出して diagnostic を報告した場合は true。
 *          呼び出し元は true の場合、その property への default 補完など
 *          後続処理を行わない。
 */
function validateOptionalLeaf(
  context: DecoratorContext,
  ownerModel: Model,
  property: ModelProperty,
): boolean {
  if (!property.optional) {
    return false
  }

  /**
   * optional nested model は、panel / section の存在・非存在を表す用途として
   * 許可する。
   *
   * ただし Array<T> は semantic model 上 Model として現れるため、
   * type.kind === 'Model' だけで許可してはいけない。
   *
   * tags?: string[] は optional nested model ではなく optional leaf であり、
   * diagnostic の対象となる。
   */
  if (isOptionalNestedObjectModel(property.type)) {
    return false
  }

  reportDiagnostic(context.program, {
    code: 'optional-leaf',
    target: property,
    format: {
      propertyName: property.name,
      modelName: getModelDisplayName(ownerModel),
    },
  })

  return true
}

/**
 * optional を許可する nested model を判定する。
 *
 * - named model: 許可
 * - anonymous object model: 許可
 * - Array<T>: 不許可。tags?: string[] は optional leaf として diagnostic
 *
 * 注意:
 * TypeSpec の Array<T> は semantic model 上 Model として現れる。
 * そのため type.kind === 'Model' だけで判定してはいけない。
 */
function isOptionalNestedObjectModel(type: Type): type is Model {
  return type.kind === 'Model' && !isArrayLike(type)
}

/**
 * TypeSpec 標準 @default(...) および `= <value>` の有無。
 *
 * defaultValue が存在すれば、値の内容を確認せず、必ず明示 default を優先する。
 */
function hasExplicitDefault(property: ModelProperty): boolean {
  return property.defaultValue !== undefined
}

/**
 * 標準 defaultValue を設定する。
 *
 * OpenAPI emitter は library 独自の stateMap metadata を読まない。
 * OpenAPI schema に `default` を出力させるため、TypeSpec compiler の
 * semantic ModelProperty.defaultValue を設定する。
 *
 * 明示 @default(...) は呼び出し側で除外済みだが、冪等性のためここでも確認する。
 */
function setDefaultValueIfAbsent(
  property: ModelProperty,
  defaultKind: RhfImplicitDefaultKind,
): void {
  if (property.defaultValue !== undefined) {
    return
  }

  property.defaultValue = createImplicitDefaultValue(property, defaultKind)
}

/**
 * 初期自動 default の判定箇所。
 *
 * 対象:
 * - built-in string: ""
 * - built-in boolean: false
 * - T[] / Array<T>: #[]
 *
 * 対象外:
 * - number / int32 / float64 等
 * - enum
 * - date / datetime 等
 * - union / null / unknown
 * - custom scalar
 * - named / anonymous nested model property 自体
 *
 * 将来 custom scalar や alias の扱いを広げる場合は、
 * isBuiltinString / isBuiltinBoolean / isArrayLike のみを拡張する。
 */
function getAutoDefaultKind(type: Type): RhfImplicitDefaultKind | undefined {
  if (isBuiltinString(type)) {
    return 'empty-string'
  }

  if (isBuiltinBoolean(type)) {
    return 'false'
  }

  if (isArrayLike(type)) {
    return 'empty-array'
  }

  return undefined
}

/**
 * TypeSpec semantic model に設定する Value を生成する。
 *
 * TypeSpec では model property の default は Value として表現される。
 * @typespec/openapi3 は ModelProperty.defaultValue を参照して OpenAPI の
 * schema.default を出力する。
 *
 * StringValue / BooleanValue では scalar が必須である。
 * 現仕様では string / boolean の組込み scalar だけを対象とするため、
 * property.type を Scalar として使用できる。
 */
function createImplicitDefaultValue(
  property: ModelProperty,
  defaultKind: RhfImplicitDefaultKind,
): Value {
  switch (defaultKind) {
    case 'empty-string':
      return createEmptyStringValue(property.type)

    case 'false':
      return createFalseValue(property.type)

    case 'empty-array':
      return createEmptyArrayValue(property.type)
  }
}

/**
 * string property 用の StringValue を作る。
 *
 * getAutoDefaultKind により、呼び出し時点では property.type は
 * built-in string Scalar であることが保証される。
 */
function createEmptyStringValue(type: Type): StringValue {
  return {
    entityKind: 'Value',
    valueKind: 'StringValue',
    scalar: type as Scalar,
    value: '',
    type,
  }
}

/**
 * boolean property 用の BooleanValue を作る。
 *
 * getAutoDefaultKind により、呼び出し時点では property.type は
 * built-in boolean Scalar であることが保証される。
 */
function createFalseValue(type: Type): BooleanValue {
  return {
    entityKind: 'Value',
    valueKind: 'BooleanValue',
    scalar: type as Scalar,
    value: false,
    type,
  }
}

/**
 * T[] / Array<T> property 用の ArrayValue を作る。
 *
 * #[] は要素を持たないため、values は空配列になる。
 * ArrayValue には scalar property は存在しない。
 */
function createEmptyArrayValue(type: Type): ArrayValue {
  return {
    entityKind: 'Value',
    valueKind: 'ArrayValue',
    values: [],
    type,
  }
}

/**
 * 現仕様では built-in string のみ対象。
 *
 * scalar Email extends string のような custom scalar は対象外。
 * custom scalar を対象にする要件が追加された場合は、この関数で
 * scalar の baseScalar を辿る方針を検討する。
 */
function isBuiltinString(type: Type): type is Scalar {
  return type.kind === 'Scalar' && type.name === 'string'
}

/**
 * 現仕様では built-in boolean のみ対象。
 *
 * scalar FeatureFlag extends boolean のような custom scalar は対象外。
 * custom scalar を対象にする要件が追加された場合は、この関数で
 * scalar の baseScalar を辿る方針を検討する。
 */
function isBuiltinBoolean(type: Type): type is Scalar {
  return type.kind === 'Scalar' && type.name === 'boolean'
}

/**
 * Array<T> / T[] 判定。
 *
 * TypeSpec の array は numeric indexer を持つ Model として表現される。
 * `T[]` は `Array<T>` の shorthand であり、array model の indexer.value が
 * 要素型 T になる。
 *
 * Record<string, T> 等の string indexer model を array と誤認しないため、
 * indexer.key が numeric scalar であることを確認する。
 *
 * この実装は TypeSpec 1.13.0 の semantic model を対象とする。
 * collection 型の扱いを拡張する場合は、この関数と isNumericIndexer を修正する。
 */
function isArrayLike(type: Type): boolean {
  if (type.kind !== 'Model') {
    return false
  }

  const indexer = type.indexer

  return indexer !== undefined && isNumericIndexer(indexer.key)
}

/**
 * Model indexer が配列用の numeric indexer かを判定する。
 *
 * TypeSpec の array model は numeric scalar を key にする indexer を持つ。
 * 組込み Array<T> の indexer key は通常 integer 系 scalar である。
 *
 * numeric scalar の派生型も許容できるよう、baseScalar を辿って確認する。
 * ただし今回の対象は compiler が生成する Array<T> であり、
 * 利用者が定義した任意の numeric-indexed model を array とみなすことは
 * 意図していない。必要なら後で namespace / template 情報による絞り込みを追加する。
 */
function isNumericIndexer(key: Scalar): boolean {
  let current: Scalar | undefined = key

  while (current !== undefined) {
    if (current.name === 'integer' || current.name === 'numeric') {
      return true
    }

    current = current.baseScalar
  }

  return false
}

/**
 * diagnostic 用の model 名を返す。
 *
 * anonymous model 内で optional leaf が検出された場合でも、diagnostic message
 * が空の model 名にならないよう <anonymous> を使用する。
 */
function getModelDisplayName(model: Model): string {
  return model.name || '<anonymous>'
}
