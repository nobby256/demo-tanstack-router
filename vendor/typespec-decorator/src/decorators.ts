import type {
  ArrayValue,
  BooleanValue,
  DecoratorContext,
  Model,
  ModelProperty,
  Scalar,
  StringValue,
  Type,
  Value,
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
   * parent @rhfContract の適用範囲として、inline object / anonymous model
   * の内部 property は再帰的に処理する。
   *
   * named nested model は共有 DTO 等として利用される可能性があるため、
   * 親 model からは追跡しない。その named model 自身に @rhfContract が
   * 付与されている場合だけ、別途 $rhfContract が実行される。
   */
  if (isAnonymousNestedModel(property.type)) {
    processModel(context, property.type, {
      processAnonymousModel: true,
    })
  }
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
   * ただし Array<T> は semantic model 上 Model として現れることがあるため、
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
 * TypeSpec の Array<T> は semantic model 上 Model として現れることがある。
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
 * TypeSpec 1.13.0 の Array<T> は Model として表現される。
 * model.name が "Array" のものを最低限サポートする。
 *
 * alias MyStrings = string[] のような alias 経由については、
 * compiler が解決後に Array model を返す場合には同様に対象になる。
 *
 * 今後 collection 型の仕様差分を吸収する場合は、この関数だけを修正する。
 */
function isArrayLike(type: Type): type is Model {
  return type.kind === 'Model' && isBuiltinArrayModel(type)
}

/**
 * TypeSpec 組込み Array<T> model の判定。
 *
 * この判定は TypeSpec 1.13.0 の semantic model を inspection test で
 * 実測して確定させる必要がある。
 *
 * 現時点では Array<T> が次の形で解決される前提である:
 * - type.kind === 'Model'
 * - model.name === 'Array'
 * - model.namespace?.name === 'TypeSpec'
 *
 * 実測結果が異なる場合は、この関数だけを修正する。
 * optional array の禁止と empty-array default の付与は、必ずこの関数を
 * 経由して判定される。
 */
function isBuiltinArrayModel(model: Model): boolean {
  return model.name === 'Array' && model.namespace?.name === 'TypeSpec'
}

/**
 * 無名 nested model の判定。
 *
 * named nested model は親の @rhfContract から追跡しない。
 * 無名 model は親の適用範囲として再帰処理する。
 *
 * TypeSpec compiler の実装や version により、anonymous Model の name は
 * 空文字列または undefined になり得るため、空文字列への完全一致ではなく
 * falsy 判定を用いる。
 *
 * TypeSpec 1.13.0 の inspection test で実際の name を確認し、
 * 必要であればこの判定だけを調整する。
 */
function isAnonymousNestedModel(type: Type): type is Model {
  return type.kind === 'Model' && !type.name
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
