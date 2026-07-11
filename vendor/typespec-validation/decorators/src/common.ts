import type {
  DecoratorContext,
  Model,
  ModelProperty,
  Program,
  Type,
} from '@typespec/compiler'

import { isStringType, NoTarget } from '@typespec/compiler'

export function report(
  context: DecoratorContext,
  code: string,
  message: string,
  target?: ModelProperty,
) {
  context.program.reportDiagnostic({
    code,
    message,
    severity: 'error',
    target: target ?? NoTarget,
  })
}

function isModelProperty(value: unknown): value is ModelProperty {
  return (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    value.kind === 'ModelProperty'
  )
}

/**
 * string、または最終要素がstringである配列かを再帰的に判定する。
 *
 * 対応例:
 *
 * - string
 * - string[]
 * - string[][]
 * - string[][][]
 *
 * 非対応例:
 *
 * - number
 * - number[]
 * - object[]
 * - stringとnumberのunion配列
 */
function isStringOrStringArray(
  program: Program,
  type: Type,
  visited = new Set<Type>(),
): boolean {
  // string
  if (isStringType(program, type)) {
    return true
  }

  // 循環的な型定義による無限再帰を防止する。
  if (visited.has(type)) {
    return false
  }

  visited.add(type)

  // Array<T>
  //
  // Tがstringであればstring[]として許可する。
  // TがさらにArray<U>であれば再帰的に終端要素を確認する。
  if (type.kind === 'Model' && type.name === 'Array' && type.indexer?.value) {
    return isStringOrStringArray(program, type.indexer.value, visited)
  }

  return false
}

export function validateStringPropertyTarget(
  context: DecoratorContext,
  target: unknown,
  decoratorName: string,
): target is ModelProperty {
  // ✅ プロパティチェック（まだ型不確定 → NoTarget）
  if (!isModelProperty(target)) {
    report(
      context,
      'invalid-target',
      `@${decoratorName} can only be applied to model properties`,
    )
    return false
  }

  // ✅ stringまたはstringの多次元配列チェック
  if (!isStringOrStringArray(context.program, target.type)) {
    report(
      context,
      'invalid-target-type',
      `@${decoratorName} can only be applied to string or string array properties`,
      target,
    )
    return false
  }

  return true
}

function getRawOption(options: Model | undefined, name: string) {
  const prop = options?.properties.get(name)

  if (!prop) {
    return undefined
  }

  return prop.type
}

type OptionKind = 'Number' | 'String'

export function getOptionValue(
  options: Model | undefined,
  name: string,
  kind: 'Number',
): number | undefined

export function getOptionValue(
  options: Model | undefined,
  name: string,
  kind: 'String',
): string | undefined

export function getOptionValue(
  options: Model | undefined,
  name: string,
  kind: OptionKind,
) {
  const t = getRawOption(options, name)

  if (!t) {
    return undefined
  }

  if (t.kind !== kind) {
    return undefined
  }

  return t.value
}
