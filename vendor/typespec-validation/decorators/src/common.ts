import type { DecoratorContext, Model, ModelProperty } from '@typespec/compiler'

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

  // ✅ stringチェック（型確定後 → targetをそのまま利用）
  if (!isStringType(context.program, target.type)) {
    report(
      context,
      'invalid-target-type',
      `@${decoratorName} can only be applied to string properties`,
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
