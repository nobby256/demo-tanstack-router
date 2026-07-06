import type { DecoratorContext, Model } from '@typespec/compiler'

import { setExtension } from '@typespec/openapi'

import {
  getOptionValue,
  report,
  validateStringPropertyTarget,
} from './common.js'

export function $decimal(
  context: DecoratorContext,
  target: unknown,
  options?: Model,
) {
  // ✅ 共通チェック
  if (!validateStringPropertyTarget(context, target, 'decimal')) {
    return
  }

  // target はここで ModelProperty にナローイング済み
  const prop = target

  // ✅ options未指定チェック
  if (!options) {
    report(context, 'invalid-options', '@decimal: options is required', prop)
    return
  }

  const precision = getOptionValue(options, 'precision', 'Number')
  const scale = getOptionValue(options, 'scale', 'Number')

  // ✅ precisionチェック（指定されてる場合のみ）
  if (precision !== undefined && precision <= 0) {
    report(
      context,
      'invalid-precision',
      '@decimal: precision must be > 0',
      prop,
    )
    return
  }

  // ✅ scaleチェック（指定されてる場合のみ）
  if (scale !== undefined) {
    if (scale < 0) {
      report(context, 'invalid-scale', '@decimal: scale must be >= 0', prop)
      return
    }

    if (precision !== undefined && scale > precision) {
      report(
        context,
        'invalid-scale',
        '@decimal: scale must be <= precision',
        prop,
      )
      return
    }
  }

  // ✅ ZOD用 extension設定
  setExtension(context.program, prop, 'x-type', {
    kind: 'decimal',
    precision,
    scale,
  })

  // ✅ Java用 extension設定
  // https://openapi-generator.tech/docs/generators/jaxrs-spec/#supported-vendor-extensions
  if (precision !== undefined && scale !== undefined) {
    setExtension(
      context.program,
      prop,
      'x-field-extra-annotation',
      `@decimal(precision=${precision}, scale=${scale})`,
    )
  } else {
    setExtension(context.program, prop, 'x-field-extra-annotation', '@decimal')
  }
}
