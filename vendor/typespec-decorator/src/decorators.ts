import type {
  DecoratorContext,
  Model,
  ModelProperty,
  Type,
} from '@typespec/compiler'

import {
  getRhfImplicitDefault,
  hasProcessedAnonymousModel,
  markAnonymousModelProcessed,
  reportDiagnostic,
  type RhfImplicitDefault,
  setRhfImplicitDefault,
} from './lib.js'

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
  validateOptionalLeaf(context, ownerModel, property)

  if (!hasExplicitDefault(property)) {
    const implicitDefault = getAutoDefault(property.type)

    if (implicitDefault !== undefined) {
      setDefaultIfAbsent(context, property, implicitDefault)
    }
  }

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
 */
function getDirectProperties(model: Model): Iterable<ModelProperty> {
  return Array.from(model.properties.values()).filter(
    (property) => property.model === model,
  )
}

function validateOptionalLeaf(
  context: DecoratorContext,
  ownerModel: Model,
  property: ModelProperty,
): void {
  if (!property.optional) {
    return
  }

  if (isOptionalNestedObjectModel(property.type)) {
    return
  }

  reportDiagnostic(context.program, {
    code: 'optional-leaf',
    target: property,
    format: {
      propertyName: property.name,
      modelName: getModelDisplayName(ownerModel),
    },
  })
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
 * そのため type.kind === "Model" だけで判定してはいけない。
 */
function isOptionalNestedObjectModel(type: Type): type is Model {
  return type.kind === 'Model' && !isArrayLike(type)
}

/**
 * TypeSpec 標準 @default(...) の有無。
 *
 * defaultValue が存在すれば、値の内容を確認せず、必ず明示 default を優先する。
 */
function hasExplicitDefault(property: ModelProperty): boolean {
  return property.defaultValue !== undefined
}

/**
 * 冪等性を保証する。
 *
 * - 標準 @default がある property は呼び出し側で除外済み
 * - 独自 implicit default がすでにあれば上書きしない
 */
function setDefaultIfAbsent(
  context: DecoratorContext,
  property: ModelProperty,
  value: RhfImplicitDefault,
): void {
  if (getRhfImplicitDefault(context.program, property) !== undefined) {
    return
  }

  setRhfImplicitDefault(context.program, property, value)
}

/**
 * 初期自動 default の判定箇所。
 *
 * 将来 custom scalar や alias の扱いを広げる場合は、
 * isBuiltinString / isBuiltinBoolean / isArrayLike のみを拡張する。
 */
function getAutoDefault(type: Type): RhfImplicitDefault | undefined {
  if (isBuiltinString(type)) {
    return { kind: 'string', value: '' }
  }

  if (isBuiltinBoolean(type)) {
    return { kind: 'boolean', value: false }
  }

  if (isArrayLike(type)) {
    return { kind: 'array', value: [] }
  }

  return undefined
}

/**
 * 現仕様では built-in string のみ対象。
 *
 * scalar Email extends string のような custom scalar は対象外。
 */
function isBuiltinString(type: Type): boolean {
  return type.kind === 'Scalar' && type.name === 'string'
}

/**
 * 現仕様では built-in boolean のみ対象。
 *
 * scalar FeatureFlag extends boolean のような custom scalar は対象外。
 */
function isBuiltinBoolean(type: Type): boolean {
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
  return (
    type.kind === 'Model' &&
    type.name === 'Array' &&
    type.namespace?.name === 'TypeSpec'
  )
}

/**
 * 無名 nested model の判定。
 *
 * named nested model は親の @rhfContract から追跡しない。
 * 無名 model は親の適用範囲として再帰処理する。
 */
function isAnonymousNestedModel(type: Type): type is Model {
  return type.kind === 'Model' && type.name === ''
}

function getModelDisplayName(model: Model): string {
  return model.name === '' ? '<anonymous>' : model.name
}
